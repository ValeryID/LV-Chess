<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Models\Interfaces\CardableInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Config;

class User extends Authenticatable implements CardableInterface
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

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
        'active_until' => 'datetime'
    ];

    public function getCard()
    {
        foreach (['id', 'name', 'rating'] as $prop) {
            $card[$prop] = $this->$prop;
        }

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

    public function ping(): bool
    {
        $this->active_until = Carbon::now(config('app.timezone'))
            ->addSeconds(config('game.user.ping_expire_time'))
            ->isoFormat('YYYY-MM-DD H:m:s Z');

        return $this->save();
    }

    public function isActive(): bool
    {
        return Carbon::now(config('app.timezone'))->lt($this->active_until);
    }
}
