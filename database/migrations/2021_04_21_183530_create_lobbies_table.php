<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLobbiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('lobbies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('host_id');
            $table->unsignedBigInteger('guest_id')->nullable();

            $table->enum('host_color', ['w', 'b'])->nullable();
            $table->enum('public', ['true', 'false'])->nullable();
            
            $table->timestamps();

            $table->foreign('host_id')->references('id')->on('users');
            $table->foreign('guest_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('lobbies');
    }
}
