<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

use App\Models\Lobby;
use App\Models\Game;
use App\Observers\LobbyObserver;
use App\Observers\GameObserver;
use App\Events\LobbyEvent;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        LobbyEvent::class => [],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        // if(!app()->runningInConsole()) {
        Lobby::observe(LobbyObserver::class);
        Game::observe(GameObserver::class);
        // }
        
    }
}
