/* tslint:disable:quotemark */
import {flags} from '@oclif/command'
import * as chalk from 'chalk'

import {GitlabApi, GitlabBase} from '../gitlab-base'

export default class Gitlab extends GitlabBase {
  static description = 'show gitlab issues info'

  static examples = [
    `$ redlab gitlab`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    project: flags.string({char: 'p', description: 'project id', default: '0'}),
    issue: flags.string({char: 'i', description: 'issue id. used with project id option(-p, --project)', default: '0'}),
    detail: flags.boolean({char: 'd', description: 'show issue detail', default: false})
  }

  readonly ValidationFlags = (flags: any) => {
    if (isNaN(parseInt(flags.project, 10))) {
      throw new Error('project id(-p, --project) is not a number')
    }
    if (isNaN(parseInt(flags.issue, 10))) {
      throw new Error('issue id(-i, --issue) is not a number')
    }
  }

  async run() {
    const {flags} = this.parse(Gitlab)
    let projectId: number | null = null
    let issueId: number | null = null

    try {
      this.ValidationFlags(flags)
    } catch (e) {
      this.error(`${e.message}`)
      return
    }

    try {
      const gApi: GitlabApi = this.createGitlabApiObject()

      if (flags.issue !== '0' && flags.project !== '0') {
        projectId = parseInt(flags.project, 10)
        issueId = parseInt(flags.issue, 10)
        const ticketData = await gApi.get(gApi.getIssueURL(projectId, issueId), gApi.createParams())
        this.log(ticketData.data)
        return

      } else if (flags.project !== '0') {
        projectId = parseInt(flags.project, 10)
      } else {
        projectId = await this.getProjectId(gApi)
      }

      this.log(`getting issues info in project ...`)
      const issuesData: any = await gApi.get(gApi.getIssuesURL(projectId), gApi.createParams())
      const issuesList: Array<string> = issuesData.data.map((obj: any) => {
        return (flags.detail)
          ? `${chalk.default.bgBlue(` ${obj.iid} `)} ${chalk.default.blue.bold(obj.title)}

${chalk.default.blueBright('state:')}
${obj.state}

${chalk.default.blueBright('milestone:')}
${(!(obj.milestone === null)) ? obj.milestone : "--"}

${chalk.default.blueBright('author:')}
${obj.author.name}

${chalk.default.blueBright('assignee:')}
${(!(obj.assignee === null)) ? obj.assignee.name : "--"}

${chalk.default.blueBright('description:')}
${obj.description}
`
          : `${chalk.default.blue.bold(`${obj.iid}`)}: ${obj.title}`
      })
      issuesList.forEach(issue => {
        this.log(issue)
      })
      this.log(`---`)
      this.log(`${chalk.default.greenBright(`project id`)}: ${projectId}`)
      this.log(`${chalk.default.greenBright(`issues count`)}: ${issuesData.data.length}`)

    } catch (e) {
      this.error(`${e.message}`)
    }
  }
}
