import React, { Component } from "react";

import ChoiceGroup from "./ChoiceGroup";

export default class ChoiceForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pickedChoice: "",
      pickedOption: "",
      product: { choices: [] },
      pickedChoice: ""
    };

    this.updateShoppingCartList = this.updateShoppingCartList.bind(this);
    this.updateOrderItemChoice = this.updateOrderItemChoice.bind(this);
  }

  componentDidMount() {
    this.setState({
      product: this.props.product
    });
  }

  /**
   * call the function in app.js to update details of shopping cart item list
   *
   * @param {bool} isCallApi- will call api if true and update database also broadcasting this item to the channel
   * @param {product} orderItem- new order item need to be modified
   * @param {'add' or 'sub'} action- modifier
   * @param {string} orderId- order id is the PK in temp_orders table
   * @param {string} tableId- table id
   */
  updateShoppingCartList() {
    const orderItem = {
      ...this.state.product,
      choices: this.state.product.choices.map(choice => {
        return { ...choice, pickedChoice: this.state.pickedChoice };
      })
    };
    this.props.updateShoppingCartList(
      true,
      orderItem,
      this.props.mode,
      "add",
      this.props.orderId,
      this.props.tableNumber
    );
    this.props.closeChoiceForm();
  }

  /**
   * set picked choice for saving as order item
   *
   * @param {int} index
   */
  updateOrderItemChoice(pickedChoice, index) {
    //this.state.product.choices[index].pickedChoice = pickedChoice;
    this.setState({ pickedChoice });
    // const newStateProduct = this.state.product;
    // this.setState({ product: newStateProduct });
  }

  render() {
    const imgSrc = `/table/public/images/items/${this.state.product.image}`;
    return (
      <div>
        <div
          onClick={this.props.closeChoiceForm}
          className="choice-form-cover"
        />
        <div className="choice-form">
          <div className="header">
            <div className="choice-form-img-container">
              <img src={imgSrc} alt={this.state.product.name} />
            </div>
            <div className="choice-form-product-info">
              <div className="choice-form-product-name">
                {this.state.product.name}
              </div>
              <div className="choice-form-product-price">
                ${this.state.product.price}
              </div>
            </div>
          </div>
          <div className="choice-form__list-container">
            <div className="choice-form__list-content">
              {this.state.product.choices.map((choiceGroup, index) => {
                return (
                  <ChoiceGroup
                    key={`choiceGroup${index}`}
                    choiceGroup={choiceGroup}
                    updateOrderItemChoice={this.updateOrderItemChoice}
                    app_conf={this.props.app_conf}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
          <div className="choice-form__confirm-button-container">
            <div
              onClick={this.updateShoppingCartList}
              className="choice-form__confirm-button"
            >
              {this.props.app_conf.choice_form_button}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
