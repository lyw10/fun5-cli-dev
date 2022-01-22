"use strict";

const Package = require("@fun5-cli-dev/package");
const log = require("@fun5-cli-dev/log");
const path = require("path");
const cp = require("child_process");

const SETTINGS = {
  init: "@imooc-cli/init",
};
const CACHE_DIR = "dependencies";

async function exec() {
  // 拿到targetPath
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose("homePath", homePath);

  // 拿到packageName
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];

  // 拿到packageVersion
  const packageVersion = "latest";

  // 如果targetPath不存在，生成缓存路径
  let storeDir = "";
  let pkg;
  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    log.verbose("targetPath", targetPath);
    log.verbose("storeDir", storeDir);

    // 初始化 package 对象
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });

    // 判断package是否存在
    if (await pkg.exists()) {
      // 更新package
      await pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    // taregtPath存在
    log.verbose("targetPath", targetPath);

    // 初始化 package 对象
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
    // 获取本地代码入口文件
    const rootFile = pkg.getRootFilePath();
    // 执行
    if (rootFile) {
      try {
        // require(rootFile)(arguments);
        // 为什么要用apply？实际上就是对类数组arguments进行格式转换为参数列表
        // 在当前进程中调用
        // require(rootFile).call(null, Array.from(arguments));
        // 希望：在node子进程中调用
        const args = Array.from(arguments);
        const cmd = args[args.length - 1];
        const o = Object.create(null);
        Object.keys(cmd).forEach((key) => {
          if (
            cmd.hasOwnProperty(key) &&
            (key === "_optionValues" || !key.startsWith("_")) &&
            key !== "parent"
          ) {
            o[key] = cmd[key];
          }
        });
        args[args.length - 1] = o;
        const code = `require('${rootFile}').call(null, ${JSON.stringify(
          args
        )})`;
        const child = spawn("node", ["-e", code], {
          cwd: process.cwd(),
          stdio: "inherit",
        });
        child.on("error", (e) => {
          console.log(e.message);
          process.exit(1);
        });
        child.on("exit", (e) => {
          log.verbose("命令执行成功", e);
          process.exit(e);
        });
      } catch (err) {
        log.error(err.message);
      }
    }
  }

  function spawn(command, args, options) {
    const win32 = process.platform === "win32";
    const cmd = win32 ? "cmd" : command;
    const cmdArgs = win32 ? ["/c"].concat(command, args) : args;

    return cp.spawn(cmd, cmdArgs, options || {});
  }

  // 1.根据targetPath拿到modulePath
  // 2.根据modulePath生成Package(npm模块)
  // 3.Package.getRootPath(获取入口文件)
}

module.exports = exec;
