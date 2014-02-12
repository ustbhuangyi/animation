var Timeline = require("timeline"),
    loadImage = require("imageloader");

var STATE_UNINITED = 0,
    STATE_INITED = 1,
    STATE_STOP = 2,
    TIMELINE = 1;

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
            //load srcs
            loadImage(imglist.slice(), success);
            imglist = null;
        });
    },
    changePosition: function (ele, positions) {
        var len = positions.length,
            index = 0,
            me = this;
        return this._add(len ? function (success, time) {
            index = (time / me.interval) | 0;
            if (index >= len) {
                index = 0;
                success();
                return;
            }
            //change posistions
            var position = positions[index].split(" ");
            ele.style.backgroundPosition = position[0] + "px " + position[1] + "px";
        } : next, TIMELINE);
    },
    changeSrc: function (ele, imglist) {
        var len = imglist.length,
            index = 0,
            me = this;
        return this._add(len ? function (success, time) {
            index = (time / me.interval) | 0;
            if (index >= len) {
                index = 0;
                success();
                return;
            }
            ele.src = imglist[index];
        } : next, TIMELINE);
    },
    wait: function (callback) {
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
            if (times) {
                if (! --times) {
                    me.index++;
                }
                else {
                    me.index--;
                }
                me._next();
            }
            else {
                me.index--;
                me._next();
            }
        });
    },
    start: function (interval) {
        if (this.state == STATE_INITED)
            return this;
        this.state = STATE_INITED;
        var queue = this.taskQueue,
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
        var me = this,
            queue;
        if (!this.taskQueue || me.state == STATE_STOP)
            return;
        if (this.index == this.taskQueue.length) {
            this.dispose();
            return;
        }
        queue = this.taskQueue[this.index];
        if (queue.type == TIMELINE) {
            me._enterframe(queue.task);
        }
        else {
            me._excuteTask(queue.task);
        }
    },
    _excuteTask: function (task) {
        var me = this;
        task(function () {
            me.index++;
            me._next();
        });
    },
    _enterframe: function (task) {
        var me = this;

        this.timeline.onenterframe = enter;
        this.timeline.start(this.interval);

        function enter(time) {
            task(function () {
                me.timeline.stop();
                me.index++;
                me._next();
            }, time);
        }
    },
    constructor: Animation
}

exports = function () {
    return new Animation();
};


