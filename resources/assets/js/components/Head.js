import React, { Component } from "react";

export default class Head extends Component {
  constructor(props) {
    super(props);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  changeLanguage() {
    const lang = localStorage.getItem("aupos_language_code");
    if (lang === "1") {
      localStorage.setItem("aupos_language_code", 2);
    } else {
      localStorage.setItem("aupos_language_code", 1);
    }
    window.location.reload();
  }

  render() {
    return (
      <div className="head">
        <div className="left">{this.props.title}</div>
        <div className="right">
          {this.props.mode !== "menu" ? (
            <span className="button" onClick={this.changeLanguage}>
              <span className="label">{this.props.btnLabel}</span>
            </span>
          ) : null}
        </div>
      </div>
    );
  }
}
