//程序入口
define(function (require) {

    var animation = require("animation");

    var $rabbit1 = $('rabbit1'),
        $rabbit2 = $('rabbit2'),
        $rabbit3 = $('rabbit3'),
        $rabbit4 = $('rabbit4');

    var repeatAnimation,
        runAnimation,
        winAnimation,
        loseAnimation;

    var rightRunningMap = ["0 -854", "-174 -852", "-349 -852", "-524 -852", "-698 -851", "-873 -848"],  //兔子右跑
        leftRunningMap = ["-2px 0", "-176px -2px", "-351px -3px", "-524px -3px", "-698px -3px", "-874px -3px"],
        rabbitWinMap = ["0 0", "-198 0", "-401 0", "-609 0", "-816 0", "0 -96", "-208 -97", "-415 -97", "-623 -97", "-831 -97", "0 -203", "-207 -203", "-415 -203", "-623 -203", "-831 -203", "0 -307", "-206 -307", "-414 -307", "-623 -307"],
        rabbitLoseMap = ["0 0", "-163 0", "-327 0", "-491 0", "-655 0", "-819 0", "0 -135", "-166 -135", "-333 -135", "-500 -135", "-668 -135", "-835 -135", "0 -262"];

    repeatAnimation = animation().changePosition($rabbit1, rightRunningMap).repeat();

    function $(id) {
        return document.getElementById(id);
    }


});

