import React, { Component } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";

import OrderItemCard from "./OrderItemCard";

export default class ShoppingCart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shoppingCartIconImage: "",
      shoppingCartList: [],
      expand: false
    };

    this.getOrderTotalPrice = this.getOrderTotalPrice.bind(this);
    this.getOrderTotalQuantity = this.getOrderTotalQuantity.bind(this);
    this.showOrderList = this.showOrderList.bind(this);
    this.closeOrderList = this.closeOrderList.bind(this);
    this.toggleOrderList = this.toggleOrderList.bind(this);
  }

  componentDidMount() {
    this.setState({
      shoppingCartIconImage:
        "/table/public/images/layout/shopping_cart_icon.png",
      shoppingCartList: this.props.shoppingCartList
    });

    console.log(this.props.path);

    Axios.post("/table/public/api/initcart", {
      order_id: this.props.orderId,
      cdt: this.props.cdt,
      v: this.props.v,
      table_id: this.props.tableNumber,
      lang: 1,
      preorder: false
    })
      .then(res => {
        this.replaceList(res.data);
        this.setSpinnerStatus(false);
      })
      .catch(err => {
        this.setErrMsg(err.response.data.message);
        this.$router.push("/table/public/menu");
      });
  }

  componentWillReceiveProps(newProps) {
    this.setState({ shoppingCartList: newProps.shoppingCartList });
  }

  /**
   * calculate the total amount of current shopping order
   */
  getOrderTotalPrice() {
    if (this.state.shoppingCartList.length > 0) {
      let sum = 0;
      this.state.shoppingCartList.forEach(orderItem => {
        sum += orderItem.item.price * orderItem.quantity;
      });
      return sum.toFixed(2);
    } else {
      return 0;
    }
  }

  /**
   * calculate the total quantity of current shopping order
   */
  getOrderTotalQuantity() {
    if (this.state.shoppingCartList.length > 0) {
      let quantity = 0;
      this.state.shoppingCartList.forEach(orderItem => {
        quantity += orderItem.quantity;
      });
      return quantity;
    } else {
      return 0;
    }
  }

  /**
   * toggle the order list details show/not show
   */
  showOrderList() {
    this.setState({ expand: true });
  }

  closeOrderList() {
    this.setState({ expand: false });
  }

  toggleOrderList() {
    this.setState({ expand: !this.state.expand });
  }

  render() {
    return (
      <div>
        {this.state.expand ? (
          <div onClick={this.closeOrderList} className="shopping-cart__cover" />
        ) : null}
        <div className="shopping-cart">
          <div onClick={this.toggleOrderList} className="shopping-cart__header">
            <div className="shopping-cart__header__left-section">
              <img src={this.state.shoppingCartIconImage} alt="shopping cart" />
              {this.getOrderTotalQuantity() > 0 ? (
                <span className="shopping-cart__header__quantity">
                  {this.getOrderTotalQuantity()}
                </span>
              ) : null}
            </div>
            <div className="shopping-cart__header__right-section">
              <span className="shopping-cart__header__total-title">
                {this.props.app_conf.total}
              </span>
              <span className="shopping-cart__header__total-price">
                ${this.getOrderTotalPrice()}
              </span>
            </div>
          </div>

          {this.state.expand ? (
            <div className="shopping-cart__list-container">
              {this.state.shoppingCartList.map((orderItem, index) => {
                return (
                  <OrderItemCard
                    orderItem={orderItem}
                    index={index}
                    increaseShoppingCartItem={
                      this.props.increaseShoppingCartItem
                    }
                    decreaseShoppingCartItem={
                      this.props.decreaseShoppingCartItem
                    }
                    key={`orderItemInShoppingCart${index}`}
                    mode={1}
                  />
                );
              })}
            </div>
          ) : null}
          {this.state.expand ? (
            <div className="order-item-card__confirm-button-container">
              <Link
                to="/table/public/confirm"
                className="order-item-card__confirm-button"
              >
                {this.props.app_conf.confirm_order}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
