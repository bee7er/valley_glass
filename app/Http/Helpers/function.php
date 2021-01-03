<?php
/**
 * Created by PhpStorm.
 * User: brianetheridge
 * Date: 24/07/2016
 * Time: 14:24
 */

if (!function_exists('removeWhiteSpace')) {
    /**
     * Removes leading and trailing spaces and other white space.
     */
    function removeWhiteSpace($str) {
        $str = trim($str);
        $str = str_replace("\n", '', $str);
        $str = str_replace("\r", '', $str);
        return str_replace("\t", '', $str);
    }
}


if (!function_exists('is_class_method')) {
    /**
     * Checks for existence of a class method
     */
    function is_class_method($type="public", $method, $class) {
        try {
            $refl = new ReflectionMethod($class, $method);
            switch($type) {
                case "static":
                    return $refl->isStatic();
                    break;
                case "public":
                    return $refl->isPublic();
                    break;
                case "private":
                    return $refl->isPrivate();
                    break;
            }
        } catch (Exception $e) {
            // Ignore
        }
    }
}
