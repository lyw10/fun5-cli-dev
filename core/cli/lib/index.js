"use strict";

module.exports = core;

const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const log = require("@fun5-cli-dev/log");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;

// import rootCheck from "root-check";

const pkg = require("../package.json");
const constant = require("./const");

let args;

async function core() {
  try {
    // 检查版本号
    checkPkgVersion();
    // 检查 node 版本
    checkNodeVersion();
    // 检查 root 启动
    checkRoot();
    // 检查用户主目录
    checkUserHome();
    // 检查入参
    checkInputArgs();
    // 检查环境变量
    checkEnv();
    // 检查是否为最新版本
    checkGlobalUpdate();
  } catch (e) {
    console.error(e.message);
  }
}

// 检查版本号函数
function checkPkgVersion() {
  log.info("cli", pkg.version);
}

// 检查 node 版本
function checkNodeVersion() {
  // 1.获取当前node版本号
  const currentVersion = process.version;
  // 2.比对最低版本号
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(
      colors.red(`fun5-cli 需要安装 v${lowestNodeVersion} 以上版本的 Node.js`)
    );
  }
}

//检查 root 启动
function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

// 检查用户主目录
function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red(`当前登录用户主目录不存在！`));
  }
}

// 检查入参
function checkInputArgs() {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs();
}
function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }
  log.level = process.env.LOG_LEVEL;
}

// 检查环境变量
function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath,
    });
  }

  createDefaultConfig();
  log.verbose("环境变量", process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// 检查是否为最新版本
async function checkGlobalUpdate() {
  // 1.获取最新版本号，模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 2.调用npm API，获取所有的版本号
  // 3.提取所有版本号，比对哪些版本号是大于当前版本号的
  // 4.给出最新版本号，提示用户更新到最新版本
  const { getNpmSemverVersion } = require("@fun5-cli-dev/get-npm-info");
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      colors.yellow(
        `请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本:${lastVersion}
                更新命令：npm install -g ${npmName}`
      )
    );
  }
}
