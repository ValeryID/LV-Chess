<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\UserController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/', function () {
    return response()->file(resource_path('html/spa.html'));
});

Route::post('/login', [AuthController::class, 'authenticate']);
Route::post('/register', [AuthController::class, 'register']);

Route::get('/lobby/list', [LobbyController::class, 'list']);

Route::middleware('auth')->group(function() {
    Route::post('/logout', [AuthController::class, 'discard']);
    Route::post('/ping', [UserController::class, 'ping']);
    Route::get('/user/{user?}', [UserController::class, 'getUserCard']);

    Route::post('/lobby/make', [LobbyController::class, 'makeLobby']);
    Route::post('/lobby/{lobby}/join', [LobbyController::class, 'joinLobby']);
    Route::post('/lobby/{lobby}/start', [LobbyController::class, 'startLobby']);
    Route::post('/lobby/{lobby}/chat', [LobbyController::class, 'sendChatMessage']);
    Route::get('/lobby/{lobby}/resume', [LobbyController::class, 'resumeLobby']);
    Route::post('/lobby/leave', [LobbyController::class, 'leaveLobbies']);

    Route::post('/game/{game}/move', [GameController::class, 'move']);
    Route::post('/game/{game}/surrender', [GameController::class, 'surrender']);
    Route::get('/game/{game}/getcolor', [GameController::class, 'getColor']);
    Route::post('/game/{game}/timeover/{color}', [GameController::class, 'timeOver'])->where('color', '[wb]');
    Route::post('/game/{game}/victory/{color}', [GameController::class, 'victory'])->where('color', '[wb]');
});