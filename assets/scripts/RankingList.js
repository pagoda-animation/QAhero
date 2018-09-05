// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const State = require('state')
cc.Class({
    extends: cc.Component,

    properties: {
        replayBtn: cc.Node,
        sharedCanvasSprite: cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 返回游戏按钮
        this.replayBtn.on('click', () => {
            cc.director.loadScene('Game')
        })

        // 绘制排行榜canvas
        this.tex = new cc.Texture2D()
        try {
            this.initRankingList()
        } catch (err) {
            console.log('非微信小游戏环境', err)
        }

        // 监听滑动事件
        this.node.on('touchmove', function(event) {
            console.log('delta y =>', event.getDeltaY())
            wx.postMessage({
                type: 'scroll',
                distance: event.getDeltaY()
            })
        })
    },

    // 初始化排行榜画布
    initRankingList () {
        const openDataContext = wx.getOpenDataContext()
        const sharedCanvas = openDataContext.canvas
        sharedCanvas.width = 500
        sharedCanvas.height = 750
        wx.postMessage({
          type: 'initSort',
          key: 'score',
          value: State.score,
          canvas: {
              width: 500,
              height: 750
          }
        })
        // this.tex.initWithElement(sharedCanvas)
        // this.tex.handleLoadedTexture()
        // this.sharedCanvasSprite.spriteFrame = new cc.SpriteFrame(this.tex)
    },

    // 更新排行榜画布
    updateRankingList () {
        const openDataContext = wx.getOpenDataContext()
        const sharedCanvas = openDataContext.canvas
        // openDataContext.postMessage({
        //     type: 'scroll',
        //     distance
        // })
        this.tex.initWithElement(sharedCanvas)
        this.tex.handleLoadedTexture()
        this.sharedCanvasSprite.spriteFrame = new cc.SpriteFrame(this.tex)
    },

    start () {

    },

    update () {
        this.updateRankingList()
    },
});
