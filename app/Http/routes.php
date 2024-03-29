<?php

/****************   Model binding into route **************************/
Route::model('language', 'App\Language');
Route::model('template', 'App\Template');
Route::model('resource', 'App\Resource');
Route::model('user', 'App\User');
Route::pattern('id', '[0-9]+');
Route::pattern('slug', '[0-9a-z-_]+');

/***************    Site routes  **********************************/
Route::get('/', 'HomeController@index');
Route::get('/home', 'HomeController@index');
Route::get('/design', 'HomeController@design');
Route::get('/repair', 'HomeController@repair');
Route::get('/contact', 'HomeController@contact');
Route::post('/contact', 'HomeController@processContactForm');
Route::get('/about', 'HomeController@about');
Route::get('/wordle', 'HomeController@wordle');
Route::post('/wordle', 'HomeController@updateWordle');
Route::post('/addWord', 'HomeController@addWord');
Route::post('/chooseWord', 'HomeController@chooseWord');
Route::post('/setWord', 'HomeController@setWord');
// NB Using the following as an alias to content controller
Route::get('/{name}', 'ContentController@show');
// Others
Route::get('home', 'HomeController@index');

Route::controllers([
    'auth' => 'Auth\AuthController',
    'password' => 'Auth\PasswordController',
]);

// Override bind function so that we can edit soft-deleted resources
Route::bind('resource', function ($value) {
    return App\Resource::withTrashed()->findOrFail($value);
});

/***************    Admin routes  **********************************/
Route::group(['prefix' => 'admin', 'middleware' => 'admin'], function() {

    # Admin Dashboard
    Route::get('dashboard', 'Admin\DashboardController@index');

    # Language
    Route::get('language/data', 'Admin\LanguageController@data');
    Route::get('language/{language}/show', 'Admin\LanguageController@show');
    Route::get('language/{language}/edit', 'Admin\LanguageController@edit');
    Route::get('language/{language}/delete', 'Admin\LanguageController@delete');
    Route::resource('language', 'Admin\LanguageController');
    # Template
    Route::get('template/data', 'Admin\TemplateController@data');
    Route::get('template/{template}/show', 'Admin\TemplateController@show');
    Route::get('template/{template}/edit', 'Admin\TemplateController@edit');
    Route::get('template/{template}/delete', 'Admin\TemplateController@delete');
    Route::resource('template', 'Admin\TemplateController');
    # Resource
    Route::get('resource/data', 'Admin\ResourceController@data');
    Route::get('resource/{resource}/show', 'Admin\ResourceController@show');
    Route::get('resource/{resource}/edit', 'Admin\ResourceController@edit');
    Route::get('resource/{resource}/delete', 'Admin\ResourceController@delete');
    Route::resource('resource', 'Admin\ResourceController');
    # Contents
    Route::get('content/{resource}/index', 'Admin\ContentController@index');
    Route::get('content/{id}/edit', 'Admin\ContentController@edit');
    Route::get('content/{id}/delete', 'Admin\ContentController@delete');
    Route::get('content/{id}/destroy', 'Admin\ContentController@destroy');
    Route::get('content/data', 'Admin\ContentController@data');
    Route::resource('content', 'Admin\ContentController');

    # Users
    Route::get('user/data', 'Admin\UserController@data');
    Route::get('user/{user}/show', 'Admin\UserController@show');
    Route::get('user/{user}/edit', 'Admin\UserController@edit');
    Route::get('user/{user}/delete', 'Admin\UserController@delete');
    Route::resource('user', 'Admin\UserController');
});
