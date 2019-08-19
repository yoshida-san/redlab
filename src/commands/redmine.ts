import { flags } from '@oclif/command'
import { Base, RedmineApi } from './base';
import * as chalk from 'chalk'

export default class Redmine extends Base {
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

  private getProjectId = async (rApi: RedmineApi) => {
    try {
      const projects = await rApi.get(rApi.getProjectsURL(), rApi.createParams(null, null, 100))
      const argsProjects = projects.data.projects.map((obj: any) => {
        return { name: obj.name, value: obj.id }
      })
      const projectsList: object = {
        name: 'id',
        message: 'choose project',
        type: 'list',
        choices: argsProjects
      }
      const choosed: any = await this.inquiry(projectsList)
      return parseInt(choosed.id)
    } catch (e) {
      throw new Error('Fail get projects')
    }
  }

  private getQueryId = async (rApi: RedmineApi, pid: number) => {
    const queries = await rApi.get(rApi.getQueriesURL(), rApi.createParams(null, null, 100))
    const argsQueries = queries.data.queries.map((obj: any) => {
      if (pid === obj.project_id) {
        return { name: obj.name, value: obj.id }
      } else {
        return false
      }
    }).filter(Boolean)
    if (argsQueries.length === 0) {
      this.warn(`not exists queries in project`)
      this.log(`show all tickets in project`)
      return null
    }
    const queriesList: object = {
      name: 'id',
      message: 'choose query',
      type: 'list',
      choices: argsQueries
    }
    const choosed: any = await this.inquiry(queriesList)
    return parseInt(choosed.id)
  }

  private ValidationFlags = (flags: any) => {
    if (isNaN(parseInt(flags.project))) {
      throw new Error('project id(-p, --project) is not a number');
    }
    if (isNaN(parseInt(flags.ticket))) {
      throw new Error('ticket id(-t, --ticket) is not a number');
    }
    if (isNaN(parseInt(flags.limit))) {
      throw new Error('query id(-l, --limit) is not a number');
    }
    if (isNaN(parseInt(flags.offset))) {
      throw new Error('query id(-o, --offset) is not a number');
    }
  }

  async run() {
    const { flags } = this.parse(Redmine)
    let projectId: number | null = null
    let queryId: number | null = null
    let limit: number | null = null
    let offset: number | null = null

    try {
      this.ValidationFlags(flags)
      limit = parseInt(flags.limit)
      offset = parseInt(flags.offset)
    } catch (e) {
      this.error(`${e.message}`)
      return
    }

    try {
      const rApi: RedmineApi = this.createRedmineApiObject()

      if (flags.ticket !== '0') {
        const ticketData = await rApi.get(rApi.getIssueURL(flags.ticket), rApi.createParams())
        this.log(ticketData.data.issue)
        return

      } else if (flags.project !== '0' && flags.query) {
        projectId = parseInt(flags.project)
        queryId = await this.getQueryId(rApi, projectId)

      } else if (flags.project !== '0') {
        projectId = parseInt(flags.project)

      } else if (flags.query) {
        projectId = await this.getProjectId(rApi)
        queryId = await this.getQueryId(rApi, projectId)

      } else {
        projectId = await this.getProjectId(rApi)

      }

      this.log(`getting tickets info in project ...`)
      const ticketsData: any = await rApi.get(rApi.getIssuesURL(), rApi.createParams(projectId, queryId, limit, offset))
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
