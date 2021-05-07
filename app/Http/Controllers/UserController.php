<?php

namespace App\Http\Controllers;

use App\Models\Lobby;
use App\Models\User;
use Illuminate\Http\Request;

use App\Events\LobbyEvent;

class UserController extends Controller
{
    public function getUserCard(Request $request, User $user=null)
    {
        $user = $user ?? $request->user();

        return response()->json($user->getCard());
    }
}
