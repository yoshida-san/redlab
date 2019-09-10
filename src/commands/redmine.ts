/* tslint:disable:quotemark */
import {flags} from '@oclif/command'
import * as chalk from 'chalk'

import {RedmineApi, RedmineBase} from '../redmine-base'

export default class Redmine extends RedmineBase {
  static description = 'show redmine tickets info'

  static examples = [
    `$ redlab redmine -t=12345`,
    `$ redlab redmine -qdp=4567`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    project: flags.string({char: 'p', description: 'project id. can be used with query id option(-q, --query)', default: '0'}),
    query: flags.boolean({char: 'q', description: 'use query', default: false}),
    limit: flags.string({char: 'l', description: 'number of issues per page(max: 100)', default: '100'}),
    offset: flags.string({char: 'o', description: 'skip this number of issues in response', default: '0'}),
    detail: flags.boolean({char: 'd', description: 'show ticket detail', default: false}),
    ticket: flags.string({char: 't', description: 'ticket id', default: '0'})
  }

  readonly ValidationFlags = (flags: any) => {
    if (isNaN(parseInt(flags.project, 10))) throw new Error('Please enter the \'Project ID(-p, --project)\' by numeric.')
    if (isNaN(parseInt(flags.ticket, 10))) throw new Error('Please enter the \'Ticket ID(-t, --ticket)\' by numeric.')
    if (isNaN(parseInt(flags.limit, 10))) throw new Error('Please enter the \'Query Limit(-l, --limit)\' by numeric.')
    if (isNaN(parseInt(flags.offset, 10))) throw new Error('Please enter the \'Query ID(-o, --offset)\' by numeric.')
  }

  async run() {
    const {flags} = this.parse(Redmine)
    let projectId: number | null = null
    let statusId: number | null = null
    let categoryId: number | null = null
    let trackerId: number | null = null
    let queryId: number | null = null
    let limit: number | null = null
    let offset: number | null = null

    try {
      this.ValidationFlags(flags)
      limit = parseInt(flags.limit, 10)
      offset = parseInt(flags.offset, 10)
    } catch (e) {
      this.error(`${e.message}`)
      return
    }

    try {
      const rApi: RedmineApi = this.createRedmineApiObject()

      if (flags.ticket !== '0') {
        const ticketData: any = await rApi.get(rApi.getIssueURL(flags.ticket), rApi.createParams())
        this.log(ticketData.data.issue)
        return

      } else if (flags.project !== '0' && flags.query) {
        projectId = parseInt(flags.project, 10)
        queryId = await this.getQueryId(rApi, projectId)

      } else if (flags.project !== '0') {
        projectId = parseInt(flags.project, 10)
        statusId = await this.getIssueStatusId(rApi)
        categoryId = await this.getIssueCategoryId(rApi, projectId)
        trackerId = await this.getIssueTrackerId(rApi)

      } else if (flags.query) {
        projectId = await this.getProjectId(rApi)
        queryId = await this.getQueryId(rApi, projectId)

      } else {
        projectId = await this.getProjectId(rApi)
        statusId = await this.getIssueStatusId(rApi)
        categoryId = await this.getIssueCategoryId(rApi, projectId)
        trackerId = await this.getIssueTrackerId(rApi)
      }

      this.log(`getting tickets info in project ...`)
      const ticketsData: any = await rApi.get(rApi.getIssuesURL(), rApi.createParams(projectId, queryId, limit, offset, statusId, categoryId, trackerId))
      const ticketsList: Array<string> = ticketsData.data.issues.map((obj: any) => {
        return (flags.detail)
          ? `${chalk.default.bgBlue(` ${obj.id} `)} ${chalk.default.blue.bold(obj.subject)}

${chalk.default.blueBright('status:')}
${obj.status.name}

${chalk.default.blueBright('priority:')}
${obj.priority.name}

${chalk.default.blueBright('author:')}
${obj.author.name}

${chalk.default.blueBright('done ratio:')}
${obj.done_ratio}%

${chalk.default.blueBright('description:')}
${obj.description}
`
          : `${chalk.default.blue.bold(`${obj.id}`)}: ${obj.subject}`
      })
      ticketsList.forEach(ticket => {
        this.log(ticket)
      })
      this.log(`---`)
      this.log(`${chalk.default.greenBright(`project id`)}: ${projectId}`)
      this.log(`${chalk.default.greenBright(`total count`)}: ${ticketsData.data.total_count}`)
      this.log(`${chalk.default.greenBright(`offset`)}: ${ticketsData.data.offset}`)
      this.log(`${chalk.default.greenBright(`limit`)}: ${ticketsData.data.limit}`)

    } catch (e) {
      this.error(`${e.message}`)
    }
  }
}
