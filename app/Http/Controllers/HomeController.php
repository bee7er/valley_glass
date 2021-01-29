<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Auth\Guard;

use App\Resource;
use App\Template;
use Illuminate\Http\Request;
use Illuminate\Foundation\Validation\ValidatesRequests;

use Illuminate\Support\Facades\Validator;
use SendGrid\Mail\Mail;

/**
 * Class HomeController
 * @package App\Http\Controllers
 */
class HomeController extends Controller
{
	use ValidatesRequests;

	const ABOUT_TEMPLATE = '*About';

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
		$about = Template::where([ 'name' => self::ABOUT_TEMPLATE, 'deleted_at' => null ])->get()->first();
		$aboutText = $about->container ? : 'None';

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
			// But put it back if there is no title thumb specified
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

		return view('pages.home', compact('aboutText', 'resources', 'titleResource', 'mode', 'loggedIn'));
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
	public function contact(Request $request)
	{
		$error = $success = null;
		$loggedIn = false;
		if ($this->auth->check()) {
			$loggedIn = true;
		}

		return view('pages.contact', compact('request', 'error', 'success', 'loggedIn'));
	}

	/**
	 * Process the form from the contact page
	 *
	 * @return Response
	 */
	public function processContactForm(Request $request)
	{
		$errors = $successMessage = null;
		try {
			// validate all form fields are filled
			$validator = Validator::make($request->all(), [
				'contactName'=> 'required',
				'contactEmail' => 'required|email',
				'contactMessage' => 'required'
			], [
				'required' => 'The :attribute field is required',
				'email' => 'Please enter a valid email address',
			]);

			if ($validator->fails())
			{
				$errors = $validator->errors()->getMessages();
			}

			// check if reCaptcha has been validated by Google
			$secret = env('GOOGLE_RECAPTCHA_SECRET');
			$captchaId = $request->input('g-recaptcha-response');
			//sends post request to the URL and tranforms response to JSON
			$responseCaptcha = json_decode(file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' . $secret . '&response=' . $captchaId));
			if (!$responseCaptcha->success)
			{
				$errors['captcha'] = ['Sorry, are you a robot? The Captcha failed to validate.'];
			}

			if (!is_array($errors))
			{
				$this->sendEmail($request);

				$successMessage = 'Thank you. Your message has been sent.';
			}
		} catch (Exception $e)
		{
			$errors['captcha'] = [$e->getMessage()];
		}

		$loggedIn = $this->auth->check();
		return view('pages.contact', compact('request', 'errors', 'successMessage', 'loggedIn'));
	}

	/**
	 * Process the form from the contact page
	 */
	public function sendEmail(Request $request)
	{
		$response = null;
		try {
			$email = new Mail();
			$email->setFrom("betheridge@gmail.com", "Valley Glass Admin");
			$email->setSubject("Contact by a visitor to Valley Glass");
			$email->addTo("contact_bee@yahoo.com", "Valley Glass Admin");
			$email->addContent("text/plain", "Details:");
			$email->addContent("text/html",
				"Name: <strong>{$request->get('contactName')}</strong><br>" .
				"Email: <strong>{$request->get('contactEmail')}</strong><br>" .
				"Message: <strong>{$request->get('contactMessage')}</strong><br>"
			);

			$sendgrid = new \SendGrid(getenv('SENDGRID_API_KEY'));

			try {
				$response = $sendgrid->send($email);
				if (200 > $response->statusCode() || 299 < $response->statusCode()) {
					print $response->statusCode() . "\n";
					print_r($response->headers());
					print $response->body() . "\n";
				}
			} catch (Exception $e) {
				echo 'Caught exception: '.  $e->getMessage(). "\n";
			}
		} catch (Exception $e) {
			print "Message could not be sent";
			print $response->statusCode() . "\n";
			print_r($response->headers());
			print $response->body() . "\n";
		}

	}

}
