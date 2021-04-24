<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use \App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();
        $user = new User();
        $user->name = 'testname';
        $user->email = 'test@mail.com';
        $user->password = Hash::make('testpassword');
        $user->save();

        $user = new User();
        $user->name = 'testname2';
        $user->email = 'test2@mail.com';
        $user->password = Hash::make('testpassword');
        $user->save();
    }
}
