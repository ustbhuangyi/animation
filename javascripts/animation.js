define(function (require, exports, module) {
    var Timeline = require("timeline"),
        loadImage = require("imageloader");

    var STATE_UNINITED = 0,
        STATE_INITED = 1,
        STATE_STOP = 2;

    var TIMELINE = 1;

    function nextnext(callback) {
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
                //load srcs
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
        repeat: function (times, opts) {
            var me = this;
            return this._add(function () {
                if (times) {
                    if (!--times) {
                        me.index++;
                    }
                    else {
                        me.index--;
                    }
                    doNext();
                }
                else {
                    me.index--;
                    doNext();
                }

                function doNext(){
                    if (opts && opts.delay) {
                        setTimeout(function () {
                            me._next();
                        }, opts.delay);
                    }
                    else {
                        me._next();
                    }
                }
            });
        },
        start: function (interval) {
            var queue;
            if (this.state == STATE_INITED)
                return this;
            this.state = STATE_INITED;
            queue = this.taskQueue,
                len = queue.length;
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
        delay: function (time) {
            if (this.taskQueue && this.taskQueue.length > 0) {
                this.taskQueue[this.taskQueue.length - 1].delay = time;
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
            this.taskQueue.push({ task: task, type: type });
            return this;
        },
        _next: function () {
            var queue;
            if (!this.taskQueue || this.state == STATE_STOP)
                return;
            if (this.index == this.taskQueue.length) {
                this.dispose();
                return;
            }
            queue = this.taskQueue[this.index];
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
                queue.delay ? setTimeout(function () {
                    me._next();
                }, queue.delay) : me._next();

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
                    queue.delay ? setTimeout(function () {
                        me._next();
                    }, queue.delay) : me._next();
                }, time);
            }
        },
        constructor: Animation
    }

    module.exports = function () {
        return new Animation();
    };

});