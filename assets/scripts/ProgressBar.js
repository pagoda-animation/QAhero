// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        bar: cc.Node, // 进度条
        stop: false,
        startTime: Date.now() / 1000, // 倒计时开始时间
        passTime: 0, // 已经过的时间 单位：秒
        totalTime: 30 // 倒计时时间 单位：秒
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.flag = true // 用于判断动画是否已经在播放
        this.progressBar = this.node.getComponent(cc.ProgressBar)
    },

    start() {

    },

    update(dt) {
        // 暂停倒计时期间，startTime也需要延后，以保证重新开始倒计时后时间不会跳跃
        if (this.progressBar.progress == 0 || this.stop) {
            this.startTime += dt
            return
        }

        this.passTime = Date.now() / 1000 - this.startTime
        this.progressBar.progress = 1 - (this.passTime / this.totalTime)
        this.game.lastTimeDisplay.string = Math.floor(this.totalTime - this.passTime)

        // 催命特效
        if (this.totalTime - this.passTime <= 11 && this.flag) {
            this.flag = false
            this.game.lastTimeDisplay.node.color = new cc.Color(255, 0, 0)
            this.bar.color = new cc.Color(255, 0, 0)
            this.game.lastTimeDisplay.node.getComponent(cc.Animation).play('count-down')
        }

        //倒计时结束
        if (this.progressBar.progress <= 0) {
            this.game.lastTimeDisplay.node.color = new cc.Color(255, 255, 255)
            this.game.lastTimeDisplay.node.getComponent(cc.Animation).stop('count-down')
            this.progressBar.progress = 0
            this.game.lastTimeDisplay.string = 0
            this.game.showCorrectOption()
            this.scheduleOnce(() => {
                this.game.gameOver()
            }, 1)
        }
    },
});
