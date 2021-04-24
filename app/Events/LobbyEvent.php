<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;

use App\Models\Lobby;

class LobbyEvent extends BroadcastingEvent
{
    public $channel, $lobby, $type, $message;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Lobby $lobby, string $type, $message=null)
    {
        parent::__construct();

        $this->class = $this->getClassName();
        $this->channel = in_array($type, ['created', 'deleted']) ? 'lobbies' : "lobby.$lobby->id";
        $this->lobby = $lobby;
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
