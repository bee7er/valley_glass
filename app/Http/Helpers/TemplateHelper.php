<?php

namespace App\Http\Helpers;

use App\Credit;
use App\Content;
use App\Resource;

class TemplateHelper
{
	public static $environment_vars = [
        'BASE_URL' => ['baseUrl' => 'The base url of the application'],
	];
	public static $resource_attrs = [
        'NAME' => ['name' => 'The name of the resource'],
        'TITLE' => ['title' => 'The title of the resource'],
        'IMAGE' => ['image' => 'The file name of the image or animated GIF'],
        'THUMB' => ['thumb' => 'The file name of the thumb nail'],
        'URL' => ['url' => 'The location of the video'],
        'TYPE' => ['type' => 'The type of the resource'],
        'TEMPLATE_ID' => ['template_id' => 'The id of the template being used for the resource'],
        'DESCRIPTION' => ['description' => 'The description of the resource'],
		'BACKGROUND_COLOR' => ['backgroundColor' => 'The background color of the resource', 'default' => 'c4c4c4'],
		'CREDIT_LABEL_COLOR' => ['creditTitleColor' => 'The credit label color of the resource title', 'default' =>
            '121212'],
        'CONTENT_A' => ['content_a' => 'The copy for content A'],
        'CONTENT_B' => ['content_b' => 'The copy for content B'],
        'CREDITS' => ['credits' => 'generateCredits'],
        'CONTENTS' => ['contents' => 'generateContents'],
	];

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public static function render(Resource $resource)
	{
		$template = $resource->template()->first();

		if (null === $template) {
			dd('null');
		}
		if (null !== $template) {

			$container = $template->container;
			if ($container) {
				// Gather all potential environment variables we are supporting
				$baseUrl = config('app.base_url');
				// Now substitute in the container
				foreach (self::$environment_vars as $environment_var => $var) {
					$key = key($var);
					$container =
						str_ireplace("#$environment_var#", $$key, $container);
				}
				// Now substitute resource attributes in the container
				foreach (self::$resource_attrs as $resource_attr => $attr) {
					$key = key($attr);
					$value = reset($attr);	// Gets the array value of first element

					if (is_class_method('private', $value, self::class)) {
						// It is a callable function, use that for the substitution data
						$container =
							str_ireplace(
								"#$resource_attr#",
								call_user_func(array(self::class, $value), $resource),
								$container
							);
					} else {
                        $resourceValue = trim($resource->$key);
                        if ('' === $resourceValue && isset($attr['default'])) {
                            // A default is available, use it
                            $resourceValue = $attr['default'];
                        }
						$container = str_ireplace("#$resource_attr#", $resourceValue, $container);
					}
				}
				return $container;
			}
		}
		return '';
	}

	/**
	 * Generate credits
	 *
	 * @param Resource $resource
	 * @return string
	 */
	private static function generateCredits(Resource $resource)
	{
		$html = '';
		$credits = Credit::where('resourceId', $resource->id)
			->orderBy('seq', 'ASC')
			->get();

		if (count($credits) > 0) {
			foreach ($credits as $credit) {
				if ('' !== $credit->title) {
					$html .= '<div class="template-credits-label">' . $credit->title . '</div>';
				}
				if ('' !== $credit->name) {
					$html .= '<div class="template-credits-text">' . $credit->name . '</div>';
				}
			}
		}
		return $html;
	}

	/**
	 * Generate content entries
	 *
	 * @param Resource $resource
	 * @return string
	 */
	private static function generateContents(Resource $resource)
	{
		$html = '';
		$contents = Content::where('resourceId', $resource->id)
			->orderBy('seq', 'ASC')
			->get();

		//dd($contents);

		if (count($contents) > 0) {
			foreach ($contents as $content) {
				if ('' !== trim($content->videoUrl)) {
					$html .= self::generateVideoUrlContents($resource, $content);
				} elseif ('' !== trim($content->url)) {
					$html .= self::generateUrlContents($resource, $content);
				} elseif ('' !== trim($content->other)) {
					$html .= self::generateOtherContents($resource, $content);
				} elseif ('' !== trim($content->html)) {
					$html .= self::generateHtmlContents($resource, $content);
				}
			}
		}
		return $html;
	}

	/**
	 * Generate HTML content entries
	 *
	 * @param Resource $resource
	 * @return string
	 */
	private static function generateOtherContents(Resource $resource, Content $content)
	{
		$html = '';

        $html .= trim($content->other);

		return $html;
	}

	/**
	 * Generate HTML content entries
	 *
	 * @param Resource $resource
	 * @return string
	 */
	private static function generateHtmlContents(Resource $resource, Content $content)
	{
		$html = '';

        $html .= '<div class="row template-row-container default-template-sub-container"><div
class="col-xs-12 col-sm-12 col-md-12 col-lg-12 template-text" style="background-color: #' . $resource->backgroundColor .
			'">
' . trim($content->html) .
	'</div></div>';

		return $html;
	}

	/**
	 * Generate Url content entries
	 *
	 * @param Resource $resource
	 * @return string
	 */
	private static function generateUrlContents(Resource $resource, Content $content)
	{
		$html = '';

        $html .= '<div class="row template-row-container default-template-sub-container"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"><img src="' . $content->url . '" width="100%">';
        // Generate html here if requested
        if ('' !== trim($content->html)) {
            $html .= '<br>' . $content->html;
        }
        $html .= '</div></div>';

		return $html;
	}

	/**
	 * Generate Video Url content entries
	 *
	 * @param Resource $resource
	 * @return string
	 */
	private static function generateVideoUrlContents(Resource $resource, Content $content)
	{
		$html = '';

        $html .= '<div class="row template-row-container"> <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 video-frame-container"> <iframe class="video-frame" src="' . $content->videoUrl . '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
        // Generate an image here if requested
        if ('' !== trim($content->url)) {
            $html .= '<div style="text-align: left;margin-top: 10px;margin-bottom: -8px;"><img src="' . $content->url . '" width="100%"></div>';
        }
        // Generate html here if requested
        if ('' !== trim($content->html)) {
            $html .= '<div style="text-align: left;margin-top: 10px;margin-bottom: -8px;">' . $content->html . '</div>';
        }
        $html .= '</div></div>';

		return $html;
	}
}
