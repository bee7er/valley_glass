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
			$table->string('backgroundColor', 6)->after('thumb');
			$table->string('creditTitleColor', 6)->after('backgroundColor');
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
			$table->dropColumn(['backgroundColor', 'creditTitleColor']);
		});
	}
}
