<?php namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

class PagesController extends Controller {

	public function welcome()
	{
		return view('pages.welcome');
	}

	public function about()
	{
		return view('pages.about');
	}

	public function expressions()
	{
		return view('pages.expressions');
	}

	public function contact()
	{
		return view('pages.contact');
	}

	public function merch()
	{
		return view('pages.merch');
	}

	public function template()
	{
		return view('pages.template');
	}

	public function movin()
	{
		return view('pages.movin');
	}

}
