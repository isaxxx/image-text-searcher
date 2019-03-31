const chalk = require('chalk');
const glob = require('glob');
const globBase = require('glob-base');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');

/**
 *
 * Google Cloud Vision（有料）
 * https://cloud.google.com/vision/
 * https://cloud.google.com/vision/pricing
 *
 * Google APIで認証用jsonを取得してMacの環境変数に登録するとコードが実行できるようになる
 * https://cloud.google.com/docs/authentication/getting-started#auth-cloud-implicit-nodejs
 * https://console.cloud.google.com/apis/credentials?showWizardSurvey=true
 * 
 * $ vi ~/.bashrc
 * export GOOGLE_APPLICATION_CREDENTIALS="/path/to/xxx.json"
 * $ source ~/.bashrc
 *
 **/

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

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
  if (srcFilesPath.length) {
    const processing = [];
    srcFilesPath.forEach((srcFilePath) => {
      const destDirectoryPath = getDestDirectoryPath(srcFilePath);
      processing.push(new Promise((resolve, reject) => {
        if (path.extname(srcFilePath).match(/\.(jpg|png)$/)) {

          client.textDetection(srcFilePath).then((results) => {
            const fullTextAnnotation = results[0].fullTextAnnotation;
            const detections = results[0].textAnnotations;
            let content = '';
            if (fullTextAnnotation === null) {
              content = 'テキストを検出できませんでした。';
            } else {
              // content = fullTextAnnotation.text;
              detections.forEach((text, index) => {
                if (index !== 0) {
                  content += text.description;
                }
              });
            }
            fsExtra.outputFile(srcFilePath + '.txt', content, 'utf-8', (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(chalk.green('Output: ' + srcFilePath + '.txt'));
                resolve();
              }
            });
          }).catch((err) => {
            reject(err);
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
