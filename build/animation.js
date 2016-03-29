(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["animation"] = factory();
	else
		root["animation"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**************************!*\
  !*** ./src/animation.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Timeline = __webpack_require__(/*! ./timeline */ 1);
	var loadImage = __webpack_require__(/*! ./imageloader */ 2);
	
	var STATE_UNINITED = 0;
	var STATE_INITED = 1;
	var STATE_STOP = 2;
	
	var SYNC = 0;
	var TIMELINE = 1;
	
	
	function next(callback) {
		callback && callback();
	}
	
	function Animation() {
		this.taskQueue = [];
		this.timeline = new Timeline();
		this.state = STATE_UNINITED;
		this.index = 0;
	}
	
	Animation.prototype = {
		loadImage: function (imglist) {
	
			return this._add(function (success) {
				loadImage(imglist.slice(), success);
				imglist = null;
			}, SYNC);
		},
		changePosition: function (ele, positions, imgUrl) {
			var len = positions.length,
				index = 0,
				last = false,
				me = this;
			return this._add(len ? function (success, time) {
				var position;
				index = (time / me.interval) | 0;
				last = index >= len - 1;
				index = Math.min(index, len - 1);
				//change posistions
				position = positions[index].split(" ");
				if (imgUrl) {
					ele.style.backgroundImage = 'url(' + imgUrl + ')';
				}
				ele.style.backgroundPosition = position[0] + "px " + position[1] + "px";
				if (last) {
					success();
					return;
				}
			} : next, TIMELINE);
		},
		changeSrc: function (ele, imglist) {
			var len = imglist.length,
				index = 0,
				last = false,
				me = this;
			return this._add(len ? function (success, time) {
				index = (time / me.interval) | 0;
				last = index >= len - 1;
				index = Math.min(index, len - 1);
				//change src
				ele.src = imglist[index];
				if (last) {
					success();
					return;
				}
			} : next, TIMELINE);
		},
		then: function (callback) {
			return this._add(function (success) {
				callback();
				success();
			}, SYNC);
		},
		enterFrame: function (callback) {
			return this._add(callback, TIMELINE);
		},
		repeat: function (times) {
			var me = this;
			return this._add(function () {
				if (times) {
					if (!--times) {
						var queue = me.taskQueue[me.index];
						me.index++;
						queue.wait ? setTimeout(function () {
							me._next();
						}, queue.wait) : me._next();
					}
					else {
						me.index--;
						me._next();
					}
				}
				else {
					me.index--;
					me._next();
				}
	
			}, SYNC);
		},
		repeatForever: function () {
			return this.repeat();
		},
		start: function (interval) {
			if (this.state == STATE_INITED)
				return this;
			this.state = STATE_INITED;
			var queue = this.taskQueue;
			var len = queue.length;
			if (!len)
				return this;
			this.interval = interval;
			this._next();
			return this;
	
		},
		pause: function () {
			this.state = STATE_STOP;
			this.timeline.stop();
			return this;
		},
		wait: function (time) {
			if (this.taskQueue && this.taskQueue.length > 0) {
				this.taskQueue[this.taskQueue.length - 1].wait = time;
			}
			return this;
		},
		dispose: function () {
			this.taskQueue = null;
			this.timeline && this.timeline.stop();
			this.timeline = null;
			this.state = STATE_UNINITED;
		},
		_add: function (task, type) {
			this.taskQueue.push({task: task, type: type});
			return this;
		},
		_next: function () {
			if (!this.taskQueue || this.state == STATE_STOP)
				return;
			if (this.index == this.taskQueue.length) {
				this.dispose();
				return;
			}
			var queue = this.taskQueue[this.index];
			if (queue.type == TIMELINE) {
				this._enterframe(queue.task);
			}
			else {
				this._excuteTask(queue.task);
			}
		},
		_excuteTask: function (task) {
			var me = this;
			task(function () {
				if (!me.taskQueue)
					return;
				var queue = me.taskQueue[me.index];
				me.index++;
				queue.wait ? setTimeout(function () {
					me._next();
				}, queue.wait) : me._next();
	
			});
		},
		_enterframe: function (task) {
			var me = this;
	
			this.timeline.onenterframe = enter;
			this.timeline.start(this.interval);
	
			function enter(time) {
				task(function () {
					if (!me.taskQueue)
						return;
					var queue = me.taskQueue[me.index];
					me.timeline.stop();
					me.index++;
					queue.wait ? setTimeout(function () {
						me._next();
					}, queue.wait) : me._next();
				}, time);
			}
		},
		constructor: Animation
	};
	
	module.exports = function () {
		return new Animation();
	};
	


/***/ },
/* 1 */
/*!*************************!*\
  !*** ./src/timeline.js ***!
  \*************************/
/***/ function(module, exports) {

	'use strict';
	
	var requestAnimationFrame,
		cancelAnimationFrame,
		startTimeline,
		DEFAULT_INTERVAL = 1000 / 60;
	
	function Timeline() {
		this.animationHandler = 0;
	}
	
	Timeline.prototype.onenterframe = function (time) {
		// body...
	};
	
	Timeline.prototype.start = function (interval) {
		var me = this;
		me.interval = interval || DEFAULT_INTERVAL;
		startTimeline(me, +new Date())
	};
	
	Timeline.prototype.restart = function () {
		// body...
		var me = this;
	
		if (!me.dur || !me.interval) return;
	
		me.stop();
		startTimeline(me, +new Date() - me.dur);
	};
	
	Timeline.prototype.stop = function () {
		if (this.startTime) {
			this.dur = +new Date() - this.startTime;
		}
		cancelAnimationFrame(this.animationHandler);
	};
	
	requestAnimationFrame = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
				// if all else fails, use setTimeout
			function (callback) {
				return window.setTimeout(callback, (callback.interval || DEFAULT_INTERVAL) / 2); // make interval as precise as possible.
			};
	})();
	
	// handle multiple browsers for cancelAnimationFrame()
	cancelAnimationFrame = (function () {
		return window.cancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.oCancelAnimationFrame ||
			function (id) {
				window.clearTimeout(id);
			};
	})();
	
	startTimeline = function(timeline, startTime) {
		var lastTick = +new Date();
	
		timeline.startTime = startTime;
		nextTick.interval = timeline.interval;
		nextTick();
	
		function nextTick() {
			var now = +new Date();
	
			timeline.animationHandler = requestAnimationFrame(nextTick);
	
			if (now - lastTick >= timeline.interval) {
				timeline.onenterframe(now - startTime);
				lastTick = now;
			}
		}
	};
	
	module.exports = Timeline;

/***/ },
/* 2 */
/*!****************************!*\
  !*** ./src/imageloader.js ***!
  \****************************/
/***/ function(module, exports) {

	'use strict';
	
	var __id = 0;
	
	/**
	 * 动态创建id
	 * @returns {number}
	 */
	function getId() {
		return ++__id;
	}
	
	/**
	 * 预加载图片函数
	 * @param images 加载的图片数组或对象
	 * @param callback 全部图片加载完毕后调用的回调函数
	 * @param timeout 加载超时的时长
	 */
	function loadImage(images, callback, timeout) {
		//加载完成图片的计数器
		var count = 0;
		//全部图片成功加载完图片的标志位
		var success = true;
		//超时timer的id
		var timeoutId = 0;
		//是否加载超时的标志位
		var isTimeout = false;
		//对图片数组（或对象）进行遍历
		for (var key in images) {
			//过滤掉prototype的属性
			if (!images.hasOwnProperty(key))
				continue;
			//获得每个图片元素
			//期望格式是个object： {src:xxx}
			var item = images[key];
	
			// 如果item是个字符传，则构造object
			if (typeof item === 'string') {
				item = images[key] = {
					src: item
				};
			}
	
			//如果格式不满足期望，则丢弃此条数据进行下一次遍历
			if (!item || !item.src)
				continue;
	
			//计数+1
			count++;
			//设置图片元素的id
			item.id = "__img_" + key + getId();
			//设置图片元素的img，是一个Image对象
			item.img = window[item.id] = new Image();
	
			doLoad(item);
		}
	
		//遍历完成如果计数为0，则直接调用
		if (!count) {
			callback(success);
		}
		//如果设置了加载时长，则设置超时函数计时器
		else if (timeout) {
			timeoutId = setTimeout(onTimeout, timeout);
		}
	
		/**
		 * 真正进行图片加载的函数
		 * @param item 图片元素对象
		 */
		function doLoad(item) {
			item.status = "loading";
	
			var img = item.img;
			//定义图片加载成功的回调函数
			img.onload = function () {
				//如果每张图片都成功才算成功
				success = success && true;
				item.status = "loaded";
				done();
			};
			img.onerror = function () {
				//若有一张图片加载失败，则为失败
				success = false;
				item.status = "error";
				done();
			};
			//发起一个http(s)请求加载图片
			img.src = item.src;
	
			/**
			 * 每张图片加载完成的回调函数
			 */
			function done() {
				//事件清理
				img.onload = img.onerror = null;
	
				try {
					//删除window上注册的属性
					delete window[item.id];
				}
				catch (e) {
	
				}
				//每张图片加载完成，计数器减一，当所有图片加载完毕且没有超时的情况下，
				//清除超时计时器，且执行回调函数
				if (!--count && !isTimeout) {
					clearTimeout(timeoutId);
					callback(success);
				}
			}
		}
	
		/**
		 * 超时函数
		 */
		function onTimeout() {
			isTimeout = true;
			callback(false);
		}
	}
	
	module.exports = loadImage;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=animation.js.map