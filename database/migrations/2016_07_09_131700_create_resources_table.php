<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateResourcesTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('resources', function (Blueprint $table) {
			$table->engine = 'InnoDB';
			$table->increments('id')->unsigned();
			$table->enum('type', array('video', 'gif', 'image'));
			$table->string('name', 255)->nullable();
			$table->text('description')->nullable();
			$table->text('content_a')->nullable();
			$table->text('content_b')->nullable();
			$table->string('image', 255);
			$table->string('thumb', 255);
			$table->string('url', 255);
			$table->unsignedInteger('template_id')->nullable();
			$table->foreign('template_id')->references('id')->on('templates')->onDelete('set null');
			$table->timestamps();
            $table->softDeletes();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('resources');
	}
}
