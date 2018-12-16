<?php

namespace App\Http\Controllers;

use App\CategoryDescription;

class CategoryController extends Controller
{
    /**
     * return list of categories with id and name
     *
     * @param integer $lang - pass by url for language code
     *
     * @return response categories
     */
    public function index($lang)
    {
        //this is the result
        $categories = array();

        //fetch category_descriptions from database
        $categories_ids = CategoryDescription::select('category_id')->distinct()->get();

        //mapping value
        foreach ($categories_ids as $category_id) {
            $category_in_db = CategoryDescription::where('category_id', $category_id->category_id)->where('language_id', $lang)->first();
            if ($category_in_db == null) {
                $category_in_db = CategoryDescription::where('category_id', $category_id->category_id)->first();
            }

            $category["category_id"] = $category_in_db->category_id;
            $category["name"] = $category_in_db->name;

            array_push($categories, $category);
        }

        //return
        return response()->json([
            "categories" => $categories,
        ], 200);

    }
}
