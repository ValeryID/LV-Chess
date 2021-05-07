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

        return response($lobby, $lobby ? 200 : 403);
    }

    public function joinLobby(Request $request, Lobby $lobby)
    {
        return $lobby->join($request->user()) ? response($lobby) : abort(403);
    }

    public function leaveLobby(Request $request)
    {
        $userLobbies = $request->user()->lobbies();

        if($userLobbies->count() === 0) abort(409);

        $userLobbies->each(fn ($lobby) => $lobby->disconnectUser($request->user()));

        return response()->json([
            'count' => $userLobbies->count()
        ]);
    }

    public function startLobby(Request $request, Lobby $lobby)
    {
        if(!Gate::allows('lobby-modify', $lobby)) abort(403);
        if(!$lobby->isOpen()) abort(409);

        $game = $lobby->startGame();
        if(!$game) abort(400);

        return response($game->getCard());
    }

    public function list(Request $request)
    {
        $collection = Lobby::where('public', 'true')->where('status', 'open')->get();
        return $collection->map(fn ($item) => $item->getCard());
    }

    public function sendChatMessage(Request $request, Lobby $lobby)
    {
        if(!Gate::allows('lobby-chatting', $lobby)) abort(403);
        if(!$message = $request->input('message')) abort(400);

        LobbyEvent::dispatch($lobby, 'chatMessage', [
            'name' => htmlentities($request->user()->name),
            'text' => htmlentities($message)
            ]);
    }
}
