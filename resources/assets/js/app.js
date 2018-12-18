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
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Axios from "axios";

import Order from "./components/Order";
import Confirm from "./components/Confirm";
import Menu from "./components/Menu";
import Complete from "./components/Complete";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shoppingCartList: [],
      historyCartList: [],
      app_conf: {},
      tableId: "",
      orderId: "",
      userId: "",
      originPath: "",
      v: ""
    };

    this.updateShoppingCartList = this.updateShoppingCartList.bind(this);
    this.increaseShoppingCartItem = this.increaseShoppingCartItem.bind(this);
    this.decreaseShoppingCartItem = this.decreaseShoppingCartItem.bind(this);
    this.refreshStateShoppingCartList = this.refreshStateShoppingCartList.bind(
      this
    );
    this.updateOrderList = this.updateOrderList.bind(this);
    this.setOriginPath = this.setOriginPath.bind(this);
    this.setV = this.setV.bind(this);
    this.updateHistoryCartList = this.updateHistoryCartList.bind(this);
  }

  componentDidMount() {
    let lang = 1;
    if (localStorage.getItem("aupos_language_code")) {
      lang = localStorage.getItem("aupos_language_code");
    } else {
      localStorage.setItem("aupos_laguage_code", 1);
    }

    Axios.get(`/table/public/api/init/${lang}`).then(res => {
      this.setState({
        app_conf: res.data.app_conf,
        userId: res.data.userId
      });
    });
  }

  updateHistoryCartList(list) {
    this.setState({ historyCartList: list });
  }
  setOriginPath(path) {
    this.setState({ originPath: path });
  }

  /**
   * retreive order list data from database
   *
   */
  updateOrderList(orderList) {
    //console.log("app.js/updateOrderList has been called", orderList);
    this.setState({ shoppingCartList: orderList });
  }

  /**
   * add a new item into the order list
   * 1. preorder mode: only store in localstorage["aupos_preorder"]
   * 2. table order mode: save to data base temp table and then send a modify broadcast into channel
   *
   * @param {product} item
   */
  updateShoppingCartList(isCallApi, item, mode, action, orderId, tableId) {
    // console.log("update order list in preorder mode", item);
    // console.log("mode", mode);
    // console.log("action", action);
    let flag = false;
    for (let i = 0; i < this.state.shoppingCartList.length; i++) {
      if (this.state.shoppingCartList[i].item.product_id === item.product_id) {
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
        if (action == "add") {
          this.state.shoppingCartList[i].quantity++;
        } else if (action == "sub") {
          if (this.state.shoppingCartList[i].quantity > 1) {
            this.state.shoppingCartList[i].quantity--;
          } else {
            this.state.shoppingCartList.splice(i, 1);
          }
        }

        this.refreshStateShoppingCartList(
          isCallApi,
          mode,
          action,
          item,
          orderId,
          tableId
        );

        break;
      }
    }
    // if product_id not exist add new
    if (!flag && action === "add") {
      this.state.shoppingCartList.push({
        item: item,
        quantity: 1
      });

      this.refreshStateShoppingCartList(
        isCallApi,
        mode,
        action,
        item,
        orderId,
        tableId
      );
    }
  }
  setV(v) {
    this.setState({ v: v });
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

  /**
   * update order list use setState method to update the list in all relative components
   */
  refreshStateShoppingCartList(
    isCallApi,
    mode,
    action,
    item,
    orderId,
    tableId
  ) {
    const arrRes = this.state.shoppingCartList;
    this.setState({ shoppingCartList: arrRes });
    // console.log("refresh is call api: ", isCallApi);
    // console.log("refresh mode: ", mode);
    // console.log("refresh item: ", item);
    // console.log("refresh order id: ", orderId);
    if (mode === "preorder") {
      localStorage.setItem(
        "preorderList",
        JSON.stringify(this.state.shoppingCartList)
      );
    } else if (mode === "table" && isCallApi === true) {
      //console.log(this.state.userId);
      Axios.post("/table/public/api/updateorderlist", {
        action: action,
        orderItem: item,
        userId: this.state.userId,
        orderId: orderId,
        tableId: tableId
      });
    }
  }

  render() {
    return (
      <Router>
        <Switch>
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
                lang={this.state.lang}
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
                setOrderId={this.setOrderId}
                setTableId={this.setTableId}
                mode={"table"}
                updateOrderList={this.updateOrderList}
                userId={this.state.userId}
                setOriginPath={this.setOriginPath}
                lang={this.state.lang}
                setV={this.setV}
                updateHistoryCartList={this.updateHistoryCartList}
                historyCartList={this.state.historyCartList}
                {...props}
              />
            )}
          />
          <Route
            exact
            path="/table/public/confirm/:mode"
            render={props => (
              <Confirm
                shoppingCartList={this.state.shoppingCartList}
                app_conf={this.state.app_conf}
                mode={"preorder"}
                {...props}
              />
            )}
          />
          <Route
            exact
            path="/table/public/confirm/:mode/:tableId/:orderId"
            render={props => (
              <Confirm
                shoppingCartList={this.state.shoppingCartList}
                app_conf={this.state.app_conf}
                mode={"table"}
                updateHistoryCartList={this.updateHistoryCartList}
                originPath={this.state.originPath}
                v={this.state.v}
                {...props}
              />
            )}
          />
          <Route
            exact
            path="/table/public/complete/:tableId/:orderId"
            render={props => (
              <Complete
                shoppingCartList={this.state.shoppingCartList}
                app_conf={this.state.app_conf}
                mode={"table"}
                originPath={this.state.originPath}
                historyCartList={this.state.historyCartList}
                {...props}
              />
            )}
          />
          <Route
            exact
            path="/table/public/menu/:message"
            render={props => <Menu app_conf={this.state.app_conf} {...props} />}
          />
          <Route
            render={props => <Menu app_conf={this.state.app_conf} {...props} />}
          />
        </Switch>
      </Router>
    );
  }
}

if (document.getElementById("root")) {
  ReactDom.render(<App />, document.getElementById("root"));
}
