<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class order_table_linksub extends Model
{
    protected $table = 'oc_table_linksub';
    protected $primaryKey  = 'link_id';
    public $timestamps = false;
}
