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
        scoreDisplay: cc.Label,
        replayBtn: cc.Node,
        rankingListBtn: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.replayBtn.on('click', () => {
            cc.director.loadScene('Game')
        })
        this.rankingListBtn.on('click', () => {
            cc.director.loadScene('RankingList')
        })
    },

    // 弹框初始化
    init (score) {
        this.scoreDisplay.string = `本轮得分：${score}`
        this.node.getComponent(cc.Animation).play('dialog-show')
    },

    start () {

    },

    // update (dt) {},
});
