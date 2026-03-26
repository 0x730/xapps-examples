<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIssueCommentsTable extends Migration
{
    public function up()
    {
        Schema::create('issue_comments', function (Blueprint $table) {
            $table->string('client_id');
            $table->string('user_email');
            $table->string('id');
            $table->string('issue_id');
            $table->string('author');
            $table->text('body');
            $table->string('created_at');
            $table->primary(array('client_id', 'id'));
        });
    }

    public function down()
    {
        Schema::dropIfExists('issue_comments');
    }
}

