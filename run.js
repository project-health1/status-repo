const meow = require('meow');
const updateStatus = require('./update-status.js');

const cli = meow(`
Usage:
  $ node ./run.js --token $GITHUB_TOKEN --url 'https://github.com/<org>/<repo>/pull/<number>' --status 'sucess|pending|error|failure'
`);

const prUrl = cli.flags.url;
const status = cli.flags.status;
const token = cli.flags.token;

if (!token) {
  throw new Error(`No 'token' defined.`);
}
if (!prUrl) {
  throw new Error(`No 'url' defined.`);
}
if (!status) {
  throw new Error(`No 'stats' defined.`);
}

const urlParts = prUrl.split('/');
if (urlParts.length !== 7) {
  console.error('Invalid url parts: ', urlParts);
  throw new Error(`Expected 7 parts for the GitHub URL`);
}

if (urlParts[5] !== 'pull') {
  throw new Error(`Expected to find 'pull' in the URL, but didn't`);
}

const owner = urlParts[3];
const repo = urlParts[4];
const prNumber = urlParts[6];

console.log(`Setting status of '${status}' on '${owner}/${repo}/pull/${prNumber}'`);

updateStatus(token, urlParts[3], urlParts[4], urlParts[6], status);
