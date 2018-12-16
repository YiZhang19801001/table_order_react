import React, { Component } from "react";

export default class OrderItemCard extends Component {
  constructor(props) {
    super(props);

    this.state = { orderItem: this.props.orderItem };

    this.getTotalPrice = this.getTotalPrice.bind(this);
    this.increase = this.increase.bind(this);
    this.decrease = this.decrease.bind(this);
  }

  componentDidMount() {
    this.setState({ orderItem: this.props.orderItem });
  }

  componentWillReceiveProps(newProps) {
    this.setState({ orderItem: newProps.orderItem });
  }

  getTotalPrice() {
    let resPrice = this.state.orderItem.item.price;

    // this.state.orderItem.item.choices.map(choice)
    const totalPrice = resPrice * this.state.orderItem.quantity;
    return totalPrice.toFixed(2);
  }

  increase() {
    this.props.increaseShoppingCartItem(this.props.index);
  }

  decrease() {
    this.props.decreaseShoppingCartItem(this.props.index);
  }

  render() {
    const Control_Pannel =
      this.props.mode === 1 ? (
        <div className="order-item-card__quantity-control">
          <span
            onClick={this.decrease}
            className="order-item-card__quantity-control__decrease"
          >
            <img src="/table/public/images/layout/btn_sub_white.png" alt="" />
          </span>
          <span className="order-item-card__quantity-control__quantity">
            {this.state.orderItem.quantity}
          </span>
          <span
            onClick={this.increase}
            className="order-item-card__quantity-control__increase"
          >
            <img src="/table/public/images/layout/btn_plus_white.png" alt="" />
          </span>
        </div>
      ) : (
        <div className="order-item-card__quantity-display">
          <span>X{this.state.orderItem.quantity}</span>
        </div>
      );
    return (
      <div className="order-item-card">
        <div className="order-item-card__img-container">
          <img
            src={`/table/public/images/items/${
              this.state.orderItem.item.image
            }`}
            alt=""
          />
        </div>
        <div className="order-item-card__info-container">
          <span className="order-item-card__item-name">
            {this.state.orderItem.item.name}
          </span>
          {this.state.orderItem.item.choices.map((choice, index) => {
            const pickedChoiceInfo = JSON.parse(choice.pickedChoice);
            return (
              <div
                className="order-item-card__choices"
                key={`orderItemChoiceInShoppingCart${index}`}
              >
                <div className="order-item-card__choices__type">
                  {choice.type}
                </div>
                <div className="order-item-card__choices__pickedChoice">
                  <span className="order-item-card__choices__pickedChoice-name">
                    {pickedChoiceInfo.name}
                  </span>
                  <span className="order-item-card__choices__pickedChoice-price">
                    ${pickedChoiceInfo.price}
                  </span>
                </div>
              </div>
            );
          })}
          {this.state.orderItem.item.options.map((option, index) => {
            return (
              <div key={`orderItemOptionInShoppingCart${index}`}>
                <div>{option.type}</div>
                <div>{option.pickedOption}</div>
              </div>
            );
          })}
        </div>
        <div className="order-item-card__quantity-control-container">
          {Control_Pannel}
        </div>
        <div className="order-item-card__total-price-container">
          <div className="order-item-card__total-price">
            ${this.getTotalPrice()}
          </div>
        </div>
      </div>
    );
  }
}
