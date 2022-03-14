<?php

namespace App\Http\Controllers;

use App\Word;
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
		return $this->index(false);
	}

	/**
	 * Show the application design resources page to the user.
	 *
	 * @return Response
	 */
	public function repair()
	{
		return $this->index(true);
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

	private $maxrows = 6;
	private $maxcols = 5;
	private $alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','enter','del'];

	/**
	 * Show the wordle app to user
	 *
	 * @return Response
	 */
	public function wordle(Request $request)
	{
		$row = 1;
		// Generate today's word
		$wordsList = Word::where('wordno', '>', 0)->get();
		$wordsCount = count($wordsList);
		$error = '';

		$word = Word::where([ 'wordno' => rand(1,$wordsCount) ])->get()->first()->wordle;
//		$word = 'spear';

		foreach ($this->alphabet as $letter) {
			$var = "wletter$letter";
			$$var = 'wletter';
		}

		for ($i = 1; $i <= $this->maxrows; $i++) {
			for ($j = 1; $j <= $this->maxcols; $j++) {
				$var = "wletter$i$j";
				$$var = 'wletter';
			}
		}

		return view('pages.wordle', compact('request', 'error', 'row', 'word', 'wlettera', 'wletterb', 'wletterc', 'wletterd', 'wlettere', 'wletterf', 'wletterg', 'wletterh', 'wletteri', 'wletterj', 'wletterk', 'wletterl', 'wletterm', 'wlettern', 'wlettero', 'wletterp', 'wletterq', 'wletterr', 'wletters', 'wlettert', 'wletteru', 'wletterv', 'wletterw', 'wletterx', 'wlettery', 'wletterz', 'wletterdel', 'wletterenter', 'wletter11', 'wletter12', 'wletter13', 'wletter14', 'wletter15', 'wletter21', 'wletter22', 'wletter23', 'wletter24', 'wletter25', 'wletter31', 'wletter32', 'wletter33', 'wletter34', 'wletter35', 'wletter41', 'wletter42', 'wletter43', 'wletter44', 'wletter45', 'wletter51', 'wletter52', 'wletter53', 'wletter54', 'wletter55', 'wletter61', 'wletter62', 'wletter63', 'wletter64', 'wletter65'));
	}

	/**
	 * Show the wordle app to user
	 *
	 * @return Response
	 */
	public function updateWordle(Request $request)
	{
		$row = $request->get('row');
		$word = $request->get('word');

		// Check that the attempt exists in the table of words
		$error = false;
		$attemptAry = [];
		for ($j = 1; $j <= $this->maxcols; $j++) {
			$attemptAry[] = $request->get("wletter$row$j");
		}
		$attempt = implode('', $attemptAry);
		if (null === Word::where([ 'wordle' => $attempt ])->get()->first()) {
			$error = 'Word does not exist';
		}

		// Initialise the keyboard to starting state
		foreach ($this->alphabet as $letter) {
			$var = "wletter$letter";
			$$var = 'wletter';
		}


		for ($i = 1; $i <= $this->maxrows; $i++) {

			$testWord = $word;

			for ($j = 1; $j <= $this->maxcols; $j++) {
				$var = "wletter$i$j";
				// Check if the submitted letter appears in the word
				$class = 'missing';
				$letter = $request->get($var);

				if ($letter == substr($testWord, $j - 1, 1)) {
					$class = 'correct';
					// Remove from the word so we don't count it again
					$testWord = substr_replace($testWord,'*',$j - 1, 1);
				} elseif (false !== ($pos = strpos($testWord, ($letter ? :' ')))) {
					$class = 'present';
					// Remove from the word so we don't count it again
					$testWord = substr_replace($testWord,'*',$j - 1, 1);
				}
				if ($i < $row) {
					$$var = $class;
				} elseif ($i == $row && !$error) {
					$$var = $class;
				} else {
					$$var = 'wletter';
				}

				// Set the alphabet class
				$var = "wletter$letter";
				$$var = $class;
			}
		}

		if (!$error) {
			$row += 1;
		}

		return view('pages.wordle', compact('request', 'error', 'row', 'word', 'wlettera', 'wletterb', 'wletterc', 'wletterd', 'wlettere', 'wletterf', 'wletterg', 'wletterh', 'wletteri', 'wletterj', 'wletterk', 'wletterl', 'wletterm', 'wlettern', 'wlettero', 'wletterp', 'wletterq', 'wletterr', 'wletters', 'wlettert', 'wletteru', 'wletterv', 'wletterw', 'wletterx', 'wlettery', 'wletterz', 'wletterdel', 'wletterenter', 'wletter11', 'wletter12', 'wletter13', 'wletter14', 'wletter15', 'wletter21', 'wletter22', 'wletter23', 'wletter24', 'wletter25', 'wletter31', 'wletter32', 'wletter33', 'wletter34', 'wletter35', 'wletter41', 'wletter42', 'wletter43', 'wletter44', 'wletter45', 'wletter51', 'wletter52', 'wletter53', 'wletter54', 'wletter55', 'wletter61', 'wletter62', 'wletter63', 'wletter64', 'wletter65'));
	}
}
