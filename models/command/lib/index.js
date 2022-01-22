"use strict";

const semver = require("semver");
const colors = require("colors/safe");
const log = require("@fun5-cli-dev/log");

const LOWEST_NODE_VERSION = "12.0.0";

class Command {
  constructor(argv) {
    if (!argv) throw new Error("Command 参数不能为空！");
    if (!Array.isArray(argv)) throw new Error("Command 参数必须为数组！");
    if (argv.length < 1) throw new Error("请检查 Command 参数！");

    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((err) => {
        log.error(err.message);
      });
    });
  }

  // 检查 node 版本
  checkNodeVersion() {
    // 1.获取当前node版本号
    const currentVersion = process.version;
    // 2.比对最低版本号
    const lowestNodeVersion = LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestNodeVersion)) {
      throw new Error(
        colors.red(`fun5-cli 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`)
      );
    }
  }

  // 初始化参数
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  init() {
    throw new Error("init必须实现！");
  }

  exec() {
    throw new Error("exec必须实现！");
  }
}

module.exports = Command;
