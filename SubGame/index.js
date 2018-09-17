/**
 * 主域与子域对接流程：
 *      1、主域传递数据给子域 
 *      2、子域从微信获取数据并绘制 canvas 
 *      3、主域通过 wx.getOpenDataContext().canvas 获取子域绘制的 canvas 
 *      4、主域将子域 canvas 绘制在用于显示排行榜的精灵节点 sprite 上
 * 
 * 主域需要传递给子域的data含有两种情况( api: wx.postMessage() ):
 *      情况一：{ type: 'initSort', key: 'score', canvas: { width: 500, height: 750 } }
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

const ITEM_HEIGHT = 125;
const PAGE_SIZE = 6;
const RANK_PAGE_HEIGHT = ITEM_HEIGHT * PAGE_SIZE;
let CANVAS_WIDTH = 500
let CANVAS_HEIGHT = 750
let KEY = 'score'

const dataSorter = (gameDatas, field = 'score') => {
	return gameDatas.sort((a, b) => {
		const kvDataA = a.KVDataList.find(kvData => kvData.key === KEY);
		const kvDataB = b.KVDataList.find(kvData => kvData.key === KEY);
		const gradeA = kvDataA ? parseInt(kvDataA.value || 0) : 0;
		const gradeB = kvDataB ? parseInt(kvDataB.value || 0) : 0;
		return gradeA > gradeB ? -1 : gradeA < gradeB ? 1 : 0;
	});
}

class RankListRenderer {
	constructor() {
    }
    
    init() {
        if(this.isInited) {
            return;
        }
        this.isInited = true;
        this.offsetY = 0;
        this.contentHeight = 0;
        this.gameDatas = [];    
        
        const sharedCanvas = wx.getSharedCanvas();
        this.sharedCtx = sharedCanvas.getContext('2d');
        this.sharedCanvasWidth = sharedCanvas.width;
        this.sharedCanvasHeight = sharedCanvas.height;
        
        this.rankCanvasList = [];
        this.rankImgLoadingCnt = [];
    }

	listen() {
		let _self = this
		wx.onMessage(data => {
			switch (data.type) {
				case 'initSort':
					this.init();
					// 获取主域 canvas 大小
					if (data.canvas) {
						CANVAS_WIDTH = data.canvas.width
						CANVAS_HEIGHT = data.canvas.height
					}
					// 设置向微信获取数据的 key 值
                    if (data.key) {
                        KEY = data.key
					}
					
					this.fetchFriendData();
					break;

				case 'update':
					wx.getUserCloudStorage({
						keyList: [KEY],
						success (res) {
							console.log('userCloudStorage =>', res)
							let scoreData = res.KVDataList.find(kvdata => kvdata.key === KEY )
							console.log('scoreData =>', scoreData)
              if (!scoreData || data.value > Number(scoreData.value)) {
								// 上传较大的分数
								wx.setUserCloudStorage({
									KVDataList: [
										{ key: 'score', value: `${data.value}`}
									],
									success: () => {
										console.log('更新数据成功')
									},
									fail () {
										console.log('更新数据失败')
									}
								})
							}
						},
						fail (res) {
							console.log('get userCloudStorage fail =>', res)
						}
					})
					break;
				case 'scroll':
					if (!this.gameDatas.length) {
						return;
					}
					if (RANK_PAGE_HEIGHT > this.contentHeight) {
                        console.log('数据太少')
                        return;
                    }
					const deltaY = data.distance;
					let newOffsetY = this.offsetY + deltaY;
					if (newOffsetY < 0) {
						// 当滑动超过顶部时，限制在顶部
						newOffsetY = 0
					}
					if (newOffsetY + RANK_PAGE_HEIGHT > this.contentHeight) {
						// 当滑动超过底部时，限制在底部
						newOffsetY = this.contentHeight - RANK_PAGE_HEIGHT
					}
					this.offsetY = newOffsetY;
                    this.drawSharedCanvas(newOffsetY);
					break;

				default:
					console.log(`未知消息类型:msg.action=${msg.action}`);
					break;
			}
		});
	}

	fetchFriendData() {
		//取出所有好友数据
		wx.getFriendCloudStorage({
			keyList: [KEY],
			success: res => {
				console.log("wx.getFriendCloudStorage success", res);
				// this.gameDatas = Array.from({length: 50}, function (info, index) {
				// 	let data = Object.assign({}, res.data[0])
				// 	let arr = []
				// 	arr = arr.concat([Object.assign({}, data.KVDataList[0])])
				// 	// console.log('arr =>', arr)
				// 	data.KVDataList = arr
				// 	data.KVDataList[0].value = parseInt(data.KVDataList[0].value, 10) + index
         //            return data
				// })
				this.gameDatas = dataSorter(res.data);
				const dataLen = this.gameDatas.length
				this.offsetY = 0;
				this.contentHeight = dataLen * ITEM_HEIGHT;
				if (dataLen) {
					this.rankCanvasList.length = 0;
                    this.drawSharedCanvas(0);
				}
			},
			fail: res => {
				console.log("wx.getFriendCloudStorage fail", res);
			},
		});
	}
    
    drawSharedCanvas(offsetY) {
		//清除sharedCanvas旧内容
        this.sharedCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        //分页，绘制多个rankCanvas，再将rankCanvas内容绘制到sharedCanvas
        const pageY = offsetY % RANK_PAGE_HEIGHT;
        const pageIndex = Math.floor(offsetY / RANK_PAGE_HEIGHT);
		const isOverOnePage = pageY + CANVAS_HEIGHT > RANK_PAGE_HEIGHT;

		let rankCanvas = this.getPagedRankCanvas(pageIndex);
		if(!isOverOnePage) {
			this.sharedCtx.drawImage(rankCanvas, 0, -pageY, CANVAS_WIDTH, CANVAS_HEIGHT);
		} else {
			//绘制当前页后半部分
			const partialHeight = RANK_PAGE_HEIGHT - pageY;
			this.sharedCtx.drawImage(rankCanvas, 0, -pageY, CANVAS_WIDTH, CANVAS_HEIGHT);

			//绘制下一页前半部分
			rankCanvas = this.getPagedRankCanvas(pageIndex + 1);
			this.sharedCtx.drawImage(rankCanvas, 0, partialHeight, CANVAS_WIDTH, CANVAS_HEIGHT)
		}
    }

	getPagedRankCanvas(pageIndex) {
		let canvas = this.rankCanvasList[pageIndex];
		if(!canvas) {
			canvas = wx.createCanvas();
			canvas.width = CANVAS_WIDTH;
			canvas.height = CANVAS_HEIGHT;
			this.rankCanvasList[pageIndex] = canvas;
			
			this.rankImgLoadingCnt[pageIndex] = 0;
			const ctx = canvas.getContext('2d');
			this.drawPagedRanks(ctx, pageIndex, () => {
				if(this.rankImgLoadingCnt[pageIndex] == 0) {
					this.drawSharedCanvas(this.offsetY);
				}
			});
		}
		return canvas;
	}

    drawPagedRanks(ctx, pageIndex, cb) {
        for(let i = 0; i < PAGE_SIZE; i++) {
			const pageOffset = pageIndex * PAGE_SIZE;
			const data = this.gameDatas[pageOffset + i];
			if(!data) continue;
            this.drawRankItem(ctx, pageIndex, i, pageOffset + i + 1, data, cb);
        }
    }

    //canvas原点在左上角
	drawRankItem(ctx, pageIndex, dataIndex, rank, data, cb) {
		const nick = data.nickname.length <= 5 ? data.nickname : data.nickname.substr(0, 5) + "...";
		const kvData = data.KVDataList.find(kvData => kvData.key === KEY);
		const grade = kvData ? kvData.value : 0;
		const itemGapY = ITEM_HEIGHT * dataIndex;

		//背景颜色
		if (rank % 2 == 1) {
			// ctx.fillStyle = "#FBF7E4";
			ctx.fillStyle = "rgba(51,51,51,0.25)";
		} else {
      ctx.fillStyle = 'rgba(144,144,144,0.25)'
		}
		ctx.fillRect(0, itemGapY, CANVAS_WIDTH, ITEM_HEIGHT);

		//名次
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "right";
		ctx.baseLine = "middle";
		ctx.font = "50px Helvetica";
		ctx.fillText(`${rank}`, 70, itemGapY + 0.6 * ITEM_HEIGHT);

		//头像
		const avatarX = 95;
		const avatarY = 25 + itemGapY;
		const avatarW = 80;
		const avatarH = 80;
		this.drawAvatar(ctx, data.avatarUrl, avatarX, avatarY, avatarW, avatarH, pageIndex, cb);

		//名字
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "left";
		ctx.baseLine = "middle";
		ctx.font = "30px Helvetica";
		ctx.fillText(nick, 220, 0.6 * ITEM_HEIGHT + itemGapY);

		//分数
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "left";
		ctx.baseLine = "middle";
		ctx.font = "30px Helvetica";
		ctx.fillText(`${grade}分`, 400, 0.6 * ITEM_HEIGHT + itemGapY);

	}

	drawAvatar(ctx, avatarUrl, x, y, w, h, pageIndex, cb) {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(x - 5, y - 5, w + 10, h + 10);

		const avatarImg = wx.createImage();
        avatarImg.src = avatarUrl;
        this.rankImgLoadingCnt[pageIndex]++;
		avatarImg.onload = () => {
            ctx.drawImage(avatarImg, x, y, w, h);
            this.rankImgLoadingCnt[pageIndex]--;
            cb && cb();
		};
	}
}

const rankList = new RankListRenderer();
rankList.listen();