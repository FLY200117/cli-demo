# 脚手架

在前端开发过程中，由于各种各样的轮子出现，使得前端的开发技术环境变得多变多样，从webpack到vite此类的脚手架出现，脚手架的含义以及作用越发明显和重要，在自己公司内部前端的脚手架能帮助内部开发人员更快开发项目



大致流程：

npm下载脚手架 ——> --help查看脚手架指令 ——> 使用指令创建项目 ——> 交互，选择要创建的项目模板 ——> 选择完毕后，按照选择去github下载对应的模板 ——> 下载下来的模板放到需要创建的文件目录下





# 功能

脚手架基本实现流程：

1. 初始化项目：
   +  创建项目，配置项目所需的信息
   + npm link项目至全局，这样本地可以临时调用指令
2. 项目开发：
   + 基础指令配置： `--help`  `--version`
   + 实现命令行交互功能：`inquirer`
   + 拉取项目模板：`download-git-repo`
   + 根据用户选择动态生成项目
3. 提交到npm
   + npm注册账号/npm登录账号
   + npm publish，发布npm包





## 运行创建命令

`command`：

1. version：
   + 指定程序的版本
2. option：
   + 定义`commander`选项options
3. command：
   + 添加命令名称
4. alias description usage：
   + 定义命令的别名描述和用法





## 交互式用户选择

`inquirer`：

该第三方库提供了很多可供交互的选择，下面是官网提供的例子

```js
inquirer
  .prompt([
    /* Pass your questions in here */
  ])
  .then((answers) => {
    // Use user feedback for... whatever!!
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
```



当我们需要交互的时候new一个实例并赋予prompt即可，选择可以通过await异步获取，例如下面

```js
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
```



更多相关配置详见[官网](https://github.com/SBoudrias/Inquirer.js)



## 生成用户需要的项目文件

`fs-extra`：

是node里面fs模块的扩展，提供了更多便利的API，并继承了fs的API，比fs使用起来更加友好

cli中主要就是创建所需要的文件夹来存放clone下来的仓库，如果拉取失败则删除文件夹，如下例

```js
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

    fs.emptyDir(targetDirectory,err => {
        if (err) return console.error(err) 
    })
```



## 其他需要的库

1. ora

   + 命令行loading效果，可以在fs文件生成期间过滤
   + 注意版本，如果需要require则降到`5.0.0`版本以下

   ```js
   import ora from 'ora'
   
   const spinner = ora('Loading unicorns').start();
       setTimeout(() => {
           spinner.color = 'yellow';
           spinner.text = 'Loading rainbows';
       }, 1000);
       setTimeout(() => {
           spinner.succeed()
       }, 5000);
   ```

2. download-git-repo

   + 命令行下载工具
   + 可以从git中下载并提取一个git仓库
   + 注意: `download-git-repo` 不支持 `Promise`,如果需要await调用，则需要通过util中的promisify来使它变成异步
   
   ```js
   const downloadGitRepo = reuqire("download-git-repo")
   downloadGitRepo(url,target,callback)
   ```
   
   