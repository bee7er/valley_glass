<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class CreateContentsTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('contents', function (Blueprint $table) {
			$table->engine = 'InnoDB';
			$table->increments('id')->unsigned();
			$table->decimal('seq')->nullable();
			$table->string('title', 255)->nullable();
			$table->string('url', 255)->nullable();
			$table->string('videoUrl', 255)->nullable();
			$table->text('html')->nullable();
			$table->unsignedInteger('resourceId')->nullable();
			$table->foreign('resourceId')->references('id')->on('resources')->onDelete('set null');
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
		Schema::drop('contents');
	}
}
