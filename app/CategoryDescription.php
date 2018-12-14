<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Category_description extends Model
{
    //
    protected $table = "oc_category_description";
    protected $primaryKey = ['category_id', 'language_id'];
    public $incrementing = false;
}
