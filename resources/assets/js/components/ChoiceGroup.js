import React, { Component } from "react";

export default class ChoiceGroup extends Component {
  constructor(props) {
    super(props);

    this.setChoice = this.setChoice.bind(this);
  }

  setChoice(e) {
    this.props.updateOrderItemChoice(e.target.value, this.props.index);
  }

  render() {
    // const imgSrc = `url("/table/public/images/items/${this.props.imgSrc}")`;
    return (
      <div className="choice-group">
        <div className="choice-group__title">{this.props.choiceGroup.type}</div>
        <div className="choice-group__subtitle">
          {this.props.app_conf.choice_form_title}
        </div>
        <div className="choice-group__content">
          {this.props.choiceGroup.choices.map((choice, index) => {
            return (
              <div
                key={`choiceTag${index}`}
                className="choice-group__content-wrapper"
              >
                <label className="choice-group__content-container">
                  <input
                    type="radio"
                    name={this.props.choiceGroup.type}
                    value={JSON.stringify(choice)}
                    onChange={this.setChoice}
                  />
                  <span className="checkmark-wrap">
                    <span
                      className="checkmark"
                      style={{
                        backgroundImage: `url("/table/public/images/items/${
                          choice.image
                        }")`
                      }}
                    />
                    <div className="choice-group__icon-cover" />
                  </span>
                </label>
                <span className="choice-group__choice-info">
                  <span className="choice-group__choice-name">
                    {choice.name}
                  </span>
                  <span className="choice-group__choice-price">
                    {parseInt(choice.price) === 0 ? "free" : choice.price}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
