cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    // update (dt) {},

    startGame: function () {
        cc.director.loadScene("Game");
    },
    toRankList() {
        cc.director.loadScene('RankingList')
    }

});