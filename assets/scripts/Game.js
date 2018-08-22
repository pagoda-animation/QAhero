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
        nickname: {
            default: null,
            type: cc.Node
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
        lastTime: {
            default: null,
            type: cc.Node
        },
        // 问题节点
        question: {
            default: null,
            type: cc.Node
        },
        // 四个选项
        options: []
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.centerX = this.bg.x
        this.centerY = this.bg.y
        this.titles = JSON.parse(jsonStr)
        this.score = 0
        this.createOptions()
    },

    // 生成四个选项
    createOptions () {
        // 从题库中随机选取一道题
        const index = Math.floor(Math.random() * this.titles.length)
        const title = this.titles[index]
        this.question.getComponent(cc.Label).string = title.title

        for (let i = 0; i < 4; i++) {
            const newBtn = cc.instantiate(this.btnPrefab)
            this.options.push(newBtn)
            this.node.addChild(newBtn)
            newBtn.getComponent('Button').answer.getComponent(cc.Label).string = title.options[i]
            newBtn.getComponent('Button').ans = ['A', 'B', 'C', 'D'][i]

            // 计算选项的显示位置
            const x = this.centerX
            const y = this.question.y - this.question.height / 2 - newBtn.height / 2 - 40 - (newBtn.height / 2 + 40) * i
            newBtn.setPosition(cc.v2(x, y))

            // 监听点击事件
            newBtn.on('click', event => {
                if (event.node.getComponent('Button').ans == title.answer) {
                    console.log('答对了')
                    this.gainScore()
                    event.node.color = new cc.Color(0, 255, 0)
                } else {
                    event.node.color = new cc.Color(255, 0, 0)
                    const index = 'ABCD'.indexOf(title.answer)
                    this.options[index].color = new cc.Color(0, 255, 0)
                }
                setTimeout(() => {
                    this.destroyOptions()
                    this.createOptions()
                }, 1000)
            })
        }
    },

    // 摧毁选项
    destroyOptions () {
        for (let i = 0; i < this.options.length; i++) {
            this.options[i].destroy()
        }
        this.options = []
    },

    // 获取分数
    gainScore () {
        this.score += 1
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = `${this.score} 分`
    },

    start () {

    },

    // update (dt) {},
});
