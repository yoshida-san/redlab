/* tslint:disable:quotemark */
import {Command, flags} from '@oclif/command'
import * as chalk from 'chalk'

import {GitlabApi} from '../api/gitlab'
import {Inquirer} from '../inquirer/inquirer'

export default class Gitlab extends Command {
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
    if (isNaN(parseInt(flags.project, 10))) throw new Error('Please enter the \'Project ID(-p, --project)\' by numeric.')
    if (isNaN(parseInt(flags.issue, 10))) throw new Error('Please enter the \'Issue ID(-i, --issue)\' by numeric.')
  }

  readonly getProjectId = async (gitlabApi: GitlabApi, inquirer: Inquirer) => {
    try {
      let returnId = 0
      let status = true
      let pagination = 1
      while (status) {
        const projects: any = await gitlabApi.getProjectsObject(pagination)
        const argsProjects = projects.data.map((obj: any) => {
          return {name: obj.name, value: obj.id}
        })
        if (projects.headers['x-page'] !== projects.headers['x-total-pages']) argsProjects.push({name: '次のIssuesを取得', value: 'next'})
        if (projects.headers['x-page'] > 1) argsProjects.push({name: '前のIssuesを取得', value: 'prev'})
        const selected: any = await inquirer.list(argsProjects, 'Select Gitlab\'s Project:')
        if (selected.id === 'next') {
          pagination++
        } else if (selected.id === 'prev') {
          pagination--
        } else {
          returnId = parseInt(selected.id, 10)
          status = false
        }
      }
      return returnId
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to Get List for Projects.')
    }
  }

  readonly getIssuesData = async (gitlabApi: GitlabApi, projectId: number) => {
    try {
      let returnsObject: Array<any> = []
      let status = true
      let pagination = 0
      while (status) {
        pagination++
        const issueObject: any = await gitlabApi.getIssuesObject(projectId, pagination)
        returnsObject = [...returnsObject, ...issueObject.data]
        if (issueObject.headers['x-page'] === issueObject.headers['x-total-pages']) status = false
      }
      return returnsObject
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error(e)
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
      const gitlabApi: GitlabApi = new GitlabApi()
      const inquirer: Inquirer = new Inquirer()

      if (flags.issue !== '0' && flags.project !== '0') {
        projectId = parseInt(flags.project, 10)
        issueId = parseInt(flags.issue, 10)
        const ticketData: any = await gitlabApi.getIssueObject(projectId, issueId)
        this.log(ticketData.data)
        return

      } else if (flags.project !== '0') {
        projectId = parseInt(flags.project, 10)
      } else {
        projectId = await this.getProjectId(gitlabApi, inquirer)
      }

      this.log(`getting issues info in project ...`)
      const issuesData: any = await this.getIssuesData(gitlabApi, projectId)
      const issuesList: Array<string> = issuesData.map((obj: any) => {
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
      this.log(`${chalk.default.greenBright(`issues count`)}: ${issuesData.length}`)

    } catch (e) {
      this.error(`${e.message}`)
    }
  }
}
