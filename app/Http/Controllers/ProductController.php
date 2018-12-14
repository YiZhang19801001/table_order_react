<?php

namespace App\Http\Controllers;

use App\Category_description;
use App\Option_description;
use App\Option_value;
use App\Option_value_description;
use App\Product;
use App\Product_add_type;
use App\Product_description;
use App\Product_ext;
use App\Product_option_value;
use App\Product_to_category;

class ProductController extends Controller
{
    public function index($lang)
    {
        /** product object full details
         * need for displaying:
         * {
         *  cateory name:string,
         *  products: [
         *      {
         *          product_name: string,
         *          product_description: string,
         *          product_choices: [
         *              {
         *                  add_type_name:string,
         *                  choice_items: [
         *                      product_ext_name,
         *                      price
         *                  ]
         *              }
         *          ]
         *      }
         * ]
         * }
         */
        //fetch app_conf
        //$lang = config("app.lang");

        /** clear mode do not need details [1], full detail mode need everything. [9]*/
        $mode = config("app.show_options");

        /** get all categories first */
        //this is the result
        $categories = array();

        //fetch category_descriptions from database
        $categories_ids = Category_description::select('category_id')->distinct()->get();

        //mapping value
        foreach ($categories_ids as $category_id) {
            $category_in_db = Category_description::where('category_id', $category_id->category_id)->where('language_id', $lang)->first();
            if ($category_in_db == null) {
                $category_in_db = Category_description::where('category_id', $category_id->category_id)->first();
            }

            $category["category_id"] = $category_in_db->category_id;
            $category["name"] = $category_in_db->name;

            array_push($categories, $category);
        }

        //declare an array to store the new [product_list(group by category)]
        $result = [];

        //loop cateogries to generate groups of products for showing in view
        foreach ($categories as $category) {
            $new_category["name"] = $category["name"];
            $new_category["id"] = $category["category_id"];

            $p_ids = Product_to_category::where('category_id', $category["category_id"])->get();
            $products_groupby_category = [];

            foreach ($p_ids as $id) {
                /** select the target product in DB then map the need value to new_product */

                //select target product in DB
                $target_product = Product_description::where('product_id', $id->product_id)->where('language_id', $lang)->first();
                if ($target_product === null) {
                    $target_product = Product_description::where('product_id', $id->product_id)->first();
                }
                /** create price value*/
                //fetch price first
                $p = Product::where('product_id', $id->product_id)->first();
                $price = $p->price;
                //cut after 2 digts decimal point, i.e 1.0000000 -> 1.00
                $posOfdecimal = strpos($price, ".");
                $length = $posOfdecimal + 3;
                $price = substr($price, 0, $length);
                /** end of create price value */

                //create product code value
                $upc = $p->upc;

                //map values to product
                $new_product["product_id"] = $target_product->product_id;
                $new_product["name"] = $target_product->name;
                $new_product["price"] = $price;
                $new_product["upc"] = $upc;
                $new_product["description"] = $target_product->description;

                $image_path = '/table/public/images/items/'.$p->image;
                $new_product["image"] = "";
                if ($p->image === null || !file_exists($_SERVER['DOCUMENT_ROOT'].$image_path)) {
                    $new_product["image"] = 'default_product.jpg';
                    // $new_product["image"] = '24.jpg';

                } else {

                    $new_product["image"] = $p->image;
                }
                
                //details only needed for show options mode
                if ($mode == 9) {
                    $new_product["choices"] = $this->getChoicesHelper($target_product->product_id, $lang);
                    $new_product["options"] = $this->getOptionsHelper($target_product->product_id, $lang);
                }

                //save new product to certain group depending on category name
                array_push($products_groupby_category, $new_product);
            }

            /** save products which are grouped by category in the foreach loop already */
            $product_group = ["categorys" => $new_category, "products" => $products_groupby_category];
            array_push($result, $product_group);
        }


        //return the result to client side
        return response()->json([
            "products" => $result,
        ], 200);

    }

    public function getChoicesHelper($id, $lang)
    {
        /**this is the returning result */
        $choices_groupby_type = array();

        /** find out all types for certain product */
        $typeIds_to_product = Product_ext::where('product_id', $id)->select('type')->distinct()->get(); //return array(obj)

        //Fix Lang:
        foreach ($typeIds_to_product as $typeId_to_product) {
            $choices = array();
            /**oc_product_add_type: [add_type_id:int] [name:string][type:bit][required:bit][checkbox:bit] */
            $choice = Product_add_type::where('add_type_id', $typeId_to_product->type)->first();
            /**oc_product_ext: [product_ext_id:int][product_id:int][type:int][name:string][price:float] */
            $choices_to_type = Product_ext::where('product_id', $id)->where('type', $choice["add_type_id"])->get();

            foreach ($choices_to_type as $choice_to_type) {
                $choices_item["product_ext_id"] = $choice_to_type["product_ext_id"];
                if ($lang == 1) {
                    $choices_item["name"] = $choice_to_type["name"];

                } else {
                    $choices_item["name"] = $choice_to_type["name_2"];

                }
                $choices_item["price"] = $choice_to_type["price"];
                $choices_item["barcode"] = $choice_to_type["barcode"];
                array_push($choices, $choices_item);
            }

            /**map value */
            $new_choice["type_id"] = $typeId_to_product["type"];
            $new_choice["type"] = $choice["name"];
            $new_choice["choices"] = $choices;

            array_push($choices_groupby_type, $new_choice);
        }

        return $choices_groupby_type;
    }

    public function getOptionsHelper($id, $lang)
    {
        /** overview
         * 1. use product id found all records in oc_product_option_value [option_id,option_value_id]
         * 2. option_id found option_name
         * 3. option_value_id found option_value_name
         * 4. should output an array
         */

        /** this is result container */
        $productOptionList = array();

        /**oc_product_option_value(many cols only short list here):
         * [product_option_value_id:int][product_option_id:int][product_id:int][option_id:int]
         * [option_value_id:int][price:float ex:1.0000]
         * ??::[display:bit]
         */
        $productOptionValueList = Product_option_value::where('product_id', $id)->get();

        $option_ids = Product_option_value::where('product_id', $id)->select('option_id')->distinct()->get();

        /** create option details */
        foreach ($option_ids as $option_id) {
            /**add option name & language_id,sort_order to the obj
             * oc_option_description: [option_id:int][language_id:bit][name:string]
             */
            $option_name = Option_description::where('option_id', $option_id->option_id)->where('language_id', $lang)->first();
            $option_name = $option_name["name"];

            /**ToDo: may use for display*/
            // $sort_order = Option::where('option_id',$option_id)->first()->sort_order;

            /**create option value group */
            $option_value_group = array();

            foreach ($productOptionValueList as $product_option_value) {

                if ($product_option_value->option_id === $option_id->option_id) {
                    /**add option_value name, sort_order to the obj */
                    $option_value_id = $product_option_value->option_value_id;

                    /** oc_option_value:[option_value_id:int][option_id:int][image:varchar(255)    ][sort_order:int(3)]*/
                    /**ToDo: may use for display*/
                    // $option_value_sort_order = Option_value::where('option_value_id',$option_value_id)->first()->sort_order;

                    /** oc_option_value_description
                     * [option_value_id:int(11)][language_id:int(11)][option_id:int(11)][name:varchar(128)]
                     */
                    $option_value_name = Option_value_description::where('option_value_id', $option_value_id)->where('language_id', $lang)->first();

                    $option_value_name = $option_value_name["name"];
                    /** create price
                     * parse price to float */
                    $price = $product_option_value->price;
                    $posOfdecimal = strpos($price, ".");
                    //cut after 2 digts decimal point
                    $length = $posOfdecimal + 3;
                    $price = substr($price, 0, $length);

                    //map values
                    $new_option_value = array();

                    $new_option_value["product_option_value_id"] = $product_option_value->product_option_value_id;
                    $new_option_value["option_value_name"] = $option_value_name;
                    //$new_option_value["option_value_sort_order"] = $option_value_sort_order;
                    $new_option_value["price"] = $price;

                    array_push($option_value_group, $new_option_value);
                    /** object structure
                     * [
                     *   {
                     *       "product_option_value_id": 22,
                     *       "option_value_name": "Small",
                     *       "option_value_sort_order": 0,
                     *       "price": "2.00"
                     *   }
                    ] */
                }
            }

            /**add new option with value group to array */
            $new_productOption = array("option_id" => $option_id, "option_name" => $option_name, "option_values" => $option_value_group);

            array_push($productOptionList, $new_productOption);
        }

        /** return manipulated data for further use */
        return $productOptionList;
    }
}
