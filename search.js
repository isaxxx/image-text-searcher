const chalk = require('chalk');
const cpx = require('cpx');
const glob = require('glob');
const globBase = require('glob-base');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const rimraf = require('rimraf');

const getDestDirectoryPath = (srcFilePath) => {
  const globStats = globBase('./src');
  const extName = path.extname(srcFilePath);
  const fileName = path.basename(srcFilePath, extName);
  const dirName = path.dirname(srcFilePath).replace(globStats.base + '/src', '');
  return './' + path.join('./dest', dirName, '/');
};

const getSrcFilesPath = (srcFilesPathPattern) => {
  return glob.sync(srcFilesPathPattern).filter((srcFilePath) => {
    if (!fs.statSync(srcFilePath).isDirectory()) {
      return srcFilePath;
    }
  });
};

return new Promise((resolve) => {
  const srcFilesPath = getSrcFilesPath('./src/**/{*,.*}');
  resolve(srcFilesPath);
}).then((srcFilesPath) => {
  let targetListSource = fs.readFileSync('./search.txt', 'utf-8');
  targetListSource = targetListSource.split('\n');
  let targetList = [];
  for (let i = 0; i < targetListSource.length; i++) {
    if (targetListSource[i] !== '') {
      targetList.push(targetListSource[i]);
    }
  }
  let targetListRegex = targetList.join('|');
  targetListRegex = new RegExp(`(${targetListRegex})`, 'gu');

  if (srcFilesPath.length) {
    const processing = [];
    srcFilesPath.forEach((srcFilePath) => {
      const destDirectoryPath = getDestDirectoryPath(srcFilePath);
      processing.push(new Promise((resolve, reject) => {
        if (path.extname(srcFilePath).match(/\.(txt)$/)) {

          fs.readFile(srcFilePath, 'utf-8', (err, data) => {
            if (err) {
              reject(err);
            } else {

              let isOutput = true;
              let matchWords = data.match(targetListRegex);
              let total = 0;

              if (matchWords && matchWords.length > 0) {
                matchWords = matchWords.filter((x, i, self) => {
                    return self.indexOf(x) === i;
                });
                total = matchWords.length;
                let minMatchWordsLength = 1;
                if (process.argv[2]) {
                  minMatchWordsLength = Number(process.argv[2]);
                }
                if (total > minMatchWordsLength) {
                  isOutput = false;
                }
              }
              if (isOutput) {
                const srcImageFilePath = srcFilePath.replace(/\.txt$/, '');
                const destDirectoryPath = getDestDirectoryPath(srcImageFilePath);
                cpx.copy(srcImageFilePath, destDirectoryPath, (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    console.log(chalk.red(`NoMatch(${total}): ${srcImageFilePath}`));
                    resolve();
                  }
                });
              } else {
                resolve();
              }
            }
          });

        }
      }));
    });
    return Promise.all(processing);
  } else {
    return new Promise((resolve, reject) => {
      reject(new Error('ERROR: no file'));
    });
  }
}).catch((err) => {
  console.error(chalk.red(err));
});
