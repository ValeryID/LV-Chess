<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;

use App\Models\Lobby;
use App\Models\GameMove;

use App\Models\Interfaces\CardableInterface;

class Game extends Model implements CardableInterface
{
    use HasFactory;

    protected $casts = [
        'white_player_id' => 'integer',
        'black_player_id' => 'integer',
    ];

    public static function make(Lobby $lobby): ?Game
    {
        $game = new self();
        $game->lobby_id = $lobby->id;
        $game->white_player_id = $lobby->host_color === 'w' ? $lobby->host_id : $lobby->guest_id;
        $game->black_player_id = $lobby->host_color === 'b' ? $lobby->host_id : $lobby->guest_id;

        return $game->save() ? $game : null;
    }

    public function makeMove(string $move): bool
    {
        if ($this->result) {
            return false;
        }

        try {
            GameMove::create([
                'game_id' => $this->id,
                'algebraic' => $move
            ]);

            $this->turn = $this->turn === 'w' ? 'b' : 'w';
            $this->save();

            return true;
        } catch (\Illuminate\Database\QueryException $e) {
            return false;
        }
    }

    public function colorToUser(string $color): ?User
    {
        if (!in_array($color, ['w', 'b'])) {
            return null;
        }
        return $color === 'w' ? User::find($this->white_player_id) : User::find($this->black_player_id);
    }

    protected function countPlayerElapsedTime(User $user): int
    {
        $moves = $this->moves->sortBy('id');

        $elapsedTime = 0;
        $color = $this->getPlayerColor($user);
        for ($i = (int)($color === 'b'); $i < $moves->count(); $i += 2) {
            $carbonDate = $moves->get($i)->created_at;
            $carbonDatePrev = $i === 0 ? $this->created_at : $moves->get($i - 1)->created_at;
            $elapsedTime += $carbonDate->diffInSeconds($carbonDatePrev);
        }

        if ($this->isPlayersTurn($user)) {
            $elapsedTime += Carbon::now()->diffInSeconds(($moves->last() ?: $this)->created_at);
        }

        return $elapsedTime;
    }

    public function victoryReport(User $user, string $color): bool
    {
        switch ($this->getPlayerColor($user)) {
            case 'w': $this->white_player_result = $color; break;
            case 'b': $this->black_player_result = $color; break;
            default: return false;
        }

        if ($this->white_player_result !== null && $this->black_player_result !== null) {
            if ($this->white_player_result === $this->black_player_result) {
                $this->result = $color;
            } else {
                $this->result = 'error';
            }
        }

        return $this->save();
    }

    public function isPlayerTimeOver(User $user): bool
    {
        return $this->countPlayerElapsedTime($user) > $this->lobby()->time_limit;
    }

    public function getCurrentState(): array
    {
        return [
            'id' => $this->id,
            'moves' => $this->moves,
            'white_time' => $this->lobby()->time_limit - $this->countPlayerElapsedTime($this->colorToUser('w')),
            'black_time' => $this->lobby()->time_limit - $this->countPlayerElapsedTime($this->colorToUser('b')),
        ];
    }

    public function timeCheck(User $user): bool
    {
        if ($this->isPlayerTimeOver($user)) {
            return $this->playerSurrender($user);
        } else {
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
        //return $this->lobby()->userInLobby($user);
        return in_array($user->id, [$this->white_player_id, $this->black_player_id]);
    }

    public function playerSurrender(User $user): bool
    {
        switch ($user->id) {
            case $this->white_player_id: return $this->setResult('b');
            case $this->black_player_id: return $this->setResult('w');
            default: return false;
        }
    }

    public function getPlayerColor(User $user): ?string
    {
        switch ($user->id) {
            case $this->white_player_id: return 'w';
            case $this->black_player_id: return 'b';
            default: return null;
        }
    }

    public function lobby(): ?Lobby
    {
        return Lobby::find($this->lobby_id);
    }

    public function moves()
    {
        return $this->hasMany(GameMove::class);
    }

    protected function playerMoves(User $user): Collection
    {
        $color = $this->getPlayerColor($user);
        $moves = $this->moves->sortBy('id');
        $playerMoves = new Collection();

        for ($i = (int)($color === 'b'); $i < $moves->count(); $i += 2) {
            $playerMoves->push($moves->get($i));
        }

        return $playerMoves;
    }

    public function getCard()
    {
        foreach (['id', 'white_player_id', 'black_player_id', 'turn', 'result', 'lobby_id']
        as $prop) {
            $card[$prop] = $this->$prop;
        }

        return $card;
    }
}
