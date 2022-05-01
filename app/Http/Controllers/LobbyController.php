<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Models\Lobby;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Events\LobbyEvent;

class LobbyController extends Controller
{
    public function resumeLobby(Request $request, Lobby $lobby)
    {
        $gameState = $lobby->resume();

        if (!$gameState) {
            abort(404);
        }

        return response()->json($gameState);
    }

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

    public function leaveLobbies(Request $request)
    {
        $lobbiesCount = $request->user()->leaveLobbies();

        if ($lobbiesCount === 0) {
            abort(409);
        }

        return response()->json([
            'count' => $lobbiesCount
        ]);
    }

    public function startLobby(Request $request, Lobby $lobby)
    {
        if (!Gate::allows('lobby-modify', $lobby)) {
            abort(403);
        }
        if (!$lobby->isOpen()) {
            abort(409);
        }

        $game = $lobby->startGame();
        if (!$game) {
            abort(400);
        }

        return response($game->getCard());
    }

    public function list(Request $request)
    {
        // DB::enableQueryLog();
        // $collection = Lobby::where('public', 'true')
        // ->where(fn($query) =>
        //     $query->where('status', 'open')
        //     ->orWhere(fn($query) =>
        //         $query->where('status', 'started')
        //         ->whereNull(fn($query) =>
        //             $query->select('result')
        //             ->from('games')
        //             ->whereColumn('games.lobby_id', 'lobbies.id')
        //             )
        //         )
        // )
        // ->get();
        // dd(DB::getQueryLog(), $collection);

        //DB::enableQueryLog();
        $collection = Lobby::fromQuery("
            select lobbies.*
            from lobbies 
                left join games on games.lobby_id = lobbies.id
                left join users on lobbies.host_id = users.id
            where lobbies.public = 'true' and 
            CURRENT_TIMESTAMP < users.active_until and
            (lobbies.status = 'open' or (lobbies.status = 'started' and games.result is NULL))");
        //dd(DB::getQueryLog(), $collection);

        //dd($collection);
        //$collection->map(fn ($item) => $item->getCard())
        return $collection->map(fn ($item) => $item->getCard());
    }

    public function sendChatMessage(Request $request, Lobby $lobby)
    {
        if (!Gate::allows('lobby-chatting', $lobby)) {
            abort(403);
        }
        if (!$message = $request->input('message')) {
            abort(400);
        }

        LobbyEvent::dispatch($lobby, 'chatMessage', [
            'name' => htmlentities($request->user()->name),
            'text' => htmlentities($message)
            ]);
    }
}
