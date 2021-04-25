<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Models\Lobby;
use Illuminate\Http\Request;

use App\Events\LobbyEvent;

class LobbyController extends Controller
{
    public function makeLobby(Request $request)
    {
        $params = $request->only('public', 'hostColor', 'timeLimit');
        $lobby = Lobby::make($request->user(), $params);

        return response($lobby, $lobby !== null ? 200 : 400);
    }

    public function joinLobby(Request $request, Lobby $lobby)
    {
        return $lobby->join($request->user()) ? response($lobby) : abort(403);
    }

    public function startLobby(Request $request, Lobby $lobby)
    {
        $authorized = Gate::allows('lobby-start-game', $lobby);
        if(!$authorized) abort(403);
        if($lobby->started) abort(409);

        $game = $lobby->startGame();
        if(!$game) abort(400);

        LobbyEvent::dispatch($lobby, 'started', $game);

        return response($game);
    }

    public function list(Request $request)
    {
        return Lobby::where('public', 1)->where('guest_id', null)->get();
    }
}
