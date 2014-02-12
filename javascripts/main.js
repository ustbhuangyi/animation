//³ÌÐòÈë¿Ú
define(function (require) {

    var animation = require("animation");

    var $rabbit1 = $('rabbit1'),
        $rabbit2 = $('rabbit2'),
        $rabbit3 = $('rabbit3'),
        $rabbit4 = $('rabbit4');

    var rightRunningMap = ["0 -854", "-174 -852", "-349 -852", "-524 -852", "-698 -851", "-873 -848"],
        leftRunningMap = ["-2px 0", "-176px -2px", "-351px -3px", "-524px -3px", "-698px -3px", "-874px -3px"],
        rabbitWinMap = ["0 0", "-198 0", "-401 0", "-609 0", "-816 0", "0 -96", "-208 -97", "-415 -97", "-623 -97", "-831 -97", "0 -203", "-207 -203", "-415 -203", "-623 -203", "-831 -203", "0 -307", "-206 -307", "-414 -307", "-623 -307"],
        rabbitLoseMap = ["0 0", "-163 0", "-327 0", "-491 0", "-655 0", "-819 0", "0 -135", "-166 -135", "-333 -135", "-500 -135", "-668 -135", "-835 -135", "0 -262"];

    repeat();
    run();
    win();
    lose();

    function repeat() {
        var repeatAnimation = animation().changePosition($rabbit1, rightRunningMap).repeat();
        repeatAnimation.start(80);

    }

    function run() {
        var interval = 50,
            speed = 6,
            left, position,
            initLeft = 100,
            finalLeft = 500,
            frame = 4,
            frameLength = 6,
            right = true;

        var runAnimation = animation().enterFrame(function (success, time) {
            var ratio = (time) / interval;
            if (right) {
                position = rightRunningMap[frame].split(" ");
                left = Math.min(initLeft + speed * ratio, finalLeft);
                if (left == finalLeft) {
                    right = false;
                    frame = 4;
                    runAnimation.pause().start(interval);
                }
            } else {
                position = leftRunningMap[frame].split(" ");
                left = Math.max(finalLeft - speed * ratio, initLeft);
                if (left == initLeft) {
                    right = true;
                    frame = 4;
                    runAnimation.pause().start(interval);
                }
            }
            if (++frame == frameLength) {
                frame = 0;
            }
            $rabbit2.style.backgroundPosition = position[0] + "px " + position[1] + "px";
            $rabbit2.style.left = left + "px";
        }).repeat();
        runAnimation.start(interval);
    }

    function win() {
        var winAnimation = animation().changePosition($rabbit3, rabbitWinMap);
        winAnimation.start(200);
    }

    function lose() {
        var loseAnimation = animation().changePosition($rabbit4, rabbitLoseMap);
        loseAnimation.start(200);
    }

    function $(id) {
        return document.getElementById(id);
    }


});

