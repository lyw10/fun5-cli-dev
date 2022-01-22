"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const fse = require("fs-extra");
const semver = require("semver");
const Command = require("@fun5-cli-dev/command");
const log = require("@fun5-cli-dev/log");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = this._cmd._optionValues.force;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  async exec() {
    try {
      // 1.准备阶段
      await this.prepare();
      // 2.下载模版
      // 3.安装模版
    } catch (e) {
      log.error(e.message);
    }
  }

  async prepare() {
    const localPath = process.cwd();
    // 1.当前目录是否为空
    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;
      if (!this.force) {
        // 1.1询问是否继续创建 - inquirer
        ifContinue = (
          await inquirer.prompt({
            type: "confirm",
            name: "ifContinue",
            default: false,
            message:
              "当前文件夹不为空，如需继续创建项目，将会清空当前文件夹，是否继续创建项目？",
          })
        ).ifContinue;
        if (!ifContinue) return;
      }
      // 2.是否为强制更新
      if (ifContinue || this.force) {
        // 二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: "confirm",
          name: "confirmDelete",
          default: false,
          message: "是否确认清空当前目录下的文件？",
        });
        // 清空当前目录(不删除当前目录)
        if (confirmDelete) fse.emptyDirSync(localPath);
      }
    }

    return this.getProjectInfo();
  }

  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter(
      (file) => !file.startsWith(".") && ["node_modules"].indexOf(file) < 0
    );
    return !fileList || fileList.length <= 0;
  }

  async getProjectInfo() {
    const projectInfo = {};
    // 1.选择创建项目获组件
    const { type } = await inquirer.prompt({
      type: "list",
      name: "type",
      default: "project",
      message: "请选择初始化类型",
      choices: [
        { name: "项目", value: TYPE_PROJECT },
        { name: "组件", value: TYPE_COMPONENT },
      ],
    });
    log.verbose("type", type);

    if (type === TYPE_PROJECT) {
      // 2.获取项目的基本信息
      const o = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          default: "",
          message: "请输入项目名称",
          validate: function (v) {
            // 1.首字符必须为英文
            // 2.尾字符必须为英文或数字
            // 3.字符仅允许 -_
            const done = this.async();
            setTimeout(function () {
              if (
                !/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
                  v
                )
              ) {
                done("请输入合法的项目名称！");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return v;
          },
        },
        {
          type: "input",
          name: "projectVersion",
          default: "1.0.0",
          message: "请输入项目版本号",
          validate: function (v) {
            const done = this.async();
            setTimeout(function () {
              if (!!!semver.valid(v)) {
                done("请输入合法的项目版本号！");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return !!semver.valid(v) ? semver.valid(v) : v;
          },
        },
      ]);
      console.log(o);
    } else if (type === TYPE_COMPONENT) {
    }
    return projectInfo;
  }
}

//projectName, cmdObj, command
function init(argv) {
  return new InitCommand(argv);

  /**
   * 如果没有 apply
   * arguments[0] = projectName
   * cmdObj = undefined
   
  console.log(
    "inittt",
    projectName,
    cmdObj,
    command.parent.opts(),
    process.env.CLI_TARGET_PATH
  );
  */
}
module.exports.InitCommand = InitCommand;

module.exports = init;
