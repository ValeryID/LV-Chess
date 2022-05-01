<?php

namespace App\Console\Commands;

use App\Models\Lobby;
use App\Services\LobbyService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class ListLobbies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lobby:list {status?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show lobbies with specified status';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(LobbyService $lobbyService)
    {
        $lobbies = $this->argument('status') ?
            Lobby::where('status', $this->argument('status'))->get() :
            Lobby::all();

        $columns = Schema::getColumnListing((new Lobby())->getTable());
        $this->table($columns, $lobbies->toArray());

        return 0;
    }
}
