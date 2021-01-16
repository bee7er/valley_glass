<?php namespace App\Http\Controllers;

use App\Http\Helpers\TemplateHelper;
use App\Resource;

class ContentController extends Controller
{
    /**
     * @param $id
     * @return \BladeView|bool|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function show($name)
	{
        $error = null;
        $title = null;

        $resource = Resource::with('template')->where("name", "=", $name)->first();
        if ($resource) {
            $resource->rendered = TemplateHelper::render($resource);
            $title = $resource->title;
        } else {
            $error = "Sorry, could not find that resource";
            $title = "None";
        }

        return view('content.view_content',compact('resource', 'error', 'title'));
	}
}
