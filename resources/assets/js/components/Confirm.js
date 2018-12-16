import React, { Component } from "react";
import { QRCode } from "react-qr-svg";
import { Link } from "react-router-dom";

import OrderItemCard from "./OrderItemCard";

export default class Confirm extends Component {
  constructor(props) {
    super(props);

    this.state = { qrString: "", shoppingCartList: [] };

    this.createQrCode = this.createQrCode.bind(this);
    this.getOrderItemQuantityTotal = this.getOrderItemQuantityTotal.bind(this);
    this.getTotalPrice = this.getTotalPrice.bind(this);
  }

  componentDidMount() {
    this.setState({
      shoppingCartList: JSON.parse(localStorage.getItem("preorderList"))
    });
  }

  getOrderItemQuantityTotal() {
    let quantity = 0;

    this.state.shoppingCartList.map(orderItem => {
      quantity += orderItem.quantity;
    });

    return quantity;
  }

  createQrCode() {
    let qr = "=QROD=";
    if (
      this.state.shoppingCartList !== null ||
      this.state.shoppingCartList !== 0
    ) {
      this.state.shoppingCartList.forEach(el => {
        qr = qr + el.item.upc + ",";
        qr = qr + el.quantity + ",";
        qr = qr + "0" + ";";
        el.item.choices.forEach(choice => {
          qr =
            qr +
            JSON.parse(choice.pickedChoice).barcode +
            "," +
            el.quantity +
            "," +
            0 +
            ";";
        });
        el.item.options.forEach(option => {
          qr = qr + option.option_name + "," + option.pickedOption + ",";
        });
        //qr = qr + "0" + ";";
      });
      this.QrValue = qr.substr(0, qr.length - 1);
    } else {
      this.QrValue = qr;
    }

    return qr;
  }

  getTotalPrice() {
    let sum = 0;

    this.state.shoppingCartList.map(orderItem => {
      sum += orderItem.quantity * orderItem.item.price;
    });

    return sum.toFixed(2);
  }

  render() {
    return (
      <div className="confirm">
        <div className="confirm__title">
          <img src="/table/public/images/layout/icon_confirm.png" alt="" />
          <span className="confirm__title-text">
            {this.props.app_conf.preorder_confirm_text}
          </span>
        </div>
        <div className="qrcode-section">
          <div className="qrcode-container">
            <QRCode
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="Q"
              style={{ width: 180 }}
              value={this.createQrCode()}
            />
          </div>
          <div className="confirm__subtitle">
            {this.props.app_conf.preorder_qr_tips}
          </div>
        </div>
        <div className="confirm__order-list__title">
          <span className="confirm__order-list__title-text">
            {this.props.app_conf.your_order_title}
          </span>
          <span className="confirm__order-list__quantity">
            <span className="confirm__order-list__quantity-title">
              {this.props.app_conf.quantity}
            </span>
            <span className="confirm__order-list__quantity-number">
              {this.getOrderItemQuantityTotal()}
            </span>
          </span>
        </div>
        <div className="confirm__order-list__container">
          {this.state.shoppingCartList.map((orderItem, index) => {
            return (
              <OrderItemCard
                orderItem={orderItem}
                index={index}
                increaseShoppingCartItem={this.props.increaseShoppingCartItem}
                decreaseShoppingCartItem={this.props.decreaseShoppingCartItem}
                mode={2}
                key={`orderItemInShoppingCart${index}`}
              />
            );
          })}
        </div>
        <div className="confirm__order-list__total">
          <span className="confirm__order-list__total-title">
            {this.props.app_conf.confirm_total}
          </span>
          <span className="confirm__order-list__total-number">
            ${this.getTotalPrice()}
          </span>
        </div>
        <div className="confirm__back-button-container">
          <Link to={`/table/public`} className="confirm__back-button">
            {this.props.app_conf.continue_order}
          </Link>
        </div>
      </div>
    );
  }
}