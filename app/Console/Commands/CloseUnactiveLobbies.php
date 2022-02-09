<?php

namespace App\Console\Commands;

use App\Services\LobbyService;
use Illuminate\Console\Command;

class CloseUnactiveLobbies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lobby:closeUnactive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Close all lobbies whose host is unactive';

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
        $lobbyService->closeUnactiveLobbies();
        return 0;
    }
}
