<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Game;

class GameMove extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'algebraic'
    ];

    public function game(): Game
    {
        return Game::find($this->game_id);
    }
}
