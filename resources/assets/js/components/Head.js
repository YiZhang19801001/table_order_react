import React, { Component } from "react";
import Axios from "axios";

export default class Head extends Component {
  constructor(props) {
    super(props);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  changeLanguage() {
    alert("change language");
  }

  render() {
    return (
      <div className="head">
        <div className="left">{this.props.title}</div>
        <div className="right">
          <span className="button" onClick={this.changeLanguage}>
            <span className="label">{this.props.btnLabel}</span>
          </span>
        </div>
      </div>
    );
  }
}
