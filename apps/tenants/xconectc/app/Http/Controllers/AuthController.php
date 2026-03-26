<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    private $privateKey;

    public function __construct()
    {
        $path = base_path('storage/idp_private.pem');
        if (file_exists($path)) {
            $this->privateKey = file_get_contents($path);
        }
    }

    public function login(Request $request)
    {
        $redirectUri = $request->input('redirect_uri', $request->query('redirect_uri'));
        $state = $request->input('state', $request->query('state'));
        $clientId = $request->input('client_id', $request->query('client_id'));
        $registered = $request->query('registered');

        if ($request->isMethod('get')) {
            return view('auth.form', array(
                'mode' => 'login',
                'title' => 'Sign in to XconectC',
                'subtitle' => 'Access the tenant workspace, embedded catalog, and OIDC sample lane from a lighter auth surface.',
                'messageType' => $registered ? 'success' : null,
                'messageText' => $registered ? 'Registration successful. You can sign in now.' : null,
                'redirectUri' => $redirectUri,
                'state' => $state,
                'clientId' => $clientId,
                'emailDefault' => 'daniel.vladescu@gmail.com',
                'passwordDefault' => 'password',
            ));
        }

        $userRecord = DB::table('users')->where('email', $request->input('email'))->first();

        if (!$userRecord || !Hash::check($request->input('password'), $userRecord->password)) {
            return response('Unauthorized', 401);
        }

        // Establish session
        $user = User::find($userRecord->id);
        if ($user) {
            Auth::login($user);
        }

        $code = base64_encode(json_encode(array(
            'userId' => $userRecord->id,
            'exp' => time() + 600
        )));

        if (!$redirectUri) {
            return redirect('/dashboard');
        }

        $url = $redirectUri;
        $separator = (strpos($url, '?') !== false) ? '&' : '?';

        $finalUrl = $url . $separator . "code=" . $code;
        if ($state) {
            $finalUrl .= "&state=" . $state;
        }

        return redirect($finalUrl);
    }

    public function register(Request $request)
    {
        $redirectUri = $request->input('redirect_uri', $request->query('redirect_uri'));
        $state = $request->input('state', $request->query('state'));
        $clientId = $request->input('client_id', $request->query('client_id'));

        if ($request->isMethod('get')) {
            $error = $request->query('error');
            $messageText = null;
            if ($error === 'exists') $messageText = 'That email is already registered.';
            if ($error === 'failed') $messageText = 'Registration failed. Try again.';

            return view('auth.form', array(
                'mode' => 'register',
                'title' => 'Create your XconectC account',
                'subtitle' => 'Join the sample tenant lane and continue into the same workspace used by the embedded catalog and tenant APIs.',
                'messageType' => $messageText ? 'error' : null,
                'messageText' => $messageText,
                'redirectUri' => $redirectUri,
                'state' => $state,
                'clientId' => $clientId,
            ));
        }

        $email = $request->input('email');
        $existing = DB::table('users')->where('email', $email)->first();
        if ($existing) {
            return redirect('/auth/register?error=exists&redirect_uri='.urlencode($redirectUri).'&state='.urlencode($state).'&client_id='.urlencode($clientId));
        }

        try {
            DB::table('users')->insert(array(
                'id' => (string)\Illuminate\Support\Str::ulid(),
                'name' => $request->input('name'),
                'email' => $email,
                'password' => Hash::make($request->input('password')),
                'created_at' => now(),
            ));

            return redirect('/auth/login?registered=1&redirect_uri='.urlencode($redirectUri).'&state='.urlencode($state).'&client_id='.urlencode($clientId));
        } catch (\Exception $e) {
            return redirect('/auth/register?error=failed&redirect_uri='.urlencode($redirectUri).'&state='.urlencode($state).'&client_id='.urlencode($clientId));
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/dashboard');
    }

    public function token(Request $request)
    {
        if ($request->input('grant_type') !== 'authorization_code') {
            return response()->json(array('error' => 'unsupported_grant_type'), 400);
        }

        try {
            $payload = json_decode(base64_decode($request->input('code')), true);
            if ($payload['exp'] < time()) {
                return response()->json(array('error' => 'invalid_grant', 'message' => 'Code expired'), 400);
            }

            $user = DB::table('users')->where('id', $payload['userId'])->first();
            if (!$user) {
                return response()->json(array('error' => 'invalid_grant', 'message' => 'User not found'), 400);
            }

            $issuer = env('IDP_BASE_URL', rtrim((string) env('APP_URL', 'http://localhost:8001'), '/') . '/api');

            $tokenPayload = array(
                'sub' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'iss' => $issuer,
                'aud' => 'xapps-platform',
                'iat' => time(),
                'exp' => time() + 7200
            );

            $jwt = JWT::encode($tokenPayload, $this->privateKey, 'RS256', 'mock-key-b');

            return response()->json(array(
                'access_token' => $jwt,
                'token_type' => 'Bearer',
                'expires_in' => 7200
            ));
        } catch (\Exception $e) {
            return response()->json(array('error' => 'invalid_grant', 'message' => 'Invalid code'), 400);
        }
    }

    public function openidConfiguration()
    {
        $baseUrl = env('IDP_BASE_URL', rtrim((string) env('APP_URL', 'http://localhost:8001'), '/') . '/api');
        return response()->json(array(
            'issuer' => $baseUrl,
            'authorization_endpoint' => $baseUrl . '/auth/login',
            'token_endpoint' => $baseUrl . '/auth/token',
            'jwks_uri' => $baseUrl . '/.well-known/jwks.json',
            'response_types_supported' => array('code'),
            'subject_types_supported' => array('public'),
            'id_token_signing_alg_values_supported' => array('RS256')
        ));
    }

    private function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function buildPublicJwk()
    {
        if (!$this->privateKey) {
            throw new \RuntimeException('Missing private key');
        }

        $key = openssl_pkey_get_private($this->privateKey);
        if (!$key) {
            throw new \RuntimeException('Invalid private key');
        }

        $details = openssl_pkey_get_details($key);
        if (!$details || !isset($details['rsa']['n'], $details['rsa']['e'])) {
            throw new \RuntimeException('Unable to extract RSA public key details');
        }

        return array(
            'kty' => 'RSA',
            'kid' => 'mock-key-b',
            'use' => 'sig',
            'alg' => 'RS256',
            'n' => $this->base64UrlEncode($details['rsa']['n']),
            'e' => $this->base64UrlEncode($details['rsa']['e']),
        );
    }

    public function jwks()
    {
        // Real JWKS derived from the PEM used to sign tokens (so Platform `/auth/exchange` can verify).
        try {
            return response()->json(array(
                'keys' => array(
                    $this->buildPublicJwk(),
                ),
            ));
        } catch (\Exception $e) {
            return response()->json(array('error' => 'jwks_unavailable', 'message' => $e->getMessage()), 500);
        }
    }
}
