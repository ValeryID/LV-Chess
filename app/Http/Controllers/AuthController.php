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
            $user->ping();
            
            return response($user->getCard());
        }

        return response(['reason' => $user ? 'password' : 'email'], 403);
    }
    
    public function register(Request $request) {
        $validated = $request->validate([
            'name' => 'required|unique:App\Models\User,name|max:23|min:3',
            'email' => 'required|unique:App\Models\User,email|email|max:31|min:3',
            'password' => 'required|min:5'
        ]);

        $user = new User();
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->password = Hash::make($request->input('password'));
        $user->save();

        return response([$validated], 200);
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