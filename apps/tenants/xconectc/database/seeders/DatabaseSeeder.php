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
        $demoUsers = array(
            array(
                'email' => 'daniel.vladescu@gmail.com',
                'name' => 'Daniel Vladescu',
            ),
            array(
                'email' => 'sergiu@ludo.com',
                'name' => 'Sergiu Ludo',
            ),
        );

        foreach ($demoUsers as $demoUser) {
            User::updateOrCreate(
                array('email' => $demoUser['email']),
                array(
                    'id' => (string)\Illuminate\Support\Str::ulid(),
                    'name' => $demoUser['name'],
                    'password' => Hash::make('password'),
                )
            );
        }
    }
}
