<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Guard;

use App\Notice;
use App\Resource;
use App\Template;
use Illuminate\Http\Request;

/**
 * Class HomeController
 * @package App\Http\Controllers
 */
class HomeController extends Controller
{
	const ABOUT_TEMPLATE = '*About';
	const CONTACT_TEMPLATE = '*Contact';

	/**
	 * The Guard implementation.
	 *
	 * @var Guard
	 */
	protected $auth;

	/**
	 * Create a new filter instance.
	 *
	 * @param  Guard  $auth
	 * @return void
	 */
	public function __construct(Guard $auth)
	{
		$this->auth = $auth;
	}

	/**
	 * Show the application dashboard to the user.
	 *
	 * @return Response
	 */
	public function index($isRepair = false)
	{
		$resources = Resource::select(
			array(
				'resources.id',
				'resources.name',
				'resources.description',
				'resources.isRepair',
				'resources.titleThumb',
				'resources.titleThumbHover',
				'resources.thumb',
				'resources.thumbHover',
				'resources.useThumbHover',
				'resources.isClickable',
				'resources.url',
				'resources.seq',
				'resources.deleted_at'
			)
		)
			->where(["resources.isRepair" => ($isRepair ? '1': '0')])
			->orderBy("resources.seq")
			->limit(999)->get();

		$titleResource = null;

		if ($resources->count() > 0) {
			// Grab the first entry, it is the title entry
			$titleResource = $resources->shift();
			// But put it back if there is no title thimb specified
			if (null == $titleResource->titleThumb) {
				$resources->prepend($titleResource);
				$titleResource = null;
			}
			// Derive the hover title image for each remaining entry and add it to the object
			foreach ($resources as &$resource) {
				// If we are to use the hover then generate the necessary HTML
				$resource->hoverActions = '';
				if ($resource->useThumbHover) {
					$resource->hoverActions = sprintf('onmouseover="this.src=\'%s\'" onmouseout="this.src=\'%s\'"',
						$resource->thumbHover, $resource->thumb);
				}
				// Check if the thumb is in fact a video
				$resource->video = '';
				if (false !== strpos($resource->thumb, '.mp4')) {
					$resource->video = $resource->thumb;
				}
				// Check if the thumb is clickable
				$resource->clickAction = $resource->clickActionClass = '';
				if ($resource->isClickable) {
					$resource->clickAction = 'onclick="document.location=\'' . url($resource->name) .'\';"';
					$resource->clickActionClass = 'work-image-clickable';
				}
			}
		}

		$mode = $isRepair ? 'Repair Work': 'Design Work';
		$loggedIn = false;
		if ($this->auth->check()) {
			$loggedIn = true;
		}

		return view('pages.home', compact('resources', 'titleResource', 'mode', 'loggedIn'));
	}

	/**
	 * Show the application design resources page to the user.
	 *
	 * @return Response
	 */
	public function design()
	{
		return $this->index(0);
	}

	/**
	 * Show the application design resources page to the user.
	 *
	 * @return Response
	 */
	public function repair()
	{
		return $this->index(1);
	}

	/**
	 * Show the application about page to the user.
	 *
	 * @return Response
	 */
	public function about()
	{
		$about = Template::where([ 'name' => self::ABOUT_TEMPLATE, 'deleted_at' => null ])->get()->first();
		$aboutText = $about->container ? : 'None';

		$loggedIn = false;
		if ($this->auth->check()) {
			$loggedIn = true;
		}

		return view('pages.about', compact('aboutText', 'loggedIn'));
	}

	/**
	 * Show the application contact page to the user.
	 *
	 * @return Response
	 */
	public function contact()
	{
		$contact = Template::where([ 'name' => self::CONTACT_TEMPLATE, 'deleted_at' => null ])->get()->first();
		$contactText = $contact->container ? : 'None';

		$loggedIn = false;
		if ($this->auth->check()) {
			$loggedIn = true;
		}

		$formMessage = null;

		return view('pages.contact', compact('contactText', 'formMessage', 'loggedIn'));
	}

	/**
	 * Process the form from the contact page
	 *
	 * @return Response
	 */
	public function processContactForm(Request $request)
	{

		//dd($request->all());

		$contact = Template::where([ 'name' => self::CONTACT_TEMPLATE, 'deleted_at' => null ])->get()->first();
		$contactText = $contact->container ? : 'None';

		$loggedIn = false;
		if ($this->auth->check()) {
			$loggedIn = true;
		}

		$formMessage = 'Thank you. Your message has been sent.';

		return view('pages.contact', compact('contactText', 'formMessage', 'loggedIn'));
	}

}
