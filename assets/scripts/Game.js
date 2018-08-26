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
        // 背景图节点
        bg: cc.Sprite,
        // 头像节点
        avatar: cc.Sprite,
        // 昵称节点 
        nicknameDisplay: cc.Label,
        // 分数label的引用
        scoreDisplay: cc.Label,
        // 时间进度条节点
        progressBar: cc.Node,
        // 剩余时间节点
        lastTimeDisplay: cc.Label,
        // 题目label的引用
        questionDisplay: cc.Label,
        // 选项按钮预制资源
        btnPrefab: cc.Prefab,
        // 题库
        questionsList: cc.JsonAsset
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.score = 0
        this.status = 'process'

        try {
            this.requestUserInfo()
        } catch(err) {
            console.log('非微信小游戏环境', err)
        }

        // 从题库中随机选取一组题
        this.index = Math.floor(Math.random() * this.questionsList.json.length)

        // 渲染题目
        this.optionsPool = new cc.NodePool()
        this.options = []
        this.renderQuestion()

        // 开始倒计时
        this.startCountDown(30)
    },

    // 调用微信接口获取用户信息
    requestUserInfo() {
        wx.getUserInfo({
            success: function (res) {
                this.nicknameDisplay.string = res.userInfo.nickName
                cc.loader.load({
                    url: res.userInfo.avatarUrl,
                    type: 'jpg'
                }, (err, tex) => {
                    if (tex) {
                        const spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height))
                        this.avatar.spriteFrame = spriteFrame
                    } else if (err) {
                        console.log('err', err)
                    }
                })
            }.bind(this),
            fail(err) {
                console.log('获取用户信息出错', err)
                wx.openSetting()
            }
        })
    },

    // 随机选取题目并渲染
    renderQuestion() {
        // 检查题库是否有题
        if (this.questionsList.json[this.index].length == 0) {
            this.questionsList.json.splice(this.index, 1)
            if (this.questionsList.json.length == 0) {
                this.questionDisplay.string = '题库被答爆啦！'
                this.progressBar.getComponent('ProgressBar').stop = true
                return
            } else {
                // 从题库中随机选取一组题
                this.index = Math.floor(Math.random() * this.questionsList.json.length)
            }
        }

        // 从题库中随机选取一道题
        do {
            const index = Math.floor(Math.random() * this.questionsList.json[this.index].length)
            this.question = this.questionsList.json[this.index].splice(index, 1)[0]
        } while (!this.question || !this.question.title || !this.question.options || !this.question.answer)

        this.questionDisplay.string = this.question.title

        for (let i = 0; i < this.question.options.length; i++) {
            const optionBtn = this.createOption()
            this.options.push(optionBtn)
            this.node.addChild(optionBtn)
            optionBtn.getComponent('Button').game = this
            optionBtn.getComponent('Button').label.string = this.question.options[i]
            optionBtn.getComponent('Button').correct = Boolean(['A', 'B', 'C', 'D'][i] == this.question.answer)

            // 计算选项的显示位置
            const x = 0
            const y = -this.questionDisplay.node.height / 2 - 110 * i
            optionBtn.setPosition(cc.v2(x, y))

            // 初始化选按钮
            optionBtn.getComponent('Button').init()
            
        }
    },

    // 创建选项按钮
    createOption() {
        if (this.optionsPool.size() > 0) {
            return this.optionsPool.get()
        } else {
            return cc.instantiate(this.btnPrefab)
        }
    },

    // 开始倒计时
    startCountDown(t) {
        const progressBar = this.progressBar.getComponent('ProgressBar')
        progressBar.game = this
        progressBar.stop = false
        progressBar.startTime = Date.now() / 1000
        progressBar.passTime = Date.now() / 1000 - progressBar.startTime
        progressBar.totalTime = t
    },

    // 摧毁选项
    destroyOptions() {
        while (this.options.length > 0) {
            this.optionsPool.put(this.options.pop())
        }
    },

    // 获取分数
    gainScore() {
        this.score += 1
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = `${this.score} 分`
    },

    // 显示正确选项
    showCorrectOption() {
        const index = 'ABCD'.indexOf(this.question.answer)
        cc.loader.loadRes('images/btn-green', cc.SpriteFrame, (err, spriteFrame) => {
            this.options[index].getComponent('Button').button.getComponent(cc.Sprite).spriteFrame = spriteFrame
        })
    },

    // 游戏结束
    gameOver() {
        this.destroyOptions()
        cc.director.loadScene('Game')
    },

    start() {

    },

    // update(dt) {},
});
