<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Models\Interfaces\CardableInterface;
use Illuminate\Database\Eloquent\Collection;

class User extends Authenticatable implements CardableInterface
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getCard() 
    {
        foreach(['id', 'name', 'rating'] as $prop)
            $card[$prop] = $this->$prop;
            
        return $card;
    }

    public function lobbies(): Collection
    {
        return Lobby::where('host_id', $this->id)->orWhere('guest_id', $this->id)->get();
    }

    public function leaveLobbies(): int
    {
        $lobbies = $this->lobbies();
        $lobbies->each(fn ($lobby) => $lobby->leave($this));

        return $lobbies->count();
    }
}
