<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Game;

use App\Models\Interfaces\CardableInterface;
use Illuminate\Support\Facades\Log;

class Lobby extends Model implements CardableInterface
{
    use HasFactory;

    protected $casts = [
        'host_id' => 'integer',
        'guest_id' => 'integer',
        'public' => 'string',
    ];

    public static function make(User $user, array $params): ?Lobby
    {
        // $usersOpenLobbies = Lobby::where('host_id', $user->id)->where('status', 'open');
        // if($usersOpenLobbies->count() !== 0) return null;
        $user->leaveLobbies();

        $lobby = new self();
        $lobby->host_id = $user->id;
        $lobby->status = 'open';
        $lobby->public = $params['public'] ?? config('game.lobby.default.public');
        $lobby->host_color = $params['hostColor'] ?? config('game.lobby.default.host_color');
        $lobby->time_limit = $params['timeLimit'] ?? config('game.lobby.default.time_limit');

        try {
            $lobby->save();
            $lobby = $lobby->fresh();
            return $lobby;
        } catch (\Illuminate\Database\QueryException $e) {
            return null;
        }
    }

    public function leave(User $user): bool
    {
        switch ($user->id) {
            default: return false;
            case $this->host_id: return $this->close();
            case $this->guest_id:
                $this->guest_id = null;
                return $this->save();
        }
    }

    public function close(): bool
    {
        $this->status = 'closed';

        return $this->save();
    }

    public function join(User $user): bool
    {
        if (in_array($user->id, [$this->host_id, $this->guest_id])) {
            return true;
        }
        if ($this->guest_id !== null) {
            return false;
        }
        $user->leaveLobbies();

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

    public function playerInGame(User $user): bool
    {
        return $user->id == $this->white_player_id || $user->id == $this->black_player_id;
    }

    public function startGame(): ?Game
    {
        if ($this->playersReady() || $this->public === 'false') {
            $game = Game::make($this);
            $this->status = 'started';
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
        } catch (\Illuminate\Database\QueryException $e) {
            return false;
        }
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function userInLobby(User $user): bool
    {
        return in_array($user->id, [$this->guest_id, $this->host_id]);
    }

    public function getCard()
    {
        foreach (['host_color', 'id', 'public', 'status', 'time_limit']
        as $prop) {
            $card[$prop] = $this->$prop;
        }

        $card['host'] = ($host = User::find($this->host_id)) ? $host->getCard() : null;
        $card['guest'] = ($guest = User::find($this->guest_id)) ? $guest->getCard() : null;

        return $card;
    }

    public function game()
    {
        return $this->hasOne(Game::class);
    }

    public function resume(): ?array
    {
        return $this->game ? $this->game->getCurrentState() : null;
    }
}
