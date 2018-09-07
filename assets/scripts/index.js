cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let button = wx.createUserInfoButton({
            text: "开始游戏",
            style :{
                left: 140,
                top : 195,
                width: 360,
                height: 160,
                backgroundColor: '0099ff',
                textAlign: 'center',
                fontSize : 60,
                lineHeight: 160
            }
        });

        button.onTap((res) => {
            // console.log(res)
            
        })
    },

    // update (dt) {},

    startGame: function () {
        cc.director.loadScene("Game");
    },
    
});