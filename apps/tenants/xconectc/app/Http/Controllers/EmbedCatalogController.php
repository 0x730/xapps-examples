<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Xapps\GatewayClient;

class EmbedCatalogController extends Controller
{
    private function gatewayUrl()
    {
        return rtrim(env('XAPPS_GATEWAY_URL', 'http://localhost:3000'), '/');
    }

    private function apiKey()
    {
        return (string) env('XAPPS_API_KEY', '');
    }

    private function publisherApiUrl()
    {
        return rtrim((string) env('PUBLISHER_API_URL', 'http://localhost:3002'), '/');
    }

    private function requireApiKey()
    {
        if (!$this->apiKey()) {
            return response()->json(array('message' => 'XAPPS_API_KEY not configured'), 501);
        }
        return null;
    }

    private function gatewayClient()
    {
        return new GatewayClient($this->gatewayUrl(), $this->apiKey(), 20);
    }

    private function proxyJsonResponse(array $result)
    {
        $contentType = 'application/json';
        if (isset($result['headers']['content-type']) && is_string($result['headers']['content-type'])) {
            $contentType = $result['headers']['content-type'];
        }

        return response((string) ($result['body'] ?? ''), (int) ($result['status'] ?? 500))
            ->header('Content-Type', $contentType);
    }

    public function singlePanel(Request $request)
    {
        $user = Auth::user();
        $userEmail = $user ? $user->email : null;
        $userName = $user ? $user->name : null;
        return view('catalog-single-panel', array(
            'user' => $user,
            'userName' => $userName,
            'userEmail' => $userEmail,
            'appUrl' => rtrim((string) env('APP_URL', 'http://localhost:8001'), '/'),
        ));
    }

    public function resolveSubject(Request $request)
    {
        $err = $this->requireApiKey();
        if ($err) return $err;

        $email = trim((string) $request->input('email', ''));
        if (!$email) {
            return response()->json(array('message' => 'email is required'), 400);
        }

        $payload = array(
            'type' => 'user',
            'identifier' => array('idType' => 'email', 'value' => $email, 'hint' => $email),
            'email' => $email,
        );

        return $this->proxyJsonResponse(
            $this->gatewayClient()->post('/v1/subjects/resolve', $payload)
        );
    }

    public function createCatalogSession(Request $request)
    {
        $err = $this->requireApiKey();
        if ($err) return $err;

        $origin = (string) $request->input('origin', '');
        if (!$origin) {
            return response()->json(array('message' => 'origin is required'), 400);
        }

        $payload = array(
            'origin' => $origin,
        );
        if ($request->filled('subjectId')) $payload['subjectId'] = (string) $request->input('subjectId');
        if ($request->filled('xappId')) $payload['xappId'] = (string) $request->input('xappId');
        if (is_array($request->input('publishers'))) $payload['publishers'] = $request->input('publishers');
        if (is_array($request->input('tags'))) $payload['tags'] = $request->input('tags');

        return $this->proxyJsonResponse(
            $this->gatewayClient()->post('/v1/catalog-sessions', $payload)
        );
    }

    public function createWidgetSession(Request $request)
    {
        $err = $this->requireApiKey();
        if ($err) return $err;

        $installationId = (string) $request->input('installationId', '');
        $widgetId = (string) $request->input('widgetId', '');
        $origin = (string) $request->input('origin', '');
        $subjectId = $request->filled('subjectId') ? (string) $request->input('subjectId') : null;
        $hostReturnUrl = trim((string) ($request->input('hostReturnUrl', $request->input('host_return_url', $request->headers->get('referer', '')))));

        if (!$installationId || !$widgetId || !$origin) {
            return response()->json(array('message' => 'installationId, widgetId and origin are required'), 400);
        }

        $payload = array(
            'installationId' => $installationId,
            'widgetId' => $widgetId,
        );
        if ($subjectId) $payload['subjectId'] = $subjectId;
        if ($hostReturnUrl) $payload['hostReturnUrl'] = $hostReturnUrl;

        $result = $this->gatewayClient()->post('/v1/widget-sessions', $payload, array('Origin' => $origin));

        if ($hostReturnUrl && is_array($result['json']) && isset($result['json']['embedUrl']) && is_string($result['json']['embedUrl'])) {
            try {
                $embedUrl = (string) $result['json']['embedUrl'];
                $parts = parse_url($embedUrl);
                $query = array();
                parse_str((string) ($parts['query'] ?? ''), $query);
                $query['xapps_host_return_url'] = $hostReturnUrl;
                $scheme = isset($parts['scheme']) ? ($parts['scheme'] . '://') : '';
                $user = isset($parts['user']) ? $parts['user'] : '';
                $pass = isset($parts['pass']) ? (':' . $parts['pass']) : '';
                $auth = $user ? ($user . $pass . '@') : '';
                $host = $parts['host'] ?? '';
                $port = isset($parts['port']) ? (':' . $parts['port']) : '';
                $path = $parts['path'] ?? '';
                $fragment = isset($parts['fragment']) ? ('#' . $parts['fragment']) : '';
                $result['json']['embedUrl'] = $scheme . $auth . $host . $port . $path . '?' . http_build_query($query) . $fragment;
                $result['body'] = json_encode($result['json']);
            } catch (\Throwable $e) {
                // keep upstream embedUrl unchanged if parse fails
            }
        }

        return $this->proxyJsonResponse($result);
    }

    public function bridgeTokenRefresh(Request $request)
    {
        $err = $this->requireApiKey();
        if ($err) return $err;

        $installationId = (string) $request->input('installationId', '');
        $widgetId = (string) $request->input('widgetId', '');
        $origin = (string) $request->input('origin', '');
        $subjectId = $request->filled('subjectId') ? (string) $request->input('subjectId') : null;
        $hostReturnUrl = trim((string) ($request->input('hostReturnUrl', $request->input('host_return_url', $request->headers->get('referer', '')))));

        if (!$installationId || !$widgetId || !$origin) {
            return response()->json(array('message' => 'installationId, widgetId and origin are required'), 400);
        }

        $payload = array(
            'installationId' => $installationId,
            'widgetId' => $widgetId,
        );
        if ($subjectId) $payload['subjectId'] = $subjectId;
        if ($hostReturnUrl) $payload['hostReturnUrl'] = $hostReturnUrl;

        $result = $this->gatewayClient()->post('/v1/widget-sessions', $payload, array('Origin' => $origin));
        if ((int) ($result['status'] ?? 500) >= 400) {
            return $this->proxyJsonResponse($result);
        }

        $token = is_array($result['json']) && isset($result['json']['token']) ? (string) $result['json']['token'] : '';
        if (!$token) {
            return response()->json(array('message' => 'Gateway did not return a token'), 502);
        }

        return response()->json(array('token' => $token, 'expires_in' => 900));
    }

    public function bridgeSign(Request $request)
    {
        $body = $request->all();
        if (is_array($body) && isset($body['envelope']) && is_array($body['envelope'])) {
            return response()->json(array('ok' => true, 'envelope' => $body['envelope']));
        }
        return response()->json(array(
            'message' => 'Signing is not configured in xconectc. Provide envelope in request body or wire a signer.',
        ), 501);
    }

    public function bridgeVendorAssertion(Request $request)
    {
        $body = $request->all();
        $portalToken = trim((string) ($body['portalToken'] ?? ''));
        $publisherId = trim((string) ($body['publisherId'] ?? $body['publisher_id'] ?? ''));
        $publisherUserId = trim((string) ($body['publisherUserId'] ?? $body['publisher_user_id'] ?? ''));
        $scopes = isset($body['scopes']) && is_array($body['scopes']) ? $body['scopes'] : array();
        $linkRequired = (bool) ($body['link_required'] ?? $body['linkRequired'] ?? true);
        $exchangeRequired = (bool) ($body['exchange_required'] ?? $body['exchangeRequired'] ?? false);

        if (!$portalToken) {
            return response()->json(array('message' => 'portalToken is required'), 400);
        }
        if (!$publisherId) {
            return response()->json(array('message' => 'publisherId is required'), 400);
        }

        $bridgeTokenResp = Http::withHeaders(array(
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $portalToken,
        ))->post($this->gatewayUrl() . '/v1/publisher/bridge/token', array(
            'publisher_id' => $publisherId,
            'scopes' => $scopes,
            'link_required' => $linkRequired,
        ));

        $bridgeTokenData = $bridgeTokenResp->json();
        if (!$bridgeTokenResp->ok()) {
            return response()->json($bridgeTokenData ?: array('message' => 'bridge token failed'), $bridgeTokenResp->status());
        }

        $vendorAssertion = trim((string) ($bridgeTokenData['vendor_assertion'] ?? ''));
        if (!$vendorAssertion) {
            return response()->json(array('message' => 'Gateway response missing vendor_assertion', 'code' => 'BAD_GATEWAY'), 502);
        }

        $exchangeResp = Http::withHeaders(array('Content-Type' => 'application/json'))
            ->post($this->publisherApiUrl() . '/xapps/bridge/exchange', array_merge(
                array('vendor_assertion' => $vendorAssertion),
                $publisherUserId ? array('publisher_user_id' => $publisherUserId) : array()
            ));
        $exchangeData = $exchangeResp->json();

        if (!$exchangeResp->ok()) {
            if ($exchangeRequired) {
                return response()->json($exchangeData ?: array('message' => 'publisher exchange failed'), $exchangeResp->status());
            }
            return response()->json(array_merge($bridgeTokenData, array(
                'publisher_session' => null,
                'publisher_session_error' =>
                    (is_array($exchangeData) && isset($exchangeData['message']) ? $exchangeData['message'] : null)
                    ?: ('publisher exchange failed (' . $exchangeResp->status() . ')'),
            )));
        }

        return response()->json(array_merge($bridgeTokenData, array(
            'publisher_session' => $exchangeData,
        )));
    }

    public function bridgePublisherSessionMe(Request $request)
    {
        $body = $request->all();
        $sessionToken = trim((string) ($body['sessionToken'] ?? $body['session_token'] ?? ''));
        if (!$sessionToken) {
            return response()->json(array('message' => 'sessionToken is required'), 400);
        }

        $resp = Http::withHeaders(array(
            'Authorization' => 'Bearer ' . $sessionToken,
        ))->get($this->publisherApiUrl() . '/xapps/session/me');
        return response()->json($resp->json() ?: array(), $resp->status());
    }

    public function bridgePublisherSessionLogout(Request $request)
    {
        $body = $request->all();
        $sessionToken = trim((string) ($body['sessionToken'] ?? $body['session_token'] ?? ''));
        if (!$sessionToken) {
            return response()->json(array('message' => 'sessionToken is required'), 400);
        }

        $resp = Http::withHeaders(array(
            'Authorization' => 'Bearer ' . $sessionToken,
        ))->post($this->publisherApiUrl() . '/xapps/session/logout');
        return response()->json($resp->json() ?: array(), $resp->status());
    }

    public function listInstallations()
    {
        $err = $this->requireApiKey();
        if ($err) return $err;

        $subjectId = request()->filled('subjectId') ? (string) request()->input('subjectId') : null;

        return $this->proxyJsonResponse(
            $this->gatewayClient()->get('/v1/installations', $subjectId ? array('subjectId' => $subjectId) : array())
        );
    }

    public function install(Request $request)
    {
        $err = $this->requireApiKey();
        if ($err) return $err;

        $xappId = (string) $request->input('xappId', '');
        $termsAccepted = (bool) $request->input('termsAccepted', false);
        $subjectId = $request->filled('subjectId') ? (string) $request->input('subjectId') : null;
        if (!$xappId) return response()->json(array('message' => 'xappId is required'), 400);

        return $this->proxyJsonResponse($this->gatewayClient()->post('/v1/installations' . ($subjectId ? ('?subjectId=' . rawurlencode($subjectId)) : ''), array(
            'xappId' => $xappId,
            'termsAccepted' => $termsAccepted,
        )));
    }

    public function update(Request $request)
    {
        $err = $this->requireApiKey();
        if ($err) return $err;

        $installationId = (string) $request->input('installationId', '');
        $termsAccepted = (bool) $request->input('termsAccepted', false);
        $subjectId = $request->filled('subjectId') ? (string) $request->input('subjectId') : null;
        if (!$installationId) return response()->json(array('message' => 'installationId is required'), 400);

        $path = '/v1/installations/' . rawurlencode($installationId) . '/update';
        if ($subjectId) {
            $path .= '?subjectId=' . rawurlencode($subjectId);
        }

        return $this->proxyJsonResponse($this->gatewayClient()->post($path, array(
            'termsAccepted' => $termsAccepted,
        )));
    }

    public function uninstall(Request $request)
    {
        $err = $this->requireApiKey();
        if ($err) return $err;

        // Be defensive about payload shape: different host adapters may send
        // `installationId`, `installation_id`, or even a plain `id`.
        $installationId = (string) $request->input('installationId', '');
        if (!$installationId) $installationId = (string) $request->input('installation_id', '');
        if (!$installationId) $installationId = (string) $request->input('id', '');
        $subjectId = $request->filled('subjectId') ? (string) $request->input('subjectId') : null;
        if (!$installationId) return response()->json(array('message' => 'installationId is required'), 400);

        $path = '/v1/installations/' . rawurlencode($installationId);
        if ($subjectId) {
            $path .= '?subjectId=' . rawurlencode($subjectId);
        }

        return $this->proxyJsonResponse($this->gatewayClient()->delete($path));
    }
}
