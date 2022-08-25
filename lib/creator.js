const { getTagsByRepo,getZhuRongRepo} = require('./api')
const Inquirer = require("inquirer")
const ora = require("ora")
const downloadGitRepo = require("download-git-repo")
// const util = require("util")
const fs = require("fs-extra")


class Creator {
    // 项目名称以及项目路径
    constructor(name,target) {
        this.name = name;
        this.target = target

        // 将download方法转换为promise方法
        // this.downloadGitRepo = util.promisify(downloadGitRepo)
    }

    async create() {
        console.log(this.name,this.target)
        // const repo = await getRepoInfo()
        // const res = await getTagInfo(repo)
        // console.log(repo,res)
    }

    async getRepoInfo() {
        let repoList = await this.loading('Loading',getZhuRongRepo);
        const repos = repoList.map((item) => item.name);
        let { repo } = await new Inquirer.prompt([
            {
              name: "repo",
              type: "list",
              message: "Please choose a template",
              choices: repos,
            },
          ]);
        return repo;
    }

    // 获取版本信息及用户选择的版本
    async getTagInfo(repo) {
        let tagList = await this.loading('Loading',getTagsByRepo,repo)
        const tags = tagList.map((item) => item.name);
        // 选取模板信息
        let { tag } = await new Inquirer.prompt([
        {
            name: "tag",
            type: "list",
            message: "Please choose a version",
            choices: tags,
        },
        ]);
        return tag;
    }

    /**
     * Loading加载效果
     * @param {String} message 加载信息
     * @param {Function} fn 加载函数
     * @param  {List} args 函数执行的参数
     * @returns 异步调用返回值
     */
    async loading(message,fn,...args){
        const spinner = ora(message).start() // 开始加载
        try{
            let executeRes = await fn(...args);
            spinner.succeed()
            return executeRes
        }catch(err) {
            // 如果请求失败，则返回消息并睡眠一秒后重新请求
            spinner.fail("request fail,refetching")
            await sleep(1000);
            return this.loading(message,fn,...args)
        }
    }

    async download(repo,tag) {
        const templateUrl = `zhurong-cli/${repo}${tag ? "/tree/" + tag : ""}`; // 当前仓库路径有问题
        // console.log(templateUrl+'target:'+this.target)
        await this.loading(
            "downloading template ,please waiting",
            downloadGitRepo,
            templateUrl,
            this.target, //项目创建位置
            (err) => {
                console.log(err?'Error Download':'Succeed Download')
                if(err) {
                    fs.remove(this.target)
                }
            }
        )
    }
}

/**
 * 睡觉函数
 * @param {Number} n 睡眠时间
 */
function sleep(n) {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            resolve()
        }, n);
    })
}




module.exports = Creator