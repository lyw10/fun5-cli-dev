"use strict";

const axios = require("axios");
const urlJoin = require("url-join");
const semver = require("semver");

function getNpmInfo(npmName, registry) {
  if (!npmName) return null;
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  console.log(npmInfoUrl);
  return axios
    .get(npmInfoUrl)
    .then((res) => {
      if ((res.status = 200)) {
        return res.data;
      }
      return null;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npm.taobao.org/";
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

function getNpmSemverVersions(baseVsesion, versions) {
  return versions
    .filter((version) => semver.satisfies(version, `^${baseVsesion}`))
    .sort((a, b) => semver.gt(b, a));
}

async function getNpmSemverVersion(baseVsesion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getNpmSemverVersions(baseVsesion, versions);
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
};
