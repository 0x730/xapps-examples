<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run()
    {
        // XconectC Host mock IdP demo user (matches the prefilled login form)
        User::updateOrCreate(
            array('email' => 'daniel.vladescu@gmail.com'),
            array(
                'id' => (string)\Illuminate\Support\Str::ulid(),
                'name' => 'Daniel Vladescu',
                'password' => Hash::make('password'),
            )
        );

        // Seed some demo data for the XconectC Host dashboard + API parity validation.
        $clientId = 'xconectc-host';
        $userEmail = 'daniel.vladescu@gmail.com';
        $now = gmdate('c');

        // Projects
        $projects = array(
            array(
                'client_id' => $clientId,
                'user_email' => $userEmail,
                'id' => 'proj_seed_001',
                'name' => 'XconectC Host - Onboarding',
                'status' => 'active',
                'owner' => $userEmail,
                'created_at' => $now,
            ),
            array(
                'client_id' => $clientId,
                'user_email' => $userEmail,
                'id' => 'proj_seed_002',
                'name' => 'Marketplace Integration',
                'status' => 'draft',
                'owner' => $userEmail,
                'created_at' => $now,
            ),
        );
        foreach ($projects as $p) {
            DB::table('projects')->updateOrInsert(
                array('client_id' => $p['client_id'], 'id' => $p['id']),
                $p
            );
        }

        // Issues
        $issues = array(
            array(
                'client_id' => $clientId,
                'user_email' => $userEmail,
                'id' => 'iss_seed_001',
                'project_id' => 'proj_seed_001',
                'title' => 'First login succeeds but callback needs token exchange',
                'description' => 'Verify OIDC discovery + token exchange end-to-end.',
                'status' => 'open',
                'created_at' => $now,
            ),
            array(
                'client_id' => $clientId,
                'user_email' => $userEmail,
                'id' => 'iss_seed_002',
                'project_id' => 'proj_seed_002',
                'title' => 'Inventory list pagination',
                'description' => 'Ensure page/pageSize behave like x-api.',
                'status' => 'resolved',
                'created_at' => $now,
            ),
        );
        foreach ($issues as $i) {
            DB::table('issues')->updateOrInsert(
                array('client_id' => $i['client_id'], 'id' => $i['id']),
                $i
            );
        }

        // Issue comments
        $comments = array(
            array(
                'client_id' => $clientId,
                'user_email' => $userEmail,
                'id' => 'com_seed_001',
                'issue_id' => 'iss_seed_001',
                'author' => $userEmail,
                'body' => 'Investigating token exchange sequence for tenant B.',
                'created_at' => $now,
            ),
            array(
                'client_id' => $clientId,
                'user_email' => $userEmail,
                'id' => 'com_seed_002',
                'issue_id' => 'iss_seed_002',
                'author' => $userEmail,
                'body' => 'Pagination parity validated against x-api behavior.',
                'created_at' => $now,
            ),
        );
        foreach ($comments as $c) {
            DB::table('issue_comments')->updateOrInsert(
                array('client_id' => $c['client_id'], 'id' => $c['id']),
                $c
            );
        }

        // Inventory
        $inventory = array(
            array(
                'client_id' => $clientId,
                'user_email' => $userEmail,
                'id' => 'inv_seed_001',
                'sku' => 'TB-SKU-001',
                'name' => 'XconectC Host Widget',
                'quantity' => 12,
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ),
            array(
                'client_id' => $clientId,
                'user_email' => $userEmail,
                'id' => 'inv_seed_002',
                'sku' => 'TB-SKU-002',
                'name' => 'XconectC Host Cable',
                'quantity' => 50,
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ),
        );
        foreach ($inventory as $it) {
            DB::table('inventory_items')->updateOrInsert(
                array('client_id' => $it['client_id'], 'id' => $it['id']),
                $it
            );
        }
    }
}
