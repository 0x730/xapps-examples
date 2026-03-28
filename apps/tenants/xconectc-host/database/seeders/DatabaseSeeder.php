<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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

    }
}
