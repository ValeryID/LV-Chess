<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;

use App\Models\Game;

class GameEvent extends BroadcastingEvent
{
    public $channel, $game, $type, $message;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Game $game, string $type, $message=null)
    {
        parent::__construct();

        $this->channel = "game.$game->id";
        $this->game = $game;
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
        return new Channel($this->channel);
    }
}
