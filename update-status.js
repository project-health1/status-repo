const octokit = require('@octokit/rest')()

function getDesiredState(title) {
  const statusRegex = /\[status::(.*)\]/g;
  const normalizedTitle = title.toLowerCase();
  const result = statusRegex.exec(normalizedTitle);
  if (!result) {
    return null;
  }

  const desiredState = result[1];
  const validValues = [
    'pending',
    'success',
    'error',
    'failure',
  ];

  if (validValues.indexOf(desiredState) === -1) {
    console.warn(`A status of '${desiredState}' was found, but valid ` +
      `values are [${validValues.join(', ')}]`);
    return null;
  }

  return desiredState;
}

async function setStatus(owner, repo, sha, state) {
  await octokit.repos.createStatus({
    owner,
    repo,
    sha: sha,
    state,
    context: 'Project Health Testing',
    description: 'Status will never change unless the script in ' +
      '/project-health1/status-repo is run/'
  });
}

async function getLatestCommitSha(owner, repo, number) {
  const result = await octokit.pullRequests.getCommits({
    owner,
    repo,
    number,
    per_page: 100,
  });

  if (!result.data) {
    throw new Error(`Unable to retrieve list of commits for PR '${number}'`);
  }

  return result.data[result.data.length - 1].sha;
}

module.exports = async function start(token, owner, repo, prNumber, status) {
  octokit.authenticate({
    type: 'oauth',
    token: token,
  });

    const commitSha = await getLatestCommitSha(owner, repo, prNumber);
    await setStatus(owner, repo, commitSha, status);
}
