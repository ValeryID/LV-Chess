<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Lobby;
use App\Models\GameMove;

class Game extends Model
{
    use HasFactory;

    protected $casts = [
        'white_player_id' => 'integer',
        'black_player_id' => 'integer'
    ];

    public static function make(Lobby $lobby): ?Game
    {
        $game = new self();
        $game->white_player_id = $lobby->host_color === 'w' ? $lobby->host_id : $lobby->guest_id;
        $game->black_player_id = $lobby->host_color === 'b' ? $lobby->host_id : $lobby->guest_id;
        
        return $game->save() ? $game : null;
    }

    public function makeMove(string $move): bool
    {
        try {
            GameMove::create([
                'game_id' => $this->id,
                'algebraic' => $move
            ]);

            $this->turn = $this->turn === 'w' ? 'b' : 'w';
            $this->save();

            return true;
        } catch(\Illuminate\Database\QueryException $e) {
            return false;
        }
    }

    public function isPlayersTurn(User $user): bool
    {
        return $this->turn === 'w' && $this->white_player_id === $user->id || 
        $this->turn === 'b' && $this->black_player_id === $user->id;
    }

    public function playerMove(User $user, string $move): bool
    {
        return $this->playerInGame($user) ? $this->makeMove($move) : false;
    }

    public function setResult(string $result): bool
    {
        $this->result = $result;
        return $this->save();
    }

    public function playerInGame(User $user): bool
    {
        return $user->id == $this->white_player_id || $user->id == $this->black_player_id;
    }

    public function playerSurrender(User $user): bool
    {
        switch($user->id) {
            case $this->white_player_id: return $this->setResult('b');
            case $this->black_player_id: return $this->setResult('w');
            default: return false;
        }
    }

    public function playerColor(User $user): ?string
    {
        switch($user->id) {
            case $this->white_player_id: return 'w';
            case $this->black_player_id: return 'b';
            default: return null;
        }
    }
}
