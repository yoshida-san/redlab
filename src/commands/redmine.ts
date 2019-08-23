/* tslint:disable:quotemark */
import {flags} from '@oclif/command'
import * as chalk from 'chalk'

import {Base, RedmineApi} from '../base'

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
        const ticketData = await rApi.get(rApi.getIssueURL(flags.ticket), rApi.createParams())
        this.log(ticketData.data.issue)
        return

      } else if (flags.project !== '0' && flags.query) {
        projectId = parseInt(flags.project, 10)
        queryId = await this.getQueryId(rApi, projectId)

      } else if (flags.project !== '0') {
        projectId = parseInt(flags.project, 10)
        statusId = await this.getIssueStatusId(rApi)
        categoryId = await this.getIssueCategoryId(rApi, projectId)
        trackerId = await this.getIssueTrackerrId(rApi)

      } else if (flags.query) {
        projectId = await this.getProjectId(rApi)
        queryId = await this.getQueryId(rApi, projectId)

      } else {
        projectId = await this.getProjectId(rApi)
        statusId = await this.getIssueStatusId(rApi)
        categoryId = await this.getIssueCategoryId(rApi, projectId)
        trackerId = await this.getIssueTrackerrId(rApi)

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

  readonly ValidationFlags = (flags: any) => {
    if (isNaN(parseInt(flags.project, 10))) {
      throw new Error('project id(-p, --project) is not a number')
    }
    if (isNaN(parseInt(flags.ticket, 10))) {
      throw new Error('ticket id(-t, --ticket) is not a number')
    }
    if (isNaN(parseInt(flags.limit, 10))) {
      throw new Error('query id(-l, --limit) is not a number')
    }
    if (isNaN(parseInt(flags.offset, 10))) {
      throw new Error('query id(-o, --offset) is not a number')
    }
  }

  readonly getProjectId = async (rApi: RedmineApi) => {
    try {
      const projects = await rApi.get(rApi.getProjectsURL(), rApi.createParams(null, null, 100))
      const argsProjects = projects.data.projects.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      const projectsList: object = {
        name: 'id',
        message: 'choose project',
        type: 'list',
        choices: argsProjects
      }
      const choosed: any = await this.inquiry(projectsList)
      return parseInt(choosed.id, 10)
    } catch (e) {
      throw new Error('Fail get projects')
    }
  }

  readonly getIssueStatusId = async (rApi: RedmineApi) => {
    try {
      const issueStatuses = await rApi.get(rApi.getIssueStatusesURL(), rApi.createParams(null, null, 100))
      const argsIssueStatuses: Array<object> = issueStatuses.data.issue_statuses.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueStatuses.unshift({id: null, name: '指定なし'})
      const issuesStatusesList: object = {
        name: 'id',
        message: 'choose issues status',
        type: 'list',
        choices: argsIssueStatuses
      }
      const choosed: any = await this.inquiry(issuesStatusesList)
      return parseInt(choosed.id, 10)
    } catch (e) {
      this.warn('Fail get issue statuses')
      return null
    }
  }

  readonly getIssueTrackerrId = async (rApi: RedmineApi) => {
    try {
      const issueTrackers = await rApi.get(rApi.getIssueTrackersURL(), rApi.createParams(null, null, 100))
      if (issueTrackers.data.trackers.length === 0) {
        this.log('this project has no tracker')
        return null
      }
      const argsIssueTrackers: Array<object> = issueTrackers.data.trackers.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueTrackers.unshift({id: null, name: '指定なし'})
      const issuesTrackersList: object = {
        name: 'id',
        message: 'choose issues trakcer',
        type: 'list',
        choices: argsIssueTrackers
      }
      const choosed: any = await this.inquiry(issuesTrackersList)
      return parseInt(choosed.id, 10)
    } catch (e) {
      this.warn('Fail get issue trakcer')
      return null
    }
  }

  readonly getIssueCategoryId = async (rApi: RedmineApi, projectId: number) => {
    try {
      const issueCategories = await rApi.get(rApi.getIssueCategoriesURL(String(projectId)), rApi.createParams(null, null, 100))
      if (issueCategories.data.issue_categories.length === 0) {
        this.log('this project has no categories')
        return null
      }
      const argsIssueCategories: Array<object> = issueCategories.data.issue_categories.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueCategories.unshift({id: null, name: '指定なし'})
      const issuesCategoriesList: object = {
        name: 'id',
        message: 'choose issues status',
        type: 'list',
        choices: argsIssueCategories
      }
      const choosed: any = await this.inquiry(issuesCategoriesList)
      return parseInt(choosed.id, 10)
    } catch (e) {
      this.warn('Fail get issue category')
      return null
    }
  }

  readonly getQueryId = async (rApi: RedmineApi, pid: number) => {
    const queries = await rApi.get(rApi.getQueriesURL(), rApi.createParams(null, null, 100))
    const argsQueries = queries.data.queries.map((obj: any) => {
      if (pid === obj.project_id) {
        return {name: obj.name, value: obj.id}
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
    return parseInt(choosed.id, 10)
  }
}
