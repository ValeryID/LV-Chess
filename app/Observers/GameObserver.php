<?php

namespace App\Observers;

use App\Models\Game;
use App\Events\GameEvent;

class GameObserver
{
    public function created(Game $game)
    {
        GameEvent::dispatch($game, 'created');
    }

    public function updated(Game $game)
    {
        GameEvent::dispatch($game, 'updated');
    }

    public function deleted(Game $game)
    {
        GameEvent::dispatch($game, 'deleted');
    }
}
