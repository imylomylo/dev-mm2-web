import axios from 'axios'

const BASE_DOMAIN = process.env.VUE_APP_MMBOTURL
const BASE_URL = BASE_DOMAIN 

export function cancelAllOrders() {
      console.log("Cancel All Orders");
      let requestData = {};
      requestData["method"] = "cancel_all_orders";
      requestData["cancel_by"] = { type: "All" };

      return axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/cancelAllOrders",
          requestData
        )
        .then(response => {
          console.log(JSON.stringify(response.data, null, 4))
          this.myOrders = []
        })
        .catch(e => {
          this.customerrors.push(e)
        })
}

export function cancelOrder(uuid){
      console.log("Cancel order: " + uuid)
      let requestData = {};
      requestData["method"] = "cancel_order";
      requestData["uuid"] = uuid;

      return axios
        .post(
            process.env.VUE_APP_MMBOTURL +
            "/cancelOrder?uuid="+requestData.uuid
        )
        .then(response => {
          console.log("Order result: " + JSON.stringify(response.data, null, 4));
          if( response.data.result === "success" ){
            console.log("success cancel, get myOrders again")
          }
        })
        .catch(e => {
          this.customerrors.push(e);
        });

}

export function getWalletBalance(ticker) {
  console.log("mm2MiddlewareClient.getWalletBalance: " + ticker)
      return axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/getBalance?coin=" +
            ticker
        )
        .then(response => {
          console.log(response.data);
          return response
        })
        .catch(e => {
          this.customerrors.push(e);
        })
}

export function getFiatCoinGecko(ticker){
      return axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/getpricecoingecko?coin=" +
            ticker
        )
        .then(response => {
          if( response.data.error){
// TODO handle this promise rejection better for caller
            console.log("No fiat for this coin")
            return new Error("No fiat for " + ticker)
          } else {
            return response
          }
        })
        .catch(e => {
          Promise.reject(e)
        })
}

export function getMyOrders(){
      return axios
        .get(
            process.env.VUE_APP_MMBOTURL +
            "/getOrders"
        )
        .then(response => {
          console.log(
            "My Orders: " +
//              JSON.stringify(response.data.result.maker_orders, null, 4)
              response.data.result.maker_orders
          )
          return response
        })
        .catch(e => {
          Promise.reject(e)
        })
}

export function sellBase(base, rel, price, amount){
      let requestData = {}
      requestData["base"] = base
      requestData["rel"] = rel
      requestData["method"] = "setprice"
      requestData["volume"] = amount
      requestData["price"] = price
      console.log("Sell BASE: " + JSON.stringify(requestData, null, 4))

      return axios
        .post(
            process.env.VUE_APP_MMBOTURL +
            "/doMaker?base="+requestData.base+"&rel="+requestData.rel+"&volume="+requestData.volume+"&price="+requestData.price
        )
        .then(response => {
          console.log("mm2middleware response to sell base: " + JSON.stringify(response, null, 2))
          return response
        })
        .catch(e => {
          this.customerrors.push(e)
        });
}

export function buyBase(base, rel, price, amount){
      console.log(
        "SingleOrder buy base: " +
          base +
          ", amount: " +
          amount +
          " @ " +
          price +
          " = " +
          amount * price
      )
      let requestData = {}
      requestData["rel"] = base //flipped for a buy because of underlying mm2 mechanism
      requestData["base"] = rel //flipped for a buy because of underlying mm2 mechanism
      requestData["method"] = "setprice"
      requestData["volume"] = (price*amount).toString()
      requestData["price"] = (1/price).toString()  // 1/price for a buy & needs to be a string for the makerbot api

      console.log("Buy BASE: " + JSON.stringify(requestData, null, 4))
      return axios
        .post(
            process.env.VUE_APP_MMBOTURL +
            "/doMaker?base="+requestData.base+"&rel="+requestData.rel+"&volume="+requestData.volume+"&price="+requestData.price
        )
        .then(response => {
          console.log("mm2middleware response to buy base: " + JSON.stringify(response.data, null, 2))
          return response
        })
        .catch(e => {
          this.customerrors.push(e)
        })
}

export function getMarket(base, rel){
      console.log("Show market:" + base + "/" + rel);
      return axios
        .post(
            process.env.VUE_APP_MMBOTURL +
            "/getMarket?base=" +
            base +
            "&rel=" +
            rel
        )
        .then(response => {
          return response
        })
        .catch(e => {
          this.customerrors.push(e)
        })
}

export function recentSwaps(limit = 10){
     return axios
       .get( process.env.VUE_APP_MMBOTURL + "/recentswaps")
       .then(response => {
         if (response.data !== undefined) {
           return response
         }
       })
       .catch(e => {
         this.customerrors.push(e)
       })
}

export function withdraw(ticker,amount){
  console.log("mm2MiddlewareClient.withdraw - Not Supported Yet")
// TODO
//    withdraw: function(ticker, amount) {
//      console.log("Withdraw: " + ticker);
//      let requestData = {};
//      requestData["coin"] = this.withdrawTicker;
//      requestData["to"] = this.withdrawAddress;
//      requestData["amount"] = this.withdrawAmount;
//      requestData["method"] = "withdraw";
//      requestData["userpass"] = process.env.VUE_APP_USERPASS;
//
//      axios
//        .post(
//          "http://" +
//            process.env.VUE_APP_WEBHOST +
//            ":" +
//            process.env.VUE_APP_WEBPORT +
//            "/" +
//            process.env.VUE_APP_MMBOTHOST +
//            ":" +
//            process.env.VUE_APP_MMBOTPORT +
//            "/api/v1/legacy/mm2/withdraw",
//          requestData
//        )
//        .then(response => {
//          console.log(JSON.stringify(response.data, null, 4));
//          let requestData = {};
//          requestData["coin"] = this.withdrawTicker;
//          requestData["tx_hex"] = response.data.tx_hex;
//          requestData["method"] = "send_raw_transaction";
//          requestData["userpass"] = process.env.VUE_APP_USERPASS;
//
//          axios
//            .post(
//              "http://" +
//                process.env.VUE_APP_MMBOTHOST +
//                ":" +
//                process.env.VUE_APP_MMBOTPORT +
//                "/api/v1/legacy/mm2/send_raw_transaction",
//              requestData
//            )
//            .then(response => {
//              console.log(JSON.stringify(response, null, 4));
//              this.hideWithdrawOverlay();
//            })
//            .catch(e => {
//              this.customerrors.push(e);
//            });
//        })
//        .catch(e => {
//          this.customerrors.push(e);
//        });
//    }
}

export default {
  cancelAllOrders,
  cancelOrder,
  getFiatCoinGecko,
  getMyOrders,
  getMarket,
  getWalletBalance,
  buyBase,
  sellBase,
  recentSwaps,
  withdraw
}
