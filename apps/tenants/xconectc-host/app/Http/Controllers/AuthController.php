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
            $regMsg = $registered ? '<div style="background: #d1fae5; color: #065f46; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; text-align: center; font-size: 0.875rem;">Registration successful! You can now sign in.</div>' : '';
            return response('
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Mock Login (XconectC Host - Laravel)</title>
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
                        .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
                        h1 { font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; color: #ff2d20; }
                        .form-group { margin-bottom: 1rem; }
                        label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
                        input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
                        button { width: 100%; padding: 0.75rem; background: #ff2d20; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
                        button:hover { background: #e02a1d; }
                        .footer { margin-top: 1rem; text-align: center; font-size: 0.8rem; color: #666; }
                        .reg-link { display: block; text-align: center; margin-top: 1rem; color: #ff2d20; text-decoration: none; font-size: 0.875rem; }
                        .reg-link:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Login to XconectC Host</h1>
                        '.$regMsg.'
                        <form method="POST" action="/auth/login">
                            <input type="hidden" name="redirect_uri" value="'.$redirectUri.'">
                            <input type="hidden" name="state" value="'.$state.'">
                            <input type="hidden" name="client_id" value="'.$clientId.'">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value="daniel.vladescu@gmail.com" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" value="password" required>
                            </div>
                            <button type="submit">Sign In</button>
                        </form>
                        <a href="/auth/register?redirect_uri='.urlencode($redirectUri).'&state='.urlencode($state).'&client_id='.urlencode($clientId).'" class="reg-link">Don\'t have an account? Register</a>
                        <div class="footer">Laravel-powered Identity Provider.</div>
                    </div>
                </body>
                </html>
            ');
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
            $errMsg = '';
            if ($error === 'exists') $errMsg = '<div style="background: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; text-align: center; font-size: 0.875rem;">Email already registered.</div>';
            if ($error === 'failed') $errMsg = '<div style="background: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; text-align: center; font-size: 0.875rem;">Registration failed.</div>';

            return response('
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Register (XconectC Host - Laravel)</title>
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
                        .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
                        h1 { font-size: 1.5rem; margin-bottom: 1.5rem; text-align: center; color: #ff2d20; }
                        .form-group { margin-bottom: 1rem; }
                        label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
                        input { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
                        button { width: 100%; padding: 0.75rem; background: #ff2d20; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
                        button:hover { background: #e02a1d; }
                        .footer { margin-top: 1rem; text-align: center; font-size: 0.8rem; color: #666; }
                        .login-link { display: block; text-align: center; margin-top: 1rem; color: #ff2d20; text-decoration: none; font-size: 0.875rem; }
                        .login-link:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Register for XconectC Host</h1>
                        '.$errMsg.'
                        <form method="POST" action="/auth/register">
                            <input type="hidden" name="redirect_uri" value="'.$redirectUri.'">
                            <input type="hidden" name="state" value="'.$state.'">
                            <input type="hidden" name="client_id" value="'.$clientId.'">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" name="name" placeholder="Your Name" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" placeholder="email@example.com" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" required>
                            </div>
                            <button type="submit">Create Account</button>
                        </form>
                        <a href="/auth/login?redirect_uri='.urlencode($redirectUri).'&state='.urlencode($state).'&client_id='.urlencode($clientId).'" class="login-link">Already have an account? Sign in</a>
                        <div class="footer">Join our platform today.</div>
                    </div>
                </body>
                </html>
            ');
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

            $issuer = env('IDP_BASE_URL', rtrim((string) env('APP_URL', 'http://localhost:8002'), '/') . '/api');

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
        $baseUrl = env('IDP_BASE_URL', rtrim((string) env('APP_URL', 'http://localhost:8002'), '/') . '/api');
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
