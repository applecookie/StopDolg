const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const chalk = require('chalk');
const push = require('git-push');

const Config = require('./config');

// consts
const buildPath = './build';

// targets
const TARGET_GIT = 'git';
const TARGET_FOLDER = 'folder';
const allowedTargets = [TARGET_GIT, TARGET_FOLDER];

// logs
const log = (color, ...args) => console.log(chalk[color](...args));
const loge = console.log;
const C_RED = 'red';
const C_GRE = 'green';
const C_YEL = 'yellow';
const C_BLU = 'blue';
const C_MAG = 'magenta';
const C_CYA = 'cyan';
const C_WHI = 'white';
const C_GRA = 'gray';
const B_RED = 'redBright';
const B_GRE = 'greenBright';
const B_YEL = 'yellowBright';
const B_BLU = 'blueBright';
const B_MAG = 'magentaBright';
const B_CYA = 'cyanBright';
const B_WHI = 'whiteBright';

const LOG_INFO = C_CYA;
const LOG_SUCCESS = C_GRE;
const LOG_ERROR = C_RED;

loge();
log(LOG_SUCCESS, 'Deploy started');

loge();
log(LOG_INFO, 'reading config file...');
const config = Config.get();

log(LOG_INFO, 'looking for targets...');
const { targets } = config;
if (!targets || !(targets instanceof Array) || !targets.length) {
    throw new Error(`No targets specified`);
}
const specifiedTargets = targets.map(target => target.type);
const wrongTargets = specifiedTargets.filter(type => !allowedTargets.includes(type));
if (wrongTargets.length) {
    throw new Error(`Unknown targets "${wrongTargets.join(', ')}"`);
}

log(LOG_INFO, 'build project...');
cp.execSync('yarn build', { cwd: '.', windowsHide: true });

const makePath = dir => {
    const absolutePath = path.isAbsolute(dir) ? dir : path.resolve(dir);
    const relativePath = path.relative('.', absolutePath);

    relativePath.split(path.sep).reduce((dirPath, part) => {
        const targetPath = path.join(dirPath, part);
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath);
        }

        return targetPath;
    }, '.');
};
const rmdir = dir => {
    if (!fs.existsSync(dir)) {
        return;
    }

    const list = fs.readdirSync(dir);
    for (let i = 0; i < list.length; ++i) {
        const filename = path.join(dir, list[i]);
        const stat = fs.statSync(filename);

        if (filename === '.' || filename === '..') {
            // pass these files
        } else if (stat.isDirectory()) {
            // remove directory recursively
            rmdir(filename);
        } else {
            // remove file
            fs.unlinkSync(filename);
        }
    }
    // remove empty directory
    fs.rmdirSync(dir);
};
const makeDeploy = target => {
    loge();

    switch (target.type) {
        case TARGET_GIT:
            log(LOG_INFO, `starting deploy with "${target.type}" to "${target.url}"...`);
            return new Promise(resolve => push(buildPath, target.url, resolve))
                .then(() => {
                    rmdir(`${buildPath}/.git`);

                    log(LOG_SUCCESS, `build successfully pushed to git repo "${target.url}"`);
                });

        case TARGET_FOLDER:
            log(LOG_INFO, `starting deploy with "${target.type}" to "${target.path}"...`);
            rmdir(target.path);

            log(LOG_INFO, 'copying files...');
            const copyDir = (srcPath, destPath) => new Promise(
                (resolve, reject) => {
                    makePath(destPath);

                    fs.readdir(srcPath, (err, files) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(files);
                        }
                    });
                })
                .then(files => {
                    const promises = [];

                    for (let i = 0, iLen = files.length; i < iLen; ++i) {
                        const filename = files[i];
                        const filepath = path.join(srcPath, filename);

                        promises.push(
                            new Promise(
                                (resolve, reject) => {
                                    fs.lstat(filepath, (err, stat) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(stat);
                                        }
                                    })
                                })
                                .then(stat => {
                                    if (stat.isDirectory()) {
                                        return copyDir(filepath, path.join(destPath, filename));
                                    }

                                    return new Promise(
                                        (resolve, reject) => {
                                            fs.copyFile(filepath, path.join(destPath, filename), err => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve();
                                                }
                                            })
                                        })
                                        .then(() => {
                                            process.stdout.write('.');
                                        });
                                })
                        );
                    }

                    return Promise.all(promises);
                });

            return copyDir(buildPath, target.path)
                .then(() => {
                    loge();
                    log(LOG_SUCCESS, `files successfully copied to "${target.path}"`)
                })
                .catch(err => {
                    log(LOG_ERROR, `ERROR in copying files: ${err}`);
                    throw new Error();
                });

        default:
            log(LOG_ERROR, `type "${target.type}" is not supported yet. skipped.`);
    }
};

let promise = Promise.resolve(true);
targets.forEach(target => {
    promise = promise.then(() => makeDeploy(target));
});

promise.then(() => {
    loge();
    log(LOG_SUCCESS, 'Deploy completed');
});
