<?php

use Illuminate\Database\Seeder;

class UserTableSeeder extends Seeder {

	public function run()
	{

		\App\User::create([
			'name' => 'Brian',
			'username' => 'brian',
			'email' => 'betheridge@gmail.com',
			'password' => bcrypt('Candoobly9'),
			'confirmed' => 1,
            'admin' => 1,
			'confirmation_code' => md5(microtime() . env('APP_KEY')),
		]);

		\App\User::create([
			'name' => 'Russ',
			'username' => 'russ',
			'email' => 'russta@gmail.com',
			'password' => bcrypt('Pangolin'),
			'confirmed' => 1,
            'admin' => 1,
			'confirmation_code' => md5(microtime() . env('APP_KEY')),
		]);

		\App\User::create([
			'name' => 'Test User',
			'username' => 'test_user',
			'email' => 'user@user.com',
			'password' => bcrypt('user'),
			'confirmed' => 1,
			'confirmation_code' => md5(microtime() . env('APP_KEY')),
		]);

	}

}
