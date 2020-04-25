import mm2 from './mm2MiddlewareClient'

export default {
  getWalletBalance(coin) {
    console.log("wallet.getWalletBalance: " + coin)
    return mm2.get(`/getBalance`)
  }
}
