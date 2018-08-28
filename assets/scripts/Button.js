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
        button: cc.Node,
        label: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad() {},

    init() {
        cc.loader.loadRes('images/btn-white', cc.SpriteFrame, (err, spriteFrame) => {
            this.button.getComponent(cc.Sprite).spriteFrame = spriteFrame
        })
        this.button.on('click', () => {
            this.game.progressBar.getComponent('ProgressBar').stop = true
            for (const option of this.game.options) {
                option.getComponent('Button').button.off('click')
            }
            if (this.correct) {
                cc.loader.loadRes('images/btn-green', cc.SpriteFrame, (err, spriteFrame) => {
                    this.button.getComponent(cc.Sprite).spriteFrame = spriteFrame
                })
                this.game.gainScore()
                this.scheduleOnce(() => {
                    this.game.destroyOptions()
                    this.game.renderQuestion()
                    this.game.startCountDown(30 - Math.floor(this.game.score / 25) * 5)
                }, 1)
            } else {
                cc.loader.loadRes('images/btn-red', cc.SpriteFrame, (err, spriteFrame) => {
                    this.button.getComponent(cc.Sprite).spriteFrame = spriteFrame
                })
                this.game.showCorrectOption()
                this.scheduleOnce(() => {
                    this.game.gameOver()
                }, 1)
            }
        })
    },

    start() {

    },

    // update(dt) {},
});
