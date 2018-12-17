import React, { Component } from "react";
import Axios from "axios";
import { Link, Element, Events, animateScroll as scroll } from "react-scroll";
const queryString = require("query-string");

import Head from "./Head";
import ProductCard from "./ProductCard";
export default class Menu extends Component {
  constructor(props) {
    super(props);

    this.state = { productGroupList: [], categoryList: [], showErr: true };
    this.closeErrMsg = this.closeErrMsg.bind(this);
  }

  componentDidMount() {
    Axios.get(`/table/public/api/products/1`).then(res => {
      this.setState({ productGroupList: res.data.products });
    });

    Axios.get(`/table/public/api/categories/1`).then(res => {
      this.setState({ categoryList: res.data.categories });
    });
  }

  closeErrMsg() {
    this.setState({ showErr: false });
  }

  render() {
    return (
      <div className="order">
        <Head
          title={this.props.app_conf.menu}
          mode={"menu"}
          btnLabel={this.props.app_conf.lang_switch_en}
        />
        {this.state.showErr ? <div className="menu-cover" /> : null}
        {this.state.showErr ? (
          <div className="menu-err-dialog">
            <div onClick={this.closeErrMsg} className="menu-close-button">
              X
            </div>
            <div className="menu-error-icon">
              <img src="/table/public/images/layout/error.png" alt="" />
              <span className="menu-error-title">Sorry!</span>
            </div>
            <div className="menu-error-message">
              {this.props.match.params.message
                ? this.props.match.params.message
                : "This QR code is invalid.Please contact our staffs."}
            </div>
          </div>
        ) : null}
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
                        key={`product${product.product_id}`}
                        product={product}
                        app_conf={this.props.app_conf}
                        mode={"menu"}
                      />
                    );
                  })}
                </Element>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
