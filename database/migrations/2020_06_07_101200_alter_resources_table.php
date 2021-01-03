<?php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class AlterResourcesTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('resources', function (Blueprint $table) {
			$table->string('titleThumb', 255);
		});
		Schema::table('contents', function (Blueprint $table) {
			$table->string('other', 255);
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('resources', function (Blueprint $table) {
			$table->dropColumn(['titleThumb']);
		});
		Schema::table('contents', function (Blueprint $table) {
			$table->dropColumn(['other']);
		});
	}
}
