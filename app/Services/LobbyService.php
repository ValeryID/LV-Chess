<?php

namespace App\Services;

use App\Models\Lobby;

class LobbyService
{
    public function closeUnactiveLobbies(): int
    {
        $unactiveLobbies = Lobby::fromQuery('
            select lobbies.*
            from lobbies
                left join users on lobbies.host_id = users.id
            where CURRENT_TIMESTAMP > users.active_until
        ');

        foreach ($unactiveLobbies as $lobbie) {
            $lobbie->close();
        }

        return $unactiveLobbies->count();
    }
}
