<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Log;

use App\Models\Game;

class GameEvent extends BroadcastingEvent
{
    public $game;
    public $type;
    public $message;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Game $game, string $type, $message=null)
    {
        parent::__construct();

        $this->game = $game->getCard();
        $this->type = $type;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel(in_array($this->type, ['created', 'updated', 'deleted'])
        ? "lobby.{$this->game['lobby_id']}" : "game.{$this->game['id']}");
    }
}
