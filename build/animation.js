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

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Timeline = __webpack_require__(1);
	var loadImage = __webpack_require__(2);

	var STATE_UNINITED = 0;
	var STATE_INITED = 1;
	var STATE_STOP = 2;

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
			});
		},
		changePosition: function (ele, positions) {
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
			});
		},
		enterFrame: function (callback) {
			return this._add(callback, TIMELINE);
		},
		repeat: function (times) {
			var me = this;
			return this._add(function () {
				var queue;
				if (times) {
					if (!--times) {
						queue = me.taskQueue[me.index];
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

			});
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
				var queue;
				if (!me.taskQueue)
					return;
				queue = me.taskQueue[me.index];
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
					var queue;
					if (!me.taskQueue)
						return;
					queue = me.taskQueue[me.index];
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
/***/ function(module, exports) {

	'use strict';

	var __id = 0;

	function getId() {
		return ++__id;
	}

	function loadImage(images, callback, timeout) {
		var key, item, count, success, timeoutId, isTimeout;

		count = 0;
		success = true;
		isTimeout = false;
		for (key in images) {
			if (!images.hasOwnProperty(key))
				continue;
			item = images[key];

			if (typeof (item) == 'string') {
				item = images[key] = {
					src: item
				};
			}

			if (!item || !item.src)
				continue;

			count++;
			item.id = "__img_" + key + getId();
			item.img = window[item.id] = new Image();

			doLoad(item);
		}

		if (!count) {
			callback(success);
		} else if (timeout) {
			timeoutId = setTimeout(onTimeout, timeout);
		}

		function doLoad(item) {
			var img = item.img,
				id = item.id;

			item.status = "loading";

			img.onload = function () {
				success = success && true;
				item.status = "loaded";
				done();
			};
			img.onerror = function () {
				success = false;
				item.status = "error";
				done();
			};
			img.src = item.src;

			function done() {
				img.onload = img.onerror = null;

				try {
					//IE doesn't support this
					delete window[id];
				}
				catch (e) {

				}
				if (!--count && !isTimeout) {
					clearTimeout(timeoutId);
					callback(success);
				}
			}
		}

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