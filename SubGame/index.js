/**
 * 主域与子域对接流程：
 *      1、主域传递数据给子域 
 *      2、子域从微信获取数据并绘制 canvas 
 *      3、主域通过 wx.getOpenDataContext().canvas 获取子域绘制的 canvas 
 *      4、主域将子域 canvas 绘制在用于显示排行榜的精灵节点 sprite 上
 * 
 * 主域需要传递给子域的data含有两种情况( api: wx.postMessage() ):
 *      情况一：{ type: 'initSort', key: 'score', canvas: { width: 500, height: 800 } }
 *      情况二：{ type: 'scroll', distance: 20 }
 * 
 * key: 需要从微信取回来的数据的字段名，如果不传，默认取 score 字段的数据
 * width: 主域用于显示排行榜的精灵节点的宽度 width          (主域精灵节点的宽高需与子域canvas 宽高一致，以免出现 canvas 被压缩变形的情况)
 * height: 主域用于显示排行榜的精灵节点的高度 height        (主域精灵节点的宽高需与子域canvas 宽高一致，以免出现 canvas 被压缩变形的情况)
 * distance： 代表滚动的距离，需要在主域节点传递给子域
 * 
 * 目前我这边主域是通过 this.node.on('mouseover', function(){}) 监听并传递滑动距离给子域
 * 
 */
let friendsData
let scrollTop = 0
let CANVAS_WIDTH = 500
let CANVAS_HEIGHT = 800
let KEY = 'score'
let sharedCanvas = wx.getSharedCanvas()
let ctx = sharedCanvas.getContext('2d')
ctx.save()
wx.onMessage(data => {
    console.log('this is subContext =>', data)
    if (data.type === 'initSort') {
        // 设置 canvas 宽高
        if (data.canvas) {
            CANVAS_WIDTH = data.canvas.width
            CANVAS_HEIGHT = data.canvas.height
        }
        // 设置向微信获取数据的 key 值
        if (data.key) {
            KEY = data.key
        }
        // 获取好友数据
        wx.getFriendCloudStorage({
            keyList: [KEY],
            success: (res) => {
                console.log('this is groupCloudStorage =>', res)
                friendsData = res.data
                drawRankingList(ctx, friendsData)
            }
        })
    } else if (data.type === 'scroll') {
        scrollTop += data.distance
        drawRankingList(ctx, friendsData)
    }
    
})

// 绘制 canvas 
function drawRankingList (ctx, data) {
    let HEIGHT = 70
    ctx.restore()
    ctx.save()
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.translate(0, -scrollTop)
    
    ctx.font = '50px serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'red'
    
    data.forEach((info, index) => {
        ctx.fillText(index + 1, 10, (index + 0.5) * HEIGHT)
        ctx.fillText(info.KVDataList[0].value, 400, (index + 0.5) * HEIGHT)
        let avatar = wx.createImage() 
        avatar.onload = (function (){
            return function () {
                ctx.drawImage(avatar, 200, HEIGHT * index, HEIGHT, HEIGHT)
            }
        })()
        avatar.src = info.avatarUrl
    })
}