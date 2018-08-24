// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const { titles: jsonStr } = require('../titles/titles')

cc.Class({
    extends: cc.Component,

    properties: {
        // 背景图节点
        bg: {
            default: null,
            type: cc.Node
        },
        // 选项按钮预制资源
        btnPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 头像节点
        avatar: {
            default: null,
            type: cc.Node
        },
        // 昵称节点
        nicknameDisplay: {
            default: null,
            type: cc.Label
        },
        // 分数label的引用
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        // 时间进度条节点
        progressBar: {
            default: null,
            type: cc.Node
        },
        // 剩余时间节点
        lastTimeDisplay: {
            default: null,
            type: cc.Label
        },
        // 题目label的引用
        questionDisplay: {
            default: null,
            type: cc.Label
        },
        // 四个选项
        options: []
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.titles = JSON.parse(jsonStr)
        this.score = 0
        this.status = 'process'

        console.log(this.avatar.getComponent(cc.Sprite))
        wx.getUserInfo({
            success: function (res) {
                console.log(res.userInfo)
                this.nicknameDisplay.string = res.userInfo.nickName
                cc.loader.load({
                    url: res.userInfo.avatarUrl,
                    type: 'jpg'
                }, (err, tex) => {
                    if (tex) { 
                        const spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, 200, 200))
                        this.avatar.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    } else if (err) {
                        console.log('err', err)
                    }
                })
            }.bind(this)
        })

        this.createOptions()

        // 开始倒计时
        this.startCountDown(30)
    },

    // 生成四个选项
    createOptions() {
        // 从题库中随机选取一道题
        const index = Math.floor(Math.random() * this.titles.length)
        const title = this.titles.splice(index, 1)[0]
        this.questionDisplay.string = title.title

        for (let i = 0; i < title.options.length; i++) {
            const newBtn = cc.instantiate(this.btnPrefab)
            this.options.push(newBtn)
            this.node.addChild(newBtn)
            newBtn.getComponent('Button').answer.getComponent(cc.Label).string = title.options[i]
            newBtn.getComponent('Button').ans = ['A', 'B', 'C', 'D'][i]

            // 计算选项的显示位置
            const x = 0
            const y = this.questionDisplay.node.y - this.questionDisplay.node.height / 2 - newBtn.height / 2 - 70 - (newBtn.height / 2 + 70) * i
            newBtn.setPosition(cc.v2(x, y))

            // 监听点击事件
            newBtn.on('click', event => {
                this.progressBar.getComponent('ProgressBar').stop = true
                if (event.node.getComponent('Button').ans == title.answer) {
                    this.gainScore()
                    event.node.color = new cc.Color(0, 255, 0)
                } else {
                    event.node.color = new cc.Color(255, 0, 0)
                    const index = 'ABCD'.indexOf(title.answer)
                    this.options[index].color = new cc.Color(0, 255, 0)
                    this.status = 'fail'
                }
                
                // 延时一秒后切换题目
                setTimeout(() => {
                    if (this.status == 'fail') {
                        this.gameOver()
                    }
                    this.destroyOptions()
                    this.createOptions()
                    this.startCountDown(30 - Math.floor(this.score / 25) * 5)
                }, 1000)
            })
        }
    },

    // 开始倒计时
    startCountDown(t) {
        const progressBar = this.progressBar.getComponent('ProgressBar')
        progressBar.game = this
        progressBar.stop = false
        progressBar.passTime = 0
        progressBar.totalTime = t
    },

    // 摧毁选项
    destroyOptions() {
        for (let i = 0; i < this.options.length; i++) {
            this.options[i].destroy()
        }
        this.options = []
    },

    // 获取分数
    gainScore() {
        this.score += 1
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = `${this.score} 分`
    },

    // 游戏结束
    gameOver() {
        console.log('你输了！')
        cc.director.loadScene('game')
    },

    start() {

    },

    // update(dt) {},
});
