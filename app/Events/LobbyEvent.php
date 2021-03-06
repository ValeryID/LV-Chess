<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;

use App\Models\Lobby;

class LobbyEvent extends BroadcastingEvent
{
    public $channel;
    public $lobby;
    public $type;
    public $message;

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
        $channelName = in_array($this->type, ['started', 'created', 'updated'])
        ? 'lobbies' : "lobby.{$this->lobby['id']}";

        return new Channel($channelName);
    }
}
