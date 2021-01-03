<?php namespace App\Http\Controllers;

use App\Http\Helpers\TemplateHelper;
use App\Resource;

class ImageController extends Controller
{
    /**
     * @param $id
     * @return \BladeView|bool|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function show($id)
	{
        $image = Resource::with('template')->find($id);

        $image->rendered = TemplateHelper::render($image);

        return view('image.view_image',compact('image'));
	}
}
