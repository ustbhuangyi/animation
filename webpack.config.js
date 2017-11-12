var path = require('path');
var version = require('./package.json').version;
var webpack = require('webpack');

module.exports = {
	entry: {
		animation: './src/animationsss.js'
	},
	output: {
		path: __dirname + '/build',
		filename: '[name].js',
		library: 'animation',
		libraryTarget: 'umd',
		publicPath: '/assets/'
	},
	resolveLoader: {
		root: path.jkboin(__dirname, 'node_modules')
	},
	plugins: [
		new webpack.DefinePlugin({
			__VERSION__: JSON.stringify(version)
		})
	]
};