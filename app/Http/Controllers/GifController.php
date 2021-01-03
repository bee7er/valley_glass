<?php namespace App\Http\Controllers;

use App\Http\Helpers\TemplateHelper;
use App\Resource;

class GifController extends Controller
{
    /**
     * @param $id
     * @return \BladeView|bool|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function show($id)
	{
        $gif = Resource::with('template')->find($id);

        $gif->rendered = TemplateHelper::render($gif);

        return view('gif.view_gif',compact('gif'));
	}
}
