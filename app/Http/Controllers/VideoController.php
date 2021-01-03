<?php namespace App\Http\Controllers;

use App\Http\Helpers\TemplateHelper;
use App\Resource;

class VideoController extends Controller
{
    /**
     * @param $id
     * @return \BladeView|bool|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function show($name)
	{
        $error = null;
        $videoTitle = null;

        $video = Resource::with('template')->where("name", "=", $name)->first();
        if ($video) {
            $video->rendered = TemplateHelper::render($video);
            $videoTitle = $video->title;
        } else {
            $error = "Sorry, could not find that video";
            $videoTitle = "None";
        }

        return view('video.view_video',compact('video', 'error', 'videoTitle'));
	}
}
