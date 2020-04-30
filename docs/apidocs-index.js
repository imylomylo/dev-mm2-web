
/**
 * @api {BOT} axiosGET(url) axiosGET(url) 
 * @apiExample {internal} Example usage:
 * axiosGET("https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-" + base).then(data => {
 *   res.json(
 *     data
 *   );
 * })
 * @apiName axiosGET
 * @apiGroup BotDataUtils
 *
 * @apiDescription Re-usable utility method.
 *
 * @apiParam {String} url the url to hit with the request
 */
function axiosGET(url) {
  return axios.get(url).then(response => {
    return response.data
  })
}

/**
 * @api {BOT} sleep(ms) sleep(ms) 
 * @apiExample {internal} Example usage:
 *   await sleep(2000);
 * @apiName sleep
 * @apiGroup BotDataUtils
 *
 * @apiDescription A way to make nodejs sleep.
 *
 * @apiParam {Number} ms the time in milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// marketmaker strategy update loop & order integrity

/**
 * @api {BOT} runloop() runloop() 
 * @apiExample {internal} Example usage:
 * async function runloop() {
 *   console.log('Taking a break...');
 *   await sleep(2000);
 *   console.log('Ready to do stuff...');
 *   bringOrdersToIntegrity()
 * }
 * @apiName runloop
 * @apiGroup BotLogic
 *
 * @apiDescription Runnable method that loops ad-infinitum keeping marketmaking user activities running.
 *
 */
async function runloop() {

  console.log('Taking a break...');
  await sleep(2000);
  console.log('Two seconds later, showing sleep in a loop...');

  let i = 0
  // Sleep in loop
  for (let i = 0; i < 10; i++) {
    await sleep(2000);
    if (i == 3) {
      bringOrdersToIntegrity()
    }
    if (i == 9) {
      saveLiveConfig()
      i = 0
    }
    console.log(i);
  }
}
/**
 * @api {BOT} saveLiveConfig() saveLiveConfig() 
 * @apiExample {internal} Example usage:
 *   if (i == timeToSave) {
 *     saveLiveConfig()
 *     i = 0
 *   }
 * @apiName saveLiveConfig
 * @apiGroup BotDataUtils
 *
 * @apiDescription Writes the live config to a file so for persistence.
 *
 */
function saveLiveConfig() {
  const snapshot = liveConfig
  fs.writeFile("output.json", JSON.stringify(snapshot), 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      console.log(err);
    } else {
      console.log("JSON file has been saved.");
    }
  });
}

/**
 * @api {BOT} bringOrdersToIntegrity() bringOrdersToIntegrity() 
 * @apiName bringOrdersToIntegrity
 * @apiGroup BotLogic
 *
 * @apiDescription Stub method that would normally call updated prices then apply the marketmaking strategy on live orders by adjusting prices.
 *
 */
function bringOrdersToIntegrity() {
  console.log("Bringing order to interity")
  getCEXPrices()
}

/**
 * @api {BOT} getCEXPrices() getCEXPrices() 
 * @apiExample {internal} Example usage:
 * function bringOrdersToIntegrity() {
 *   console.log("Bringing order to interity")
 *   getCEXPrices()
 * }
 * 
 * @apiName getCEXPrices
 * @apiGroup BotDataUtils
 *
 * @apiDescription Gets the price of the configured CEX & aggregator feeds, updating the live config to reflect market changes.
 */
function getCEXPrices() {
  let config = getLiveConfig()
  for (let key in config) {
    if (config.hasOwnProperty(key)) {
      // console.log(key + " -> " + JSON.stringify(config[key]));
      if (config[key].ticker != "BTC") {
        if (config[key].binance) {
          axiosGET("https://api.binance.com/api/v3/ticker/price?symbol=" + config[key].ticker + "BTC").then(data => {

            // console.log(data)
            config[key].cexprice = data.price
            config[key].price = data.price
            // console.log(config)
            liveConfig = config
            console.log(liveConfig)

          })
        }
        if (config[key].bittrex) {
          //https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-KMD
          axiosGET("https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-" + config[key].ticker).then(data => {

            // console.log(data)
            config[key].cexpricebittrex = parseFloat(data.result.Last)
            config[key].price = parseFloat(data.result.Last)
            // console.log(config)
            liveConfig = config
            console.log(liveConfig)

          })
        }
        if (config[key].papid) {
          //https://api.coinpaprika.com/v1/price-converter?base_currency_id=kmd-komodo&quote_currency_id=btc-bitcoin&amount=1
          axiosGET("https://api.coinpaprika.com/v1/price-converter?base_currency_id=" + config[key].papid + "&quote_currency_id=btc-bitcoin&amount=1").then(data => {

            // console.log(data)
            config[key].apipricepaprika = parseFloat(data.price)
            config[key].price = parseFloat(data.price)
            // console.log(config)
            liveConfig = config
            console.log(liveConfig)

          })
        }
      }
    }
  }
}

/**
 * @api {BOT} getLiveConfig() getLiveConfig() 
 * @apiExample {internal} Example usage:
 * 
 *   let contents = getLiveConfig()
 * 
 * @apiName getLiveConfig
 * @apiGroup BotDataUtils
 *
 * @apiDescription Safely gets the currently used configuration
 */
function getLiveConfig() {
  console.log("Passing Live Config")
  return liveConfig
}

/**
 * @apiIgnore Gets the config file from disk
 */
function fsGetConfig() {
  return JSON.parse(fs.readFileSync('mmconfig.json', 'utf8'));
}

// url routes
/**
 * @api {get} /config /config
 * @apiName config
 * @apiGroup MiddlewareServerURLs
 *
 * @apiDescription Gets the config file for the network client/tui/gui/app
 * 
 */
app.options("/config", cors())
app.get("/config", cors(), (req, res) => {
  console.info("GET /config");
  // let fs = require('fs');

  // let contents = fs.readFileSync('mpm.json', 'utf8');
  let contents = fsGetConfig()
  console.log(contents);
  res.json(
    contents
  );
});

/**
 * @api {get} /config2 /config2 
 * @apiName config2
 * @apiGroup MiddlewareServerURLs
 *
 * @apiDescription Gets the config file for the network client/tui/gui/app using the safer getLiveConfig method
 * 
 */
app.options("/config2", cors())
app.get("/config2", cors(), (req, res) => {
  console.info("GET /config2");
  // let fs = require('fs');

  // let contents = fs.readFileSync('mmconfig.json', 'utf8');
  let contents = getLiveConfig()
  // console.log(contents);
  res.json(
    contents
  );
});

/**
 * @api {post} /config /config 
 * @apiName config
 * @apiGroup MiddlewareServerURLs
 *
 * @apiDescription Saves the updated config submission from the client
 * 
 */
app.options("/config", cors())
app.post("/config", cors(), (req, res) => {
  console.info("POST /config");
  console.log(req.body)

  fs.writeFile("output.json", JSON.stringify(req.body), 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      console.log(err);
      res.status(500).json({
        result: "failure"
      })
    } else {
      console.log("JSON file has been saved.");
      res.status(201).json({
        result: "success"
      })
    }
  });
});

/**
 * @api {get} /coinconfig /coinconfig 
 * @apiName coinconfig
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} coin as a ticker symbol, e.g. KMD, BTC etc.
 * @apiDescription Gets the coin configuration (which for this PoC was a separate file to the app config file)
 */
app.get("/coinconfig", cors(), (req, res) => {
  console.info("GET /coinconfig");
  console.info("query param" + req.query.coin)
  // let fs = require('fs');
  let contents = ''
  try {
    contents = fs.readFileSync(req.query.coin, 'utf8');
  } catch (e) {
    contents = '{"error": "no config"}'
  }
  console.log(contents);
  res.json(
    JSON.parse(contents)
  );
});

/**
 * @api {get} /coinsenabled /coinsenabled 
 * @apiName coinsenabled
 * @apiGroup MiddlewareServerURLs
 *
 * @apiDescription Calls marketmaker method to get information or perform action of AtomicDEX API
 * 
 */
app.options("/coinsenabled", cors())
app.get("/coinsenabled", cors(), (req, res) => {
  console.info("GET /coinsenabled")
  getEnabledCoins().then(data => {
    console.log("return to client" + data)
    // res.json(JSON.stringify(data))
    res.json(data)
  })
})

/**
 * @api {post} /connectcoin /connectcoin 
 * @apiName connectcoin
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} coin as a ticker symbol, e.g. KMD, BTC etc.
 * @apiParam {String[]} server information for connecting using marketmaker2.electrum method
 * 
 * @apiDescription Calls marketmaker method to get information or perform action of AtomicDEX API
 * 
 */
app.options("/connectcoin", cors())
app.post("/connectcoin", cors(), (req, res) => {
  console.info("GET /connectcoin " + req.query.coin + " " + req.query.servers)
  connectCoin(req.query.coin, req.query.servers).then(data => {
    console.log("return to client" + data)
    // res.json(JSON.stringify(data))
    res.json(data)
  })
})

/**
 * @api {get} /recentswaps /recentswaps 
 * @apiName recentswaps
 * @apiGroup MiddlewareServerURLs
 *
 * @apiDescription Calls marketmaker method to get information or perform action of AtomicDEX API
 * 
 */
app.options("/recentswaps", cors())
app.get("/recentswaps", cors(), (req, res) => {
  console.info("GET /recentswaps")
  getRecentSwaps().then(data => {
    console.log("return to client" + data)
    // res.json(JSON.stringify(data))
    res.json(data)
  })
})

/**
 * @api {get} /getBalance /getBalance 
 * @apiName getBalance
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} coin as a ticker symbol, e.g. KMD, BTC etc.
 * @apiDescription Calls marketmaker method to get information or perform action of AtomicDEX API
 * 
 */
app.options("/getBalance", cors())
app.get("/getBalance", cors(), (req, res) => {
  console.info("GET /getBalance " + req.query.coin)
  getBalance(req.query.coin).then(data => {
    console.log("return to client" + data)
    // res.json(JSON.stringify(data))
    res.json(data)
  })
})

/**
 * @api {get} /getOrders /getOrders 
 * @apiName getOrders
 * @apiGroup MiddlewareServerURLs
 *
 * @apiDescription Calls marketmaker method to get information or perform action of AtomicDEX API
 * 
 */
app.options("/getOrders", cors())
app.get("/getOrders", cors(), (req, res) => {
  console.info("GET /getOrders ")
  getOrders().then(data => {
    // res.json(JSON.stringify(data))
    // data = {
    //   result: {
    //     maker_orders: {
    //       "fedd5261-a57e-4cbf-80ac-b3507045e140": {
    //         base: "BEER",
    //         created_at: 1560529042434,
    //         available_amount: "1",
    //         cancellable: true,
    //         matches: {
    //           "60aaacca-ed31-4633-9326-c9757ea4cf78": {
    //             connect: {
    //               dest_pub_key:
    //                 "c213230771ebff769c58ade63e8debac1b75062ead66796c8d793594005f3920",
    //               maker_order_uuid:
    //                 "fedd5261-a57e-4cbf-80ac-b3507045e140",
    //               method: "connect",
    //               sender_pubkey:
    //                 "5a2f1c468b7083c4f7649bf68a50612ffe7c38b1d62e1ece3829ca88e7e7fd12",
    //               taker_order_uuid: "60aaacca-ed31-4633-9326-c9757ea4cf78"
    //             },
    //             connected: {
    //               dest_pub_key:
    //                 "5a2f1c468b7083c4f7649bf68a50612ffe7c38b1d62e1ece3829ca88e7e7fd12",
    //               maker_order_uuid:
    //                 "fedd5261-a57e-4cbf-80ac-b3507045e140",
    //               method: "connected",
    //               sender_pubkey:
    //                 "c213230771ebff769c58ade63e8debac1b75062ead66796c8d793594005f3920",
    //               taker_order_uuid: "60aaacca-ed31-4633-9326-c9757ea4cf78"
    //             },
    //             last_updated: 1560529572571,
    //             request: {
    //               action: "Buy",
    //               base: "BEER",
    //               base_amount: "1",
    //               dest_pub_key:
    //                 "0000000000000000000000000000000000000000000000000000000000000000",
    //               method: "request",
    //               rel: "PIZZA",
    //               rel_amount: "1",
    //               sender_pubkey:
    //                 "5a2f1c468b7083c4f7649bf68a50612ffe7c38b1d62e1ece3829ca88e7e7fd12",
    //               uuid: "60aaacca-ed31-4633-9326-c9757ea4cf78"
    //             },
    //             reserved: {
    //               base: "BEER",
    //               base_amount: "1",
    //               dest_pub_key:
    //                 "5a2f1c468b7083c4f7649bf68a50612ffe7c38b1d62e1ece3829ca88e7e7fd12",
    //               maker_order_uuid:
    //                 "fedd5261-a57e-4cbf-80ac-b3507045e140",
    //               method: "reserved",
    //               rel: "PIZZA",
    //               rel_amount: "1",
    //               sender_pubkey:
    //                 "c213230771ebff769c58ade63e8debac1b75062ead66796c8d793594005f3920",
    //               taker_order_uuid: "60aaacca-ed31-4633-9326-c9757ea4cf78"
    //             }
    //           }
    //         },
    //         max_base_vol: "1",
    //         min_base_vol: "0",
    //         price: "1",
    //         rel: "PIZZA",
    //         started_swaps: ["60aaacca-ed31-4633-9326-c9757ea4cf78"],
    //         uuid: "fedd5261-a57e-4cbf-80ac-b3507045e140"
    //       }
    //     },
    //     taker_orders: {
    //       "45252de5-ea9f-44ae-8b48-85092a0c99ed": {
    //         created_at: 1560529048998,
    //         cancellable: true,
    //         matches: {
    //           "15922925-cc46-4219-8cbd-613802e17797": {
    //             connect: {
    //               dest_pub_key:
    //                 "5a2f1c468b7083c4f7649bf68a50612ffe7c38b1d62e1ece3829ca88e7e7fd12",
    //               maker_order_uuid:
    //                 "15922925-cc46-4219-8cbd-613802e17797",
    //               method: "connect",
    //               sender_pubkey:
    //                 "c213230771ebff769c58ade63e8debac1b75062ead66796c8d793594005f3920",
    //               taker_order_uuid: "45252de5-ea9f-44ae-8b48-85092a0c99ed"
    //             },
    //             connected: {
    //               dest_pub_key:
    //                 "c213230771ebff769c58ade63e8debac1b75062ead66796c8d793594005f3920",
    //               maker_order_uuid:
    //                 "15922925-cc46-4219-8cbd-613802e17797",
    //               method: "connected",
    //               sender_pubkey:
    //                 "5a2f1c468b7083c4f7649bf68a50612ffe7c38b1d62e1ece3829ca88e7e7fd12",
    //               taker_order_uuid: "45252de5-ea9f-44ae-8b48-85092a0c99ed"
    //             },
    //             last_updated: 1560529049477,
    //             reserved: {
    //               base: "BEER",
    //               base_amount: "1",
    //               dest_pub_key:
    //                 "c213230771ebff769c58ade63e8debac1b75062ead66796c8d793594005f3920",
    //               maker_order_uuid:
    //                 "15922925-cc46-4219-8cbd-613802e17797",
    //               method: "reserved",
    //               rel: "ETOMIC",
    //               rel_amount: "1",
    //               sender_pubkey:
    //                 "5a2f1c468b7083c4f7649bf68a50612ffe7c38b1d62e1ece3829ca88e7e7fd12",
    //               taker_order_uuid: "45252de5-ea9f-44ae-8b48-85092a0c99ed"
    //             }
    //           }
    //         },
    //         request: {
    //           action: "Buy",
    //           base: "BEER",
    //           base_amount: "1",
    //           dest_pub_key:
    //             "0000000000000000000000000000000000000000000000000000000000000000",
    //           method: "request",
    //           rel: "ETOMIC",
    //           rel_amount: "1",
    //           sender_pubkey:
    //             "c213230771ebff769c58ade63e8debac1b75062ead66796c8d793594005f3920",
    //           uuid: "45252de5-ea9f-44ae-8b48-85092a0c99ed"
    //         }
    //       }
    //     }
    //   }
    // }
    console.log("return to client" + JSON.stringify(data))
    res.json(data)
  })
})

/**
 * @api {post} /doTaker /doTaker 
 * @apiName doTaker
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} base as a ticker symbol, e.g. KMD, BTC etc.
 * @apiParam {String} rel as a ticker symbol, e.g. KMD, BTC etc.
 * @apiParam {Number} price in BTC e.g. 0.00007777
 * @apiParam {Number} volume in amount of coins of base(?)
 * 
 * @apiDescription Calls marketmaker method to get information or perform action of AtomicDEX API.  Specifically this performs a mm2.buy()
 * 
 */
app.options("/doTaker", cors())
app.post("/doTaker", cors(), (req, res) => {
  let base = req.query.base
  let rel = req.query.rel
  let price = req.query.price
  let volume = req.query.volume
  console.info("GET /doTaker " + base + " " + rel + " " + price + " " + volume)
  if( base == undefined || rel == undefined || price == undefined || volume == undefined ){
    console.log("doTaker undefined")    
  }
  buy(base, rel, price, volume).then(data => {
    console.log("return to client" + data)
    // res.json(JSON.stringify(data))
    res.json(data)
  })
})

/**
 * @api {post} /doMaker /doMaker 
 * @apiName doMaker
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} base as a ticker symbol, e.g. KMD, BTC etc.
 * @apiParam {String} rel as a ticker symbol, e.g. KMD, BTC etc.
 * @apiParam {Number} price in BTC e.g. 0.00007777
 * @apiParam {Number} volume in amount of coins of base(?)
 * 
 * @apiDescription Calls marketmaker method to get information or perform action of AtomicDEX API.  Specifically this performs a mm2.buy()
 * 
 */
app.options("/doMaker", cors())
app.post("/doMaker", cors(), (req, res) => {
  let base = req.query.base
  let rel = req.query.rel
  let price = req.query.price
  let volume = req.query.volume
  console.info("GET /doMaker " + base + " " + rel + " " + price + " " + volume)
  if( base == undefined || rel == undefined || price == undefined || volume == undefined ){
    console.log("doMaker undefined")    
  }
  setPrice(base, rel, price, volume).then(data => {
    console.log("return to client" + data)
    // res.json(JSON.stringify(data))
    res.json(data)
  })
})

/**
 * @api {post} /getMarket /getMarket 
 * @apiName getMarket
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} base as a ticker symbol, e.g. KMD, BTC etc.
 * @apiParam {String} rel as a ticker symbol, e.g. KMD, BTC etc.
 * 
 * @apiDescription Calls marketmaker method to get information or perform action of AtomicDEX API.  Specifically this performs a mm2.buy()
 * 
 */
app.options("/getMarket", cors())
app.post("/getMarket", cors(), (req, res) => {
  console.info("GET /getMarket " + req.query.base + " " + req.query.rel)
  getMarket(req.query.base, req.query.rel).then(data => {
    console.log("return to client" + data)
    // res.json(JSON.stringify(data))
    res.json(data)
  })
})

/**
 * @api {get} /getbittrexmarketprice /getbittrexmarketprice 
 * @apiName getbittrexmarketprice
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} base as a ticker symbol, e.g. KMD, BTC etc.
 * 
 * @apiDescription Calls external feed lookup
 * 
 */
app.options("/getbittrexmarketprice", cors())
app.get("/getbittrexmarketprice", cors(), (req, res) => {
  console.info("GET /getbittrexmarketprice");
  let base = req.query.base
  axiosGET("https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-" + base).then(data => {
    res.json(
      data
    );
  })
});

/**
 * @api {get} /getbinancemarketprice /getbinancemarketprice 
 * @apiName getbinancemarketprice
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} base as a ticker symbol, e.g. KMD, BTC etc.
 * 
 * @apiDescription Calls external feed lookup
 * 
 */
app.options("/getbinancemarketprice", cors())
app.get("/getbinancemarketprice", cors(), (req, res) => {
  console.info("GET /getbinancemarketprice");
  let base = req.query.base
  axiosGET("https://api.binance.com/api/v3/ticker/price?symbol=" + base + "BTC").then(data => {
    res.json(
      data
    );
  })
});

/**
 * @api {get} /getbinancemarketdepth /getbinancemarketdepth 
 * @apiName getbinancemarketdepth
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} base as a ticker symbol, e.g. KMD, BTC etc.
 * 
 * @apiDescription Calls external feed lookup
 * 
 */
app.get("/getbinancemarketdepth", cors(), (req, res) => {
  console.info("GET /getbinancemarketdepth");
  axiosGET("https://api.binance.com/api/v1/depth?symbol=KMDBTC&limit=20").then(data => {
    res.json(
      data
    );
  })
});

/**
 * @api {get} /getpaprikaprice /getpaprikaprice 
 * @apiName getpaprikaprice
 * @apiGroup MiddlewareServerURLs
 *
 * @apiParam {String} base as a ticker symbol, e.g. KMD, BTC etc.
 * 
 * @apiDescription Calls external feed lookup
 * 
 */
app.get("/getpaprikaprice", cors(), (req, res) => {
  console.info("GET /getpaprikaprice");
  let base = req.query.base
  axiosGET("https://api.coinpaprika.com/v1/price-converter?base_currency_id=" + base + "&quote_currency_id=btc-bitcoin&amount=1").then(data => {
    res.json(
      data
    );
  })
});

// dummy samples
// app.options("/dummy/coinsenabled", cors())
// app.get("/dummy/coinsenabled", cors(), (req, res) => {
//   console.info("GET /dummy/coinsenabled")
//   res.json(
//     JSON.stringify({
//       result: [{
//           address: "RG7mQ5unWefSiiujFouxqSN6Go7WT5hBqq",
//           ticker: "MORTY"
//         },
//         {
//           address: "RG7mQ5unWefSiiujFouxqSN6Go7WT5hBqq",
//           ticker: "RICK"
//         }
//       ]
//     })
//   )
// })


/**
 * @api {NodeJSMM2} getOrders(userpass) getOrders(userpass)
 * @apiName getOrders
 * @apiGroup MiddlewareAtomicDEX
 *
 * @apiParam {String} userpass default up set in config
 *
 * @apiExample {NodeJS} mm2-middleware.js 
 * export function getOrders(userpass = UP) {
 * console.log("getOrders")
 * const requestData = {
 *   jsonrpc: "2.0",
 *   method: "my_orders",
 *   userpass: userpass,
 *   id: Date.now(),
 *   timeout: 3000
 * };
 * return axios.post("http://127.0.0.1:7783", requestData)
 *   .then(res => {
 *     console.log(res.data)
 *     return res.data
 *   })
 *   .catch(err => console.error(err))
 * }
 * 
 * @apiDescription mm2 <a href="https://developers.komodoplatform.com/basic-docs/atomicdex/atomicdex-api.html#my-orders">my_orders</a> to get current orders 
 * 
 */
function getOrders(userpass = up) {
  console.log("getOrders")
  const requestData = {
    jsonrpc: "2.0",
    method: "my_orders",
    userpass: userpass,
    id: Date.now(),
    timeout: 3000
  };
  return axios.post("http://127.0.0.1:7783", requestData)
    .then(res => {
      console.log(res.data)
      return res.data
    })
    .catch(err => console.error(err))
}

/**
 * @api {NodeJSMM2} getRecentSwaps(uuid,userpass) getRecentSwaps(uuid, userpass)
 * @apiName getRecentSwaps
 * @apiGroup MiddlewareAtomicDEX
 * @apiExample {NodeJS} mm2-middleware.js
 * export function getRecentSwaps(uuid = null, userpass = UP) {
 *   console.log("getRecentSwaps")
 *   const requestData = {
 *     jsonrpc: "2.0",
 *     method: "my_recent_swaps",
 *     uuid: uuid,
 *     userpass: userpass,
 *     id: Date.now(),
 *     timeout: 3000
 *   };
 *   return axios.post("http://127.0.0.1:7783", requestData)
 *     .then(res => {
 *       console.log(res.data)
 *       return res.data
 *     })
 *     .catch(err => console.error(err))
 * }
 *
 * @apiParam {String} userpass default up set in config
 * @apiParam {String} uuid  default is null to get all
 * 
 * @apiDescription mm2 <a href="https://developers.komodoplatform.com/basic-docs/atomicdex/atomicdex-api.html#my-recent-swaps">my_recent_swaps</a> to get current orders
 * 
 */
function getRecentSwaps(uuid = null, userpass = up) {
  console.log("getRecentSwaps")
  const requestData = {
    jsonrpc: "2.0",
    method: "my_recent_swaps",
    uuid: uuid,
    userpass: userpass,
    id: Date.now(),
    timeout: 3000
  };
  return axios.post("http://127.0.0.1:7783", requestData)
    .then(res => {
      console.log(res.data)
      return res.data
    })
    .catch(err => console.error(err))
}

/**
 * @api {NodeJSMM2} getEnabledCoins(userpass) getEnabledCoins(userpass)
 * @apiName getEnabledCoins
 * @apiGroup MiddlewareAtomicDEX
 * @apiExample {NodeJS} mm2-middleware.js
 * export function getEnabledCoins(userpass = UP) {
 *   console.log("GetEnabledCoins")
 *   const requestData = {
 *     jsonrpc: "2.0",
 *     method: "get_enabled_coins",
 *     userpass: userpass,
 *     id: Date.now(),
 *     timeout: 3000
 *   };
 *   return axios.post("http://127.0.0.1:7783", requestData)
 *     .then(res => {
 *       console.log(res.data)
 *       return res.data
 *     })
 *     .catch(err => console.error(err))
 * }
 * @apiParam {String} userpass default up set in config
 * 
 * @apiDescription mm2 <a href="https://developers.komodoplatform.com/basic-docs/atomicdex/atomicdex-api.html#get-enabled-coins">get_enabled_coins</a> to get current state of enabled coins
 * 
 */
function getEnabledCoins(userpass = up) {
  console.log("GetEnabledCoins")
  const requestData = {
    jsonrpc: "2.0",
    method: "get_enabled_coins",
    userpass: userpass,
    id: Date.now(),
    timeout: 3000
  };
  return axios.post("http://127.0.0.1:7783", requestData)
    .then(res => {
      console.log(res.data)
      return res.data
    })
    .catch(err => console.error(err))
}

/**
 * @api {NodeJSMM2} connectCoin(coin,servers,userpass) connectCoin(coin, servers, userpass)
 * @apiName connectCoin
 * @apiGroup MiddlewareAtomicDEX
 * @apiExample {NodeJS} mm2-middleware.js
 * export function connectCoin(coin, servers, userpass = UP) {
 *   console.log("connect coin: " + coin + " with servers " + servers)
 *   const requestData = {
 *     jsonrpc: "2.0",
 *     method: "electrum",
 *     coin: coin,
 *     servers: JSON.parse(servers),
 *     userpass: userpass,
 *     id: Date.now(),
 *     timeout: 3000
 *   };
 *   return axios.post("http://127.0.0.1:7783", requestData)
 *     .then(res => {
 *       console.log(res.data)
 *       return res.data
 *     })
 *     .catch(err => console.error(err))
 * }
 *
 * @apiParam {String} coin default up set in config
 * @apiParam {Object[]} servers passed from previous lookup
 * @apiParam {String} userpass default up set in config
 * 
 * @apiDescription mm2 connect coin with electrum server using <a href="https://developers.komodoplatform.com/basic-docs/atomicdex/atomicdex-api.html#electrum">electrum</a>
 * 
 */
function connectCoin(coin, servers, userpass = up) {
  console.log("connect coin: " + coin + " with servers " + servers)
  const serversMORTY = [{
      url: "electrum1.cipig.net:10018"
    },
    {
      url: "electrum2.cipig.net:10018"
    },
    {
      url: "electrum3.cipig.net:10018"
    }
  ]
  const requestData = {
    jsonrpc: "2.0",
    method: "electrum",
    coin: coin,
    servers: JSON.parse(servers),
    userpass: userpass,
    id: Date.now(),
    timeout: 3000
  };
  return axios.post("http://127.0.0.1:7783", requestData)
    .then(res => {
      console.log(res.data)
      return res.data
    })
    .catch(err => console.error(err))

}

/**
 * @api {NodeJSMM2} buy(base,rel,price,volume,userpass) buy(base, rel, price, volume, userpass)
 * @apiName buy
 * @apiGroup MiddlewareAtomicDEX
 * @apiExample {NodeJS} mm2-middleware.js
 * export function buy(base, rel, price, volume, userpass = UP){
 *   console.log("buy (base,rel,price,volume): (" + base + "," + rel + "," + price + "," + volume + ")")
 *   const requestData = {
 *     jsonrpc: "2.0",
 *     method: "buy",
 *     base: base,
 *     rel: rel,
 *     price: price,
 *     volume: volume,
 *     userpass: userpass,
 *     id: Date.now(),
 *     timeout: 3000
 *   };
 *   return axios.post("http://127.0.0.1:7783", requestData)
 *     .then(res => {
 *       console.log(res.data)
 *       return res.data
 *     })
 *     .catch(err => console.error(err))
 * }
 * 
 *
 * @apiParam {String} base
 * @apiParam {String} rel
 * @apiParam {String} price
 * @apiParam {String} volume
 * @apiParam {String} userpass default up set in config
 * 
 * @apiDescription mm2 be an alice (taker) by calling mm2 <a href="https://developers.komodoplatform.com/basic-docs/atomicdex/atomicdex-api.html#buy">buy</a> method
 * 
 */
function buy(base, rel, price, volume, userpass = up){
  console.log("buy (base,rel,price,volume): (" + base + "," + rel + "," + price + "," + volume + ")")
  const requestData = {
    jsonrpc: "2.0",
    method: "buy",
    base: base,
    rel: rel,
    price: price,
    volume: volume,
    userpass: userpass,
    id: Date.now(),
    timeout: 3000
  };
  return axios.post("http://127.0.0.1:7783", requestData)
    .then(res => {
      console.log(res.data)
      return res.data
    })
    .catch(err => console.error(err))  
}

/**
 * @api {NodeJSMM2} setPrice(base,rel,price,volume,userpass) setPrice(base, rel, price, volume, userpass)
 * @apiName setPrice
 * @apiGroup MiddlewareAtomicDEX
 * @apiExample {NodeJS} mm2-middleware.js
 * export function setPrice(base, rel, price, volume, userpass = UP){
 *   console.log("buy (base,rel,price,volume): (" + base + "," + rel + "," + price + "," + volume + ")")
 *   const requestData = {
 *     jsonrpc: "2.0",
 *     method: "setprice",
 *     base: base,
 *     rel: rel,
 *     price: price,
 *     volume: volume,
 *     cancel_previous: false,
 *     userpass: userpass,
 *     id: Date.now(),
 *     timeout: 3000
 *   };
 *   return axios.post("http://127.0.0.1:7783", requestData)
 *     .then(res => {
 *       console.log(res.data)
 *       return res.data
 *     })
 *     .catch(err => console.error(err))
 * }
 * 
 *
 * @apiParam {String} base
 * @apiParam {String} rel
 * @apiParam {String} price
 * @apiParam {String} volume
 * @apiParam {String} userpass default up set in config
 * 
 * @apiDescription mm2 be a bob (maker) by calling mm2 <a href="https://developers.komodoplatform.com/basic-docs/atomicdex/atomicdex-api.html#setprice">setprice</a> method
 * 
 */
function setPrice(base, rel, price, volume, userpass = up){
  console.log("buy (base,rel,price,volume): (" + base + "," + rel + "," + price + "," + volume + ")")
  const requestData = {
    jsonrpc: "2.0",
    method: "setprice",
    base: base,
    rel: rel,
    price: price,
    volume: volume,
    cancel_previous: false,
    userpass: userpass,
    id: Date.now(),
    timeout: 3000
  };
  return axios.post("http://127.0.0.1:7783", requestData)
    .then(res => {
      console.log(res.data)
      return res.data
    })
    .catch(err => console.error(err))  
}

/**
 * @api {NodeJSMM2} getBalance(coin) getBalance(coin)
 * @apiName getBalance
 * @apiGroup MiddlewareAtomicDEX
 * @apiExample {NodeJS} mm2-middleware.js
 * export function getBalance(coin, userpass = UP) {
 *   console.log("getBalance coin: " + coin)
 *   const requestData = {
 *     jsonrpc: "2.0",
 *     method: "my_balance",
 *     coin: coin,
 *     userpass: userpass,
 *     id: Date.now(),
 *     timeout: 3000
 *   };
 *   return axios.post("http://127.0.0.1:7783", requestData)
 *     .then(res => {
 *       console.log(res.data)
 *       return res.data
 *     })
 *     .catch(err => console.error(err))
 * }
 * 
 *
 * @apiParam {String} coin
 * @apiParam {String} userpass default up set in config
 * 
 * @apiDescription mm2 <a href="https://developers.komodoplatform.com/basic-docs/atomicdex/atomicdex-api.html#my-balance">my_balance</a> to get current balance of coin
 * 
 */
function getBalance(coin, userpass = up) {
  console.log("getBalance coin: " + coin)
  const requestData = {
    jsonrpc: "2.0",
    method: "my_balance",
    coin: coin,
    userpass: userpass,
    id: Date.now(),
    timeout: 3000
  };
  return axios.post("http://127.0.0.1:7783", requestData)
    .then(res => {
      console.log(res.data)
      return res.data
    })
    .catch(err => console.error(err))
}

/**
 * @api {NodeJSMM2} getMarket(base,rel,userpass) getMarket(base, rel, userpass) 
 * @apiName getMarket
 * @apiGroup MiddlewareAtomicDEX
 * @apiExample {NodeJS} mm2-middleware.js
 * export function getMarket(base, rel, userpass = UP) {
 *   console.log("market data: " + base + " / " + rel)
 *   const requestData = {
 *     jsonrpc: "2.0",
 *     method: "orderbook",
 *     base: base,
 *     rel: rel,
 *     userpass: userpass,
 *     id: Date.now(),
 *     timeout: 3000
 *   };
 *   return axios.post("http://127.0.0.1:7783", requestData)
 *     .then(res => {
 *       console.log(res.data)
 *       return res.data
 *     })
 *     .catch(err => console.error(err))
 * }
 *
 * @apiParam {String} base
 * @apiParam {String} rel
 * @apiParam {String} userpass default up set in config
 * 
 * @apiDescription mm2 <a href="https://developers.komodoplatform.com/basic-docs/atomicdex/atomicdex-api.html#orderbook">orderbook</a> method to get market data (orderbooks) for base/rel
 * 
 */
function getMarket(base, rel, userpass = up) {
  console.log("market data: " + base + " / " + rel)
  const requestData = {
    jsonrpc: "2.0",
    method: "orderbook",
    base: base,
    rel: rel,
    userpass: userpass,
    id: Date.now(),
    timeout: 3000
  };
  return axios.post("http://127.0.0.1:7783", requestData)
    .then(res => {
      console.log(res.data)
      return res.data
    })
    .catch(err => console.error(err))

}

/**
 * @api {FrontEnd} cancelAllOrders() cancelAllOrders() 
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 *     // MyOrders.vue component emits an event handled like this
 *     handleCancelAllOrders: function() {
 *     console.log("AppTraderView.handleCancelAllOrders")
 *   }
 *
 * @apiName cancelAllOrders
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription cancels orders
 */
function cancelAllOrders() {
}

/**
 * @api {FrontEnd} cancelOrder(uuid) cancelOrder(uuid)
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 *     // MyOrders.vue component emits an event handled like this
 *    handleCancelOrder: function(uuid) {
 *      console.log("AppTraderView.handleCancelOrder: " + uuid)
 *      mm2.cancelOrder(uuid).then( response => {
 *         console.log("Cancel order response: " + response)
 *      }).catch((reason) => {
 *        console.log("Could not cancel order " + uuid)
 *      })
 *      this.handleMyOrders()
 *    }
 *
 * @apiName cancelOrder
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription cancels order identified by UUID
 */
function cancelOrder(uuid) {
}

/**
 * @api {FrontEnd} getFiatCoinGecko() getFiatCoinGecko()
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 *     // for the banner showing fiat usd price
 *   handleRefreshFiat: function() {
 *     console.log("AppTraderView.handleRefreshFiat")
 *     let refreshFiatBase = mm2.getFiatCoinGecko(this.wallets.base.ticker).then( response => {
 *       this.wallets.base.fiat = response.data.current_prices.usd
 *     }).catch((reason) => {
 *       console.log(reason)
 *     })
 *     let refreshFiatRel = mm2.getFiatCoinGecko(this.wallets.rel.ticker).then( response => {
 *       this.wallets.rel.fiat = response.data.current_prices.usd
 *     }).catch((reason) => {
 *       console.log("caught: " + reason)
 *     })
 *   }
 *
 * @apiName getFiatCoinGecko
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription description goes here
 */
function getFiatCoinGecko() {
}

/**
 * @api {FrontEnd} getMyOrders() getMyOrders()
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 *     // MyOrders.vue component emits an event handled like this
 *   handleMyOrders: function(){
 *     mm2.getMyOrders().then( response => {
 *       // because working with an object of objects in js sucks, convert to array
 *       this.myOrders = Object.values(response.data.result.maker_orders)
 *     }).then( () => {
 *       console.log("AppTraderview.myOrders -> highlightOrders")
 *       ...
 *       ...
 *       ...
 *     })
 *   }
 *
 * @apiName getMyOrders
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription description goes here
 */
function getMyOrders() {
}

/**
 * @api {FrontEnd} getMarket() getMarket()
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 *     // MarketData.vue component emits an event handle refresh
 *   handleRefreshMarket: function() {
 *     console.log("Refresh Market")
 *     mm2.getMarket(this.wallets.base.ticker, this.wallets.rel.ticker).then( response => {
 * //          console.log("Market data: " + JSON.stringify(response.data,null,2))
 *         let marketdataraw = response.data
 *         this.marketOrders = marketdataraw
 *         this.marketOrders.asks = this.groupByPrice(marketdataraw.asks, "price")
 *         this.marketOrders.bids = this.groupByPrice(marketdataraw.bids, "price")
 *     }).catch((reason) => {
 *       console.log(reason)
 *     })
 *   }
 *
 * @apiName getMarket
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription description goes here
 */
function getMarket() {
}

/**
 * @api {FrontEnd} getWalletBalance(coin) getWalletBalance(coin)
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 *   handleRefreshBalances: function() {
 *     console.log("AppTraderView.handleRefreshBalances")
 *     let refreshBase = mm2.getWalletBalance(this.wallets.base.ticker).then( response => {
 *       this.wallets.base.balance = response.data.balance 
 *       this.wallets.base.address = response.data.address
 *     })
 *     let refreshRel = mm2.getWalletBalance(this.wallets.rel.ticker).then( response => {
 *       this.wallets.rel.balance = response.data.balance 
 *       this.wallets.rel.address = response.data.address
 *     })
 *     Promise.all([refreshBase, refreshRel]).then( function() {
 * //        console.log("AppTraderView.handleRefreshBalance: Update child component")
 * //        this.$refs.refWalletInfo(balanceFromParent, this.wallets)
 *     })
 *   }
 *
 * @apiName getWalletBalance
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription get balance of the wallet
 */
function getWalletBalance(coin) {
}

/**
 * @api {FrontEnd} buyBase(orderDetails) buyBase(orderDetails)
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 *  // SingleOrder.vue emits an event to be handled
 *   handleBuyBase: function(orderDetails){
 *     console.log(
 *       "SingleOrder buy base: " +
 *         this.wallets.base.ticker +
 *         ", amount: " +
 *         orderDetails.amount +
 *         " @ " +
 *         orderDetails.price +
 *         " = " +
 *         orderDetails.amount * orderDetails.price
 *     )
 *     mm2.buyBase(this.wallets.base.ticker, this.wallets.rel.ticker, orderDetails.price, orderDetails.amount).then( response => {
 *       console.log("Response to buy base: " + JSON.stringify(response,null,2))
 *       this.$refs.refSingleOrder.handleOrderResponse()
 *       this.handleMyOrders()
 *     }).catch((reason) => {
 *         console.log(reason)
 *     })
 *   }
 *
 * @apiName buyBase
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription base coin bid/buy order
 */
function buyBase(orderDetails) {
}

/**
 * @api {FrontEnd} sellBase(orderDetails) sellBase(orderDetails)
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 *  // SingleOrder.vue emits an event to be handled
 *   handleSellBase: function(orderDetails) {
 *     console.log(
 *       "SingleOrder sell base: " +
 *         this.wallets.base.ticker +
 *         ", amount: " +
 *         orderDetails.amount +
 *         " @ " +
 *         orderDetails.price +
 *         " = " +
 *         orderDetails.amount * orderDetails.price
 *     )
 *     mm2.sellBase(this.wallets.base.ticker, this.wallets.rel.ticker, orderDetails.price, orderDetails.amount).then( response => {
 *       console.log("Response to sell base: " + JSON.stringify(response,null,2))
 *       this.$refs.refSingleOrder.handleOrderResponse()
 *       this.handleMyOrders()
 *     }).catch((reason) => {
 *         console.log(reason)
 *     })
 *   }
 *
 * @apiName sellBase
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription base coin ask/sell order
 */
function sellBase(orderDetails) {
}

/**
 * @api {FrontEnd} recentSwaps() recentSwaps()
 * @apiExample {vueJS} AppDashboard.vue usage:
 * 
 *     // Export.vue component emits an event handled like this
 *   handleGetSwapHistory: function() {
 *      console.log("AppDashboard.handleGetSwapHistory")
 *      mm2.recentSwaps().then( response => {
 *        this.recentSwaps = response.data.result
 *      })
 *   }
 *
 * @apiName recentSwaps
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription get the recent swaps for this atomicDEX marketmaker node
 */
function recentSwaps() {
}

/**
 * @api {FrontEnd} withdraw() withdraw()
 * @apiExample {vueJS} AppTraderview.vue usage:
 * 
 * Not implemented!!
 *
 * @apiName withdraw
 * @apiGroup MiddlewareClientLibrary
 *
 * @apiDescription not implemented
 */
function withdraw() {
}

