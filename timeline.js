define(function (require, exports, module) {
    var requestAnimationFrame,
    cancelAnimationFrame,
    DEFAULT_INTERVAL = 1000 / 60;

    function Timeline() {
        this.animationHandler = 0;
    }

    Timeline.prototype.onenterframe = function (time) {
        // body...
    };

    Timeline.prototype.start = function (interval) {
        var startTime = +new Date(),
        me = this,
        lastTick = 0;
        me.interval  = interval || DEFAULT_INTERVAL;
        //this.onenterframe(new Date - startTime);
        me.startTime = startTime;
        me.stop();
        nextTick();

        function nextTick() {
            var now = +new Date();

            me.animationHandler = requestAnimationFrame(nextTick);

            if ( now - lastTick >= me.interval ) {
                me.onenterframe(now - startTime);
                lastTick = now;
            }
        }
    };

   Timeline.prototype.restart = function() {
        // body...
        var me = this,
            lastTick = 0,interval,startTime;

        if(!me.dur || !me.interval) return;

        interval = me.interval;
        startTime = +new Date() - me.dur;
        
        me.startTime = startTime;
        me.stop();
        nextTick();
        
        function nextTick(){
            var now = +new Date();
            
            me.animationHandler = requestAnimationFrame( nextTick );

            if(now - lastTick >= interval){ 
                me.onenterframe(now - startTime);
                lastTick = now;
            }       
        }
    };

    Timeline.prototype.stop = function () {
        if( this.startTime ) {
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
                return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
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


   module.exports = Timeline;
});