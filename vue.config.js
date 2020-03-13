module.exports = {
	devServer: {
  compress: true,
  disableHostCheck: true,
  historyApiFallback: true,
  hot: true,
  open: true,
  overlay: true,
  port: 8001,
  host: '0.0.0.0',
  stats: {
    normal: true
  }
}
  }
