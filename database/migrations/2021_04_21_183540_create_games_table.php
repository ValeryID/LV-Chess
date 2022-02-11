<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGamesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('white_player_id')->nullable();
            $table->unsignedBigInteger('black_player_id')->nullable();
            $table->enum('turn', ['w', 'b'])->default('w');
            $table->enum('result', ['w', 'b', 'error'])->nullable();
            $table->enum('white_player_result', ['w', 'b'])->nullable();
            $table->enum('black_player_result', ['w', 'b'])->nullable();
            $table->timestamps();

            $table->foreign('white_player_id')->references('id')->on('users');
            $table->foreign('black_player_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('games');
    }
}
