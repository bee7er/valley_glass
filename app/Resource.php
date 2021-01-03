<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resource extends Model
{
    use SoftDeletes;

    protected $dates = ['deleted_at'];

    protected $guarded  = array('id');

    /**
     * Get the resource's template.
     *
     * @return Template
     */
    public function template()
    {
        return $this->belongsTo(Template::class,'template_id');
    }

    /**
     * Update the model in the database.
     *
     * @param  array  $attributes
     * @return bool|int
     */
    public function update(array $attributes = [])
    {
        if (isset($attributes['isHidden'])) {
            $attributes['deleted_at'] = $attributes['isHidden'] ? date('Y-m-d H:i:s'): null;
            unset($attributes['isHidden']);
        }

        return parent::update($attributes);
    }
}
