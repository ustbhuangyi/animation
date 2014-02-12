animation
=========

[例子在这里](http://ustbhuangyi.github.io/animation/demo.html)

通常我们会遇到一些需求，用js实现一组动画（这里指的是由一帧帧图片组合而成的动画，非jq的animate）。

其实原理很简单，如果是多张图，就定时去改变image的src，如果是一张图，就定时改变backgroud-position；同时，我们还要支持图片预加载，动画执行次数（一次，n次，无限次），动画暂停，动画执行完成的回调等等。

有了上述需求，我觉得写一个通用的animation库还是很有必要的，这样用户就每必要为每一组动画写逻辑了，从繁琐的劳动中解放，不正是每个coder所期望的么：）

废话不多说，我们先看一下animation接口的调用demo，支持链式调用。

``` javascript
var animation = require("animation");
    
var demoAnimation = animation().changePosition(ele, positions).repeat();
    demoAnimation.start(200);

```
这种链式调用的语法，是不是很爽呢（妈妈再也不用担心我的动画）

## animation提供的接口

* loadImage(imagelist)  //预加载图片
* changePosition(ele,positions)  //通过改变元素的backgroud-position实现动画
* changeSrc(ele,imglist) //通过改变元素的backgroud-position实现动画(一般这种方式需要和loadImage配合使用)
* wait(callback) //动画执行完成后的回调函数
* enterFrame(callback) //每一帧动画执行的函数，相当于用户可以自定义每一帧动画的callback
* repeat(times) //动画重复执行的次数，times为空时表示无限次
* start(interval) //动画开始执行，interval表示动画执行的间隔
* pause() //动画暂停
* dispose() //释放资源

其它就不多说了，看代码吧：）
remind:animation.js依赖timeline.js和imageloader.js
