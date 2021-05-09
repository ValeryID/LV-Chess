<?php

namespace App\Http\Controllers;

use \Illuminate\Http\Request;
use \Illuminate\Support\Facades\Auth;
use \Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller//$request->user()
{
    public function authenticate(Request $request)
    {
        $email = $request->input('email', '');
        $password = $request->input('password', '');

        $user = User::where('email', $email)->first();
        
        if ($user && Hash::check($password, $user->password)) {
            Auth::login($user);
            
            return response($user->getCard());
        }

        return response(['reason' => $user ? 'password' : 'email'], 403);
    }
    
    public function discard()
    {
        Auth::logout();
        
        return response('success');
    }

    public function test(Request $request)
    {
        //dd($request->session()->all());
        return [$request->user()];
    }
}