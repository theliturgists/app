#!/usr/bin/env node

const exec = require('child_process').exec;
const { readFile, writeFile } = require('fs').promises;
const util = require('util');

const execPromise = util.promisify(exec);

const remark = require('remark');

const { readVersion } = require('@brettdh/standard-version-expo/android/native/buildnum/increment');

/* eslint-disable no-console */

function execWithChild(cmd, options) {
  let resolve;
  let reject;
  const done = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  const child = exec(cmd, options, (err, stdout, stderr) => {
    if (err) {
      reject(err);
    } else {
      resolve({ stdout, stderr });
    }
  });

  child.done = done;
  return child;
}

function truncate(text) {
  // Play Store has a max changelog size it will accept. We probably won't hit this
  // most of the time, so for now just don't bother trying to trim individual list items;
  // just put in a fallback message to avoid the whole publish process failing.
  const limit = 500;
  if (text.length >= limit) {
    return 'More stuff in this release than fits in this description!';
  }

  return text;
}

(async () => {
  try {
    const versionFile = 'android/app/build.gradle';
    const versionFileContents = await readFile(versionFile, { encoding: 'utf8' });
    const versionCode = readVersion(versionFileContents);
    const filename = `android/fastlane/metadata/android/en-US/changelogs/${versionCode}.txt`;

    // Note: if we don't explicitly close stdin, this hangs
    const child = execWithChild('npm run -s ci:save-latest-changelog', { timeout: 5000 });
    child.stdin.end();
    const { stdout } = await child.done;

    // Trim first line, which contains the version info and github link.
    // It's redundant, since the release notes will also show the version number.
    let changelog = stdout.replace(/[^\n]+\n/, '');
    if (changelog.trim().length === 0) {
      changelog = "Internal improvements and fixes only; (hopefully) nothing you'll notice.";
    }

    const strip = await import('strip-markdown');
    let plain = String(await remark().use(strip).process(changelog));
    // also remove markdown links
    plain = plain.replace(/ \(\[[a-z0-9]+\]\([^)]+\)\)/g, '');
    plain = plain.replace(/^\* +/gm, '* ');
    await writeFile(filename, truncate(plain));

    await execPromise(`git add ${filename}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
