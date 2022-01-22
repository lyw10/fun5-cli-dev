"use strict";

const path = require("path");

// 路径兼容(macOS/windows)
module.exports = function formatPath(p) {
  if (!p && typeof p !== "string") return p;

  const sep = path.sep;
  return sep === "/" ? p : p.replace(/\\/g, "/");
};
