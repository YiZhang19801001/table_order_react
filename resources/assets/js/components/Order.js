import React, { Component } from "react";
import Axios from "axios";
import { Link, Element, Events, animateScroll as scroll } from "react-scroll";
const queryString = require("query-string");

import Head from "./Head";
import ProductCard from "./ProductCard";
import ShoppingCart from "./ShoppingCart";

export default class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryList: [],
      productGroupList: [],
      navBarItems: [],
      shoppingCartList: []
    };

    this.redirectToMenu = this.redirectToMenu.bind(this);
  }

  componentDidMount() {
    console.log(this.props.match.params);

    Axios.get(`/table/public/api/products/1`).then(res => {
      this.setState({ productGroupList: res.data.products });
    });

    Axios.get(`/table/public/api/categories/1`).then(res => {
      this.setState({ categoryList: res.data.categories });
    });

    for (let index = 0; index < this.state.categoryList.length; index++) {
      this.state.navBarItems[index] = {
        lable: "nav" + this.state.categoryList[index].category_id,
        target: "nav" + this.state.categoryList[index].category_id
      };
    }

    this.setState({ shoppingCartList: this.props.shoppingCartList });
  }

  componentWillReceiveProps(newProps) {
    this.setState({ shoppingCartList: newProps.shoppingCartList });
  }

  redirectToMenu(msg) {
    this.props.history.push(`/table/public/menu/${msg}`);
  }

  render() {
    const parsed = queryString.parse(this.props.location.search);
    return (
      <div className="order">
        <Head
          title={
            this.props.mode === "preorder"
              ? this.props.app_conf.preorder_title
              : `${this.props.app_conf.app_header_title} ${
                  this.props.match.params.table
                }`
          }
          btnLabel={this.props.app_conf.lang_switch_cn}
        />
        <div className="main">
          <div className="category-list">
            {this.state.categoryList.map(category => {
              return (
                <Link
                  key={`categoryList${category.category_id}`}
                  className="category-list-item"
                  activeClass="active"
                  to={`nav${category.category_id}`}
                  isDynamic={true}
                  offset={-100}
                  spy={true}
                  smooth={true}
                  duration={300}
                  onSetActive={this.handleSetActive}
                  containerId="product-list"
                >
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </div>

          <div id="product-list" className="product-list">
            {this.state.productGroupList.map(productGroup => {
              return (
                <Element
                  key={`productGroup${productGroup.category.category_id}`}
                  className="product-group"
                  name={`nav${productGroup.category.category_id}`}
                >
                  <span className="category-title">
                    {productGroup.category.name}
                  </span>
                  {productGroup.products.map(product => {
                    return (
                      <ProductCard
                        shoppingCartList={this.state.shoppingCartList}
                        updateShoppingCartList={
                          this.props.updateShoppingCartList
                        }
                        key={`product${product.product_id}`}
                        product={product}
                        app_conf={this.props.app_conf}
                        mode={this.props.mode}
                        orderId={this.props.match.params.orderid}
                        tableNumber={this.props.match.params.table}
                      />
                    );
                  })}
                </Element>
              );
            })}
          </div>
        </div>
        <ShoppingCart
          app_conf={this.props.app_conf}
          shoppingCartList={this.state.shoppingCartList}
          increaseShoppingCartItem={this.props.increaseShoppingCartItem}
          decreaseShoppingCartItem={this.props.decreaseShoppingCartItem}
          updateShoppingCartList={this.props.updateShoppingCartList}
          updateOrderList={this.props.updateOrderList}
          mode={this.props.mode}
          orderId={this.props.match.params.orderid}
          tableNumber={this.props.match.params.table}
          cdt={parsed.cdt}
          v={parsed.v}
          redirectToMenu={this.redirectToMenu}
        />
      </div>
    );
  }
}
