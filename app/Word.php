<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Word extends Model
{
    protected $guarded  = array('wordno');

    public $timestamps = false;
}
