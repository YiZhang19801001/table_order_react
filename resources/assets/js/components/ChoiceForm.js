import React, { Component } from "react";

import ChoiceGroup from "./ChoiceGroup";

export default class ChoiceForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pickedChoice: "",
      pickedOption: "",
      product: this.props.product
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
   */
  updateShoppingCartList() {
    this.props.updateShoppingCartList(this.state.product);
    this.props.closeChoiceForm();
  }

  /**
   * set picked choice for saving as order item
   *
   * @param {int} index
   */
  updateOrderItemChoice(pickedChoice, index) {
    this.state.product.choices[index].pickedChoice = pickedChoice;
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
                    imgSrc={this.props.product.image}
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
