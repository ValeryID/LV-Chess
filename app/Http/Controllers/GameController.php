<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use App\Events\GameEvent;

class GameController extends Controller
{
    public function move(Request $request, Game $game)
    {
        $move = $request->input('algebraic');
        if (!$game->isPlayersTurn($request->user())) {
            abort(403);
        }
        if ($move === null || !$game->makeMove($move)) {
            abort(400);
        }

        GameEvent::dispatch($game, 'move', $move);

        return response('ok');
    }

    public function surrender(Request $request, Game $game)
    {
        if (!$game->playerSurrender($request->user())) {
            abort(403);
        }

        return response('ok');
    }

    public function getColor(Request $request, Game $game)
    {
        $color = $game->getPlayerColor($request->user());
        if ($color === null) {
            abort(403);
        }

        return response($color);
    }

    public function timeOver(Request $request, Game $game, string $color)
    {
        $result = $game->timeCheck($game->colorToUser($color));
        //if($result) GameEvent::dispatch($game, 'result', $color === 'w' ? 'b' : 'w');

        return response($result);
    }

    public function victory(Request $request, Game $game, string $color)
    {
        return $game->victoryReport($request->user(), $color) ? response(true) : abort(409);
    }
}
