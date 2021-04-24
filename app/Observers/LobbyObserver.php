<?php

namespace App\Observers;

use App\Models\Lobby;
use App\Events\LobbyEvent;

class LobbyObserver
{
    public function created(Lobby $lobby)
    {
        LobbyEvent::dispatch($lobby, 'created');
    }

    public function updated(Lobby $lobby)
    {
        LobbyEvent::dispatch($lobby, 'updated');
    }

    public function deleted(Lobby $lobby)
    {
        LobbyEvent::dispatch($lobby, 'deleted');
    }
}
