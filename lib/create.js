const path = require("path")
const fs = require("fs-extra")
const Inquirer = require("inquirer")
const Creator = require("./creator")


module.exports = async function (projectName,option) {
    // 获取当前工作目录
    const cwd = process.cwd()
    // 拼接得到项目目录
    const targetDirectory = path.join(cwd, projectName)

    // 判断目录是否存在
    if(fs.existsSync(targetDirectory)){

        // 判断是否使用了force参数
        if(option.force){
            // 删除重名目录，remove是个异步方法
            await fs.remove(targetDirectory)
        }else {
            let { isOverwrite } = await new Inquirer.prompt([
                {
                    name: "isOverwrite", // 与返回值对应
                    type: "list", // list 类型
                    message: "Target directory exists, Please choose an action",
                    choices: [
                        { name: "Overwrite", value: true },
                        { name: "Cancel", value: false },
                    ]
                }
            ])

            // 选择了Cancel
            if(!isOverwrite){
                console.log('cancel')
                return
            } else {
                // 选择了Overwrite，先删除原有重名目录
                console.log('\r\nRemoving')
                await fs.remove(targetDirectory)
            }
        }
    }

    // 如果不存在目标文件，则创建目标文件
    fs.emptyDir(targetDirectory,err => {
        if (err) return console.error(err) 
    })
    
    const creator = new Creator(projectName,targetDirectory)
    creator.create()

    // 调用请求函数，获取用户的选择
    const repo = await creator.getRepoInfo()
    const tag = await creator.getTagInfo(repo)
    await creator.download(repo,tag)
    console.log(`\r\nSuccessfully created project ${chalk.cyan(projectName)}`);
    console.log(`\r\n  cd ${chalk.cyan(projectName)}`);
    console.log("  npm install\r\n");
    console.log("  npm run dev\r\n")
}