import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'

const getInputBool = (name: string, defaultValue = false): boolean => {
  const param = core.getInput(name)
  if (param === 'true' || param === '1') {
    return true
  } else if (param === 'false' || param === '0') {
    return false
  } else return defaultValue
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', {required: true})
    const sha = core.getInput('sha')
    const filterOutClosed = getInputBool('filterOutClosed')

    const result = await getOctokit(
      token,
      {}
    ).repos.listPullRequestsAssociatedWithCommit({
      owner: context.repo.owner,
      repo: context.repo.repo,
      commit_sha: sha || context.sha
    })

    let pr = result.data.length > 0 && result.data[0]

    if (filterOutClosed === true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pr = (pr as any).state === 'open' && pr
    }

    core.setOutput('number', (pr && pr.number) || '')
    core.setOutput('pr', pr ? JSON.stringify(pr) : '')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
