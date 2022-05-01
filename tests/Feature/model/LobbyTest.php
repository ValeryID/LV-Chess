<?php

namespace Tests\Feature;

use Tests\TestCase;

use \App\Models\{Lobby, User};

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class LobbyTest extends TestCase
{
    use RefreshDatabase;
    
    public function testNewLobbyStatus()
    {
        $user = new User();
        $user->name = 'testUserName';
        $user->email = 'testUserEmail@mail.com';
        $user->password = Hash::make('testUserPassword123');
        $user->save();

        $lobby = Lobby::make($user, []);
        
        $this->assertEquals($lobby->host_id, $user->id);
        $this->assertEquals($lobby->status, 'open');
        $this->assertEquals($lobby->public, config('game.lobby.default.public'));
        $this->assertEquals($lobby->host_color, config('game.lobby.default.host_color'));
        $this->assertEquals($lobby->time_limit, config('game.lobby.default.time_limit'));
    }
}
