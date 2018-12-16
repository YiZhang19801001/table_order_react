/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

require("./bootstrap");

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

import ReactDom from "react-dom";
import React, { Component } from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";
import Axios from "axios";

import Order from "./components/Order";
import Confirm from "./components/Confirm";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = { shoppingCartList: [], app_conf: {} };

    this.updateShoppingCartList = this.updateShoppingCartList.bind(this);
    this.increaseShoppingCartItem = this.increaseShoppingCartItem.bind(this);
    this.decreaseShoppingCartItem = this.decreaseShoppingCartItem.bind(this);
    this.refreshStateShoppingCartList = this.refreshStateShoppingCartList.bind(
      this
    );
    this.updateOrderList = this.updateOrderList.bind(this);
  }

  componentDidMount() {
    let lang = 0;
    if (localStorage.getItem("aupos_language_code")) {
      lang = localStorage.getItem("aupos_language_code");
    }

    Axios.get(`/table/public/api/init/${lang}`).then(res => {
      this.setState({ app_conf: res.data.app_conf });
      if (this.state.app_conf.preorder) {
        if (localStorage.getItem("preorderList")) {
          this.setState({
            shoppingCartList: JSON.parse(localStorage.getItem("preorderList"))
          });
        }
      } else {
        // Axios.post(`/table/public/api/initcart`)
        //   .then(res => {
        //     this.setState({ shoppingCartList: res.data.shoppingCartList });
        //   })
        //   .catch(err => {
        //     console.log(err.response.data.message);
        //   });

        Echo.channel("tableOrder").listen("UpdateOrder", e => {
          this.setState({ shoppingCartList: e.orderList });
        });
      }
    });
  }

  /**
   * retreive order list data from database
   *
   */
  updateOrderList(orderList) {
    this.setState({ shoppingCartList: orderList });
  }

  /**
   * add a new item into the order list
   * 1. preorder mode: only store in localstorage["aupos_preorder"]
   * 2. table order mode: save to data base temp table and then send a modify broadcast into channel
   *
   * @param {product} item
   */
  updateShoppingCartList(item) {
    if (this.state.app_conf.preorder) {
      let flag = false;
      for (let i = 0; i < this.state.shoppingCartList.length; i++) {
        if (
          this.state.shoppingCartList[i].item.product_id === item.product_id
        ) {
          flag = true;
          if (this.state.shoppingCartList[i].item.options.length > 0) {
            for (
              let a = 0;
              a < this.state.shoppingCartList[i].item.options.length;
              a++
            ) {
              const option = this.state.shoppingCartList[i].item.options[a];
              const new_option = item.options[a];
              if (option.pickedOption !== new_option) {
                flag = false;
                break;
              }
            }
          }

          if (
            flag === false ||
            this.state.shoppingCartList[i].item.choices.length < 1
          ) {
            break;
          } else {
            for (
              let b = 0;
              b < this.state.shoppingCartList[i].item.choices.length;
              b++
            ) {
              const choice = this.state.shoppingCartList[i].item.choices[b];
              const new_choice = item.choices[b];
              if (choice.pickedChoice !== new_choice.pickedChoice) {
                flag = false;
                break;
              }
            }
          }
        }
        if (flag) {
          this.state.shoppingCartList[i].quantity++;
          this.refreshStateShoppingCartList();
          break;
        }
      }
      // if product_id not exist add new
      if (!flag) {
        this.state.shoppingCartList.push({
          item: item,
          quantity: 1
        });
        this.refreshStateShoppingCartList();
      }
    } else {
      axios.post("/table/public/api/orderitem", {
        orderItem: payload,
        orderId: state.orderId,
        table_id: state.table_number,
        lang: state.lang
      });
    }
  }

  /**
   * incease quantity of an order item in the shopping cart
   *
   * @param {int} index - position of this order item in the shopping cart list
   */
  increaseShoppingCartItem(index) {
    this.state.shoppingCartList[index].quantity++;
    this.refreshStateShoppingCartList();
  }

  /**
   * decrease quantity of an order item in the shopping cart, if after decrement the quantity equal to 0 then delete this record entirely
   *
   * @param {int} index - position of this order item in the shopping cart list
   */
  decreaseShoppingCartItem(index) {
    if (this.state.shoppingCartList[index].quantity > 1) {
      this.state.shoppingCartList[index].quantity--;
    } else {
      this.state.shoppingCartList.splice(index, 1);
    }

    this.refreshStateShoppingCartList();
  }

  refreshStateShoppingCartList() {
    const arrRes = this.state.shoppingCartList;
    this.setState({ shoppingCartList: arrRes });
    localStorage.setItem(
      "preorderList",
      JSON.stringify(this.state.shoppingCartList)
    );
    Axios.post(`/table/public/api/test`, {
      orderList: this.state.shoppingCartList
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Route
            exact
            path="/table/public/preorder"
            render={props => (
              <Order
                updateShoppingCartList={this.updateShoppingCartList}
                shoppingCartList={this.state.shoppingCartList}
                app_conf={this.state.app_conf}
                increaseShoppingCartItem={this.increaseShoppingCartItem}
                decreaseShoppingCartItem={this.decreaseShoppingCartItem}
                updateOrderList={this.updateOrderList}
                mode={"preorder"}
                {...props}
              />
            )}
          />
          <Route
            exact
            path="/table/public/table/:table/orderid/:orderid"
            render={props => (
              <Order
                updateShoppingCartList={this.updateShoppingCartList}
                shoppingCartList={this.state.shoppingCartList}
                app_conf={this.state.app_conf}
                increaseShoppingCartItem={this.increaseShoppingCartItem}
                decreaseShoppingCartItem={this.decreaseShoppingCartItem}
                mode={"table"}
                updateOrderList={this.updateOrderList}
                {...props}
              />
            )}
          />
          <Route
            exact
            path="/table/public/confirm"
            render={props => (
              <Confirm
                shoppingCartList={this.state.shoppingCartList}
                app_conf={this.state.app_conf}
                {...props}
              />
            )}
          />
        </div>
      </Router>
    );
  }
}

if (document.getElementById("root")) {
  ReactDom.render(<App />, document.getElementById("root"));
}
