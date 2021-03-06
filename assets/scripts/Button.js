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
        label: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.animation = this.node.getComponent(cc.Animation)
    },

    init() {
        // 初始化为白色按钮
        cc.loader.loadRes('images/btn-white', cc.SpriteFrame, (err, spriteFrame) => {
            this.node.getComponent(cc.Sprite).spriteFrame = spriteFrame
        })

        // 注册点击事件
        this.node.on('click', () => {
            // 先让倒计时停一下
            this.game.progressBar.getComponent('ProgressBar').stop = true
            // 解除所有选项按钮的点击事件
            for (const option of this.game.options) {
                option.off('click')
            }
            // 正确
            if (this.correct) {
                // 当前点击按钮变成绿色
                cc.loader.loadRes('images/btn-green', cc.SpriteFrame, (err, spriteFrame) => {
                    this.node.getComponent(cc.Sprite).spriteFrame = spriteFrame
                })
                // 连击
                this.game.multiHit++
                // 加分
                this.game.gainScore()
                if (this.game.multiHit >= 2) {
                    this.game.showMultiHit()
                }
                // 停顿
                this.scheduleOnce(() => {
                    this.game.destroyOptions()
                    this.game.renderQuestion()
                    this.game.progressBar.getComponent('ProgressBar').stop = false
                }, 1)
            } else { // 错误
                // 当前点击按钮变成红色
                cc.loader.loadRes('images/btn-red', cc.SpriteFrame, (err, spriteFrame) => {
                    this.node.getComponent(cc.Sprite).spriteFrame = spriteFrame
                })
                // 振动
                this.animation.play('error-vibrate')
                try {
                    wx.vibrateLong()
                } catch (err) {
                    console.log('非微信小游戏环境', err)
                }
                // 连击
                this.game.multiHit = 0
                // 显示正确选项
                this.game.showCorrectOption()
                // 停顿
                this.scheduleOnce(() => {
                    this.game.destroyOptions()
                    this.game.renderQuestion()
                    this.game.progressBar.getComponent('ProgressBar').stop = false
                }, 1)
            }
        })
    },

    start() {

    },

    // update(dt) {},
});
