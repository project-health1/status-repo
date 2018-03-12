const octokit = require('@octokit/rest')()

const token = process.env['PROJECT_HEALTH1_TOKEN'];
if (!token) {
  throw new Error(`No 'PROJECT_HEALTH1_TOKEN' environment variable defined.`);
}

const OWNER = 'project-health1';
const REPO = 'status-repo';

const statusRegex = /\[status::(.*)\]/g;

function getDesiredState(title) {
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

async function setStatus(sha, state) {
  console.log(`setStatus: ${sha} ${state}`);
  await octokit.repos.createStatus({
    owner: OWNER,
    repo: REPO,
    sha: sha,
    state,
    context: 'Project Health Testing',
    description: 'Status will never change unless the script in ' +
      '/project-health1/status-repo is run/'
  });
}

async function getLatestCommitSha(number) {
  const result = await octokit.pullRequests.getCommits({
    owner: OWNER,
    repo: REPO,
    number,
    per_page: 100,
  });

  if (!result.data) {
    throw new Error(`Unable to retrieve list of commits for PR '${number}'`);
  }

  return result.data[result.data.length - 1].sha;
}

async function start() {
  octokit.authenticate({
    type: 'oauth',
    token: token,
  });
  const result = await octokit.pullRequests.getAll({
    owner: OWNER,
    repo: REPO,
  });

  if (!result.data) {
    throw new Error('Foudn no data when retrieving all pull requests.');
  }

  for (const prData of result.data) {
    console.log();

    const title = prData.title;
    const desiredState = getDesiredState(title);
    if (!desiredState) {
      console.log(`No desired status found for '${title}'`);
      continue;
    }
    console.log(`Found desired status of '${desiredState}' for '${title}'`);

    const commitSha = await getLatestCommitSha(prData.number);
    await setStatus(commitSha, desiredState);
  }
}

start();
