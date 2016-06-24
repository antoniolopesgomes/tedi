
var path = require('path');
var fs = require('fs');

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (directoryExists(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function directoryExists(path) {
  try {
    return fs.statSync(path).isDirectory();
  }
  catch (err) {
    return false;
  }
}

module.exports = {
    ensureDirectoryExistence: ensureDirectoryExistence,
    directoryExists: directoryExists
}