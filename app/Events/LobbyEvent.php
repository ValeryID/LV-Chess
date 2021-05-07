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
        $this->lobby = $lobby->getCard();
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
        $channels = [new Channel("lobby.{$this->lobby['id']}")];

        if(in_array($this->type, ['started', 'created', 'updated'])) {
            array_push($channels, new Channel("lobbies"));
        }

        return $channels;
    }
}
