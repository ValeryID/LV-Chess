<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Game;

class Lobby extends Model
{
    use HasFactory;

    protected $casts = [
        'host_id' => 'integer',
        'guest_id' => 'integer'
    ];

    public static function make(User $user, array $params): ?Lobby
    {
        $lobby = new self();
        $lobby->host_id = $user->id;
        $lobby->public = $params['public'] ?? config('game.lobby.default.public');
        $lobby->host_color = $params['hostColor'] ?? config('game.lobby.default.host_color');
        $lobby->time_limit = $params['timeLimit'] ?? config('game.lobby.default.time_limit');

        try {
            $lobby->save();
            $lobby = $lobby->fresh();
            return $lobby;
        } catch(\Illuminate\Database\QueryException $e) {
            return null;
        }
    }

    public function join(User $user): bool
    {
        if($this->guest_id !== null || $this->host_id == $user->id) return false;
        return $this->setGuestUser($user);
    }

    public function host(): ?User
    {
        return User::find($this->host_id);
    }

    public function guest(): ?User
    {
        return User::find($this->guest_id);
    }

    public function playersReady(): bool 
    {
        return $this->guest_id !== null;
    }

    public function startGame(): ?Game
    {
        if($this->playersReady()) {
            $game = Game::make($this);
            $this->started = true;
            $this->save();
            //$this->delete();

            return $game;
        }

        return null;
    }

    private function setGuestUser(User $user): bool
    {
        try {
            $this->guest_id = $user->id;
            $this->save();
            return true;
        } catch(\Illuminate\Database\QueryException $e) {
            return false;
        }
    }
}
