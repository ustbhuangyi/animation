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
