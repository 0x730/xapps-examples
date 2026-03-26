<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    private function getClientId(Request $request)
    {
        $raw = $request->header('x-xapps-client-id');
        return $raw ? trim($raw) : 'xconectc-host';
    }

    private function getUserEmail(Request $request)
    {
        $raw = $request->header('x-xapps-user-email');
        return $raw ? trim($raw) : 'daniel.vladescu@gmail.com';
    }

    public function index(Request $request)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $page = (int)($request->query('page', 1));
        $pageSize = (int)($request->query('pageSize', 20));
        if ($page < 1) $page = 1;
        if ($pageSize < 1) $pageSize = 20;

        $total = DB::table('inventory_items')
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->count();

        $items = DB::table('inventory_items')
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

    public function show($id, Request $request)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $item = DB::table('inventory_items')
            ->where('id', $id)
            ->where('client_id', $clientId)
            ->where('user_email', $userEmail)
            ->first();

        if (!$item) {
            return response()->json(array('message' => 'Item not found'), 404);
        }

        return response()->json($item);
    }

    public function store(Request $request)
    {
        $clientId = $this->getClientId($request);
        $userEmail = $this->getUserEmail($request);

        $id = 'inv_' . bin2hex(random_bytes(5));
        $data = array(
            'id' => $id,
            'client_id' => $clientId,
            'user_email' => $userEmail,
            'sku' => $request->input('sku'),
            'name' => $request->input('name'),
            'quantity' => (int) $request->input('quantity', 0),
            'status' => 'available',
            'created_at' => date('c'),
            'updated_at' => date('c'),
        );

        DB::table('inventory_items')->insert($data);

        return response()->json($data, 201);
    }
}
