<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    private function generateId($prefix)
    {
        return $prefix . '_' . str_replace('.', '', (string)microtime(true));
    }

    private function getClientId(Request $request)
    {
        $raw = $request->header('x-xapps-client-id');
        return $raw ? trim($raw) : 'xconectc';
    }

    private function getUserEmail(Request $request)
    {
        $raw = $request->header('x-xapps-user-email');
        return $raw ? trim($raw) : 'daniel.vladescu@gmail.com';
    }

    public function index(Request $request)
    {
        // For Laravel tenant, we can use projects too or just inventory.
        // Let's implement projects for parity first.
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $page = (int)($request->query('page', 1));
        $pageSize = (int)($request->query('pageSize', 20));
        if ($page < 1) $page = 1;
        if ($pageSize < 1) $pageSize = 20;

        $total = DB::table('projects')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->count();

        $items = DB::table('projects')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->orderBy('created_at', 'desc')
            ->offset(($page - 1) * $pageSize)
            ->limit($pageSize)
            ->get();

        return response()->json(array(
            'items' => $items,
            'pagination' => array(
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize,
                'totalPages' => (int)ceil($total / $pageSize)
            )
        ));
    }

    public function createProject(Request $request)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $body = $request->all();
        $id = $this->generateId('proj');
        $createdAt = gmdate('c');

        $project = array(
            'client_id' => $clientId,
            'user_email' => $userEmail,
            'id' => $id,
            'name' => isset($body['name']) ? $body['name'] : 'Untitled Project',
            'status' => isset($body['status']) ? $body['status'] : 'draft',
            'owner' => isset($body['owner']) ? $body['owner'] : $userEmail,
            'created_at' => $createdAt,
        );

        DB::table('projects')->insert($project);

        return response()->json(array(
            'id' => $project['id'],
            'name' => $project['name'],
            'status' => $project['status'],
            'owner' => $project['owner'],
            'created_at' => $project['created_at'],
        ), 201);
    }

    public function getProject(Request $request, $id)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $project = DB::table('projects')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->where('id', $id)
            ->first();

        if (!$project) {
            return response()->json(array('message' => 'Project not found'), 404);
        }

        return response()->json($project);
    }

    public function updateProject(Request $request, $id)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);
        $body = $request->all();

        $project = DB::table('projects')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->where('id', $id)
            ->first();
        if (!$project) {
            return response()->json(array('message' => 'Project not found'), 404);
        }

        $patch = array();
        if (isset($body['name'])) $patch['name'] = $body['name'];
        if (isset($body['owner'])) $patch['owner'] = $body['owner'];
        if (isset($body['status'])) $patch['status'] = $body['status'];
        if (!empty($patch)) {
            DB::table('projects')
                ->where('client_id', $clientId)
                ->where('id', $id)
                ->update($patch);
        }

        $updated = DB::table('projects')
            ->where('client_id', $clientId)
            ->where('id', $id)
            ->first();
        return response()->json($updated);
    }

    public function profile(Request $request)
    {
        $clientId = $this->getClientId($request);
        return response()->json(array(
            'id' => 'laravel_user_456',
            'email' => 'daniel.vladescu@gmail.com',
            'name' => 'Daniel Vladescu (Laravel)',
            'roles' => array('admin', 'developer'),
            'company' => 'XconectC Demo',
            'clientId' => $clientId
        ));
    }

    public function billing(Request $request)
    {
        $clientId = $this->getClientId($request);
        return response()->json(array(
            'clientId' => $clientId,
            'balance' => 2500.0,
            'currency' => 'EUR',
            'status' => 'active',
            'next_billing_date' => '2026-03-01T00:00:00Z',
            'recent_invoices' => array(
                array('id' => 'inv_l_001', 'amount' => 100.0, 'date' => '2026-02-01', 'status' => 'paid')
            )
        ));
    }

    public function issues(Request $request)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $page = (int)($request->query('page', 1));
        $pageSize = (int)($request->query('pageSize', 20));
        if ($page < 1) $page = 1;
        if ($pageSize < 1) $pageSize = 20;

        $query = DB::table('issues')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail);

        $projectId = $request->query('projectId', null);
        if ($projectId) {
            $query = $query->where('project_id', $projectId);
        }

        $total = (clone $query)->count();

        $items = $query
            ->orderBy('created_at', 'desc')
            ->offset(($page - 1) * $pageSize)
            ->limit($pageSize)
            ->get();

        return response()->json(array(
            'items' => $items,
            'pagination' => array(
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize,
                'totalPages' => (int)ceil($total / $pageSize)
            )
        ));
    }

    public function createIssue(Request $request)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $body = $request->all();
        $id = $this->generateId('iss');
        $createdAt = gmdate('c');

        $projectId = null;
        if (isset($body['projectId'])) {
            $projectId = $body['projectId'];
        } elseif (isset($body['project_id'])) {
            $projectId = $body['project_id'];
        }

        $issue = array(
            'client_id' => $clientId,
            'user_email' => $userEmail,
            'id' => $id,
            'project_id' => $projectId,
            'title' => isset($body['title']) ? $body['title'] : 'Untitled Issue',
            'description' => isset($body['description']) ? $body['description'] : '',
            'status' => isset($body['status']) ? $body['status'] : 'open',
            'created_at' => $createdAt,
        );

        DB::table('issues')->insert($issue);

        return response()->json(array(
            'id' => $issue['id'],
            'project_id' => $issue['project_id'],
            'title' => $issue['title'],
            'description' => $issue['description'],
            'status' => $issue['status'],
            'created_at' => $issue['created_at'],
        ), 201);
    }

    public function getIssue(Request $request, $id)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $issue = DB::table('issues')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->where('id', $id)
            ->first();
        if (!$issue) {
            return response()->json(array('message' => 'Issue not found'), 404);
        }

        return response()->json($issue);
    }

    public function updateIssue(Request $request, $id)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);
        $body = $request->all();

        $issue = DB::table('issues')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->where('id', $id)
            ->first();
        if (!$issue) {
            return response()->json(array('message' => 'Issue not found'), 404);
        }

        $patch = array();
        if (isset($body['title'])) $patch['title'] = $body['title'];
        if (isset($body['description'])) $patch['description'] = $body['description'];
        if (isset($body['status'])) $patch['status'] = $body['status'];
        if (isset($body['projectId'])) $patch['project_id'] = $body['projectId'];
        if (!empty($patch)) {
            DB::table('issues')
                ->where('client_id', $clientId)
                ->where('id', $id)
                ->update($patch);
        }

        $updated = DB::table('issues')
            ->where('client_id', $clientId)
            ->where('id', $id)
            ->first();
        return response()->json($updated);
    }

    public function listComments(Request $request, $id)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $page = (int)($request->query('page', 1));
        $pageSize = (int)($request->query('pageSize', 20));
        if ($page < 1) $page = 1;
        if ($pageSize < 1) $pageSize = 20;

        $total = DB::table('issue_comments')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->where('issue_id', $id)
            ->count();

        $items = DB::table('issue_comments')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->where('issue_id', $id)
            ->orderBy('created_at', 'desc')
            ->offset(($page - 1) * $pageSize)
            ->limit($pageSize)
            ->get();

        return response()->json(array(
            'items' => $items,
            'pagination' => array(
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize,
                'totalPages' => (int)ceil($total / $pageSize)
            )
        ));
    }

    public function createComment(Request $request, $id)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);
        $body = $request->all();

        $text = null;
        if (isset($body['text'])) $text = $body['text'];
        if (!$text && isset($body['body'])) $text = $body['body'];
        if (!$text) $text = '';

        $comment = array(
            'client_id' => $clientId,
            'user_email' => $userEmail,
            'id' => $this->generateId('com'),
            'issue_id' => $id,
            'author' => $userEmail,
            'body' => $text,
            'created_at' => gmdate('c'),
        );

        DB::table('issue_comments')->insert($comment);

        return response()->json($comment, 201);
    }
}
