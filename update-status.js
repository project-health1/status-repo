const octokit = require('@octokit/rest')()

const token = process.env['GITHUB_TOKEN'];
if (!token) {
  throw new Error(`No 'GITHUB_TOKEN' environment variable defined.`);
}

async function start() {
  octokit.authenticate({
    type: 'oauth',
    token: token,
  });
  const result = await octokit.pullRequests.getAll({
    owner: 'project-health1',
    repo: 'status-repo',
  });

  if (!result.data) {
    throw new Error('Foudn no data when retrieving all pull requests.');
  }

}

start();
