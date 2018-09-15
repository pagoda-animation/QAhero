cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        wx.showShareMenu();
        wx.onShareAppMessage({
            title: '是英雄就答100分',
            imageUrl: 'https://mp.weixin.qq.com/wxopen/basicprofile?action=get_headimg&token=782327838&t=20180915181934'
        })
    },

    // update (dt) {},

    startGame: function () {
        cc.director.loadScene("Game");
    },
    toRankList() {
        cc.director.loadScene('RankingList')
    }

});