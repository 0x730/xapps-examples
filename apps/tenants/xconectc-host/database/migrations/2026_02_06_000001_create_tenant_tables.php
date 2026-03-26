<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantTables extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->string('client_id');
            $table->string('user_email');
            $table->string('id');
            $table->string('name');
            $table->string('status');
            $table->string('owner');
            $table->string('created_at');
            $table->primary(array('client_id', 'id'));
        });

        Schema::create('issues', function (Blueprint $table) {
            $table->string('client_id');
            $table->string('user_email');
            $table->string('id');
            $table->string('project_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status');
            $table->string('created_at');
            $table->primary(array('client_id', 'id'));
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->string('client_id');
            $table->string('user_email');
            $table->string('id');
            $table->string('sku');
            $table->string('name');
            $table->integer('quantity');
            $table->string('status');
            $table->string('created_at');
            $table->string('updated_at')->nullable();
            $table->primary(array('client_id', 'id'));
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('issues');
        Schema::dropIfExists('projects');
    }
}
