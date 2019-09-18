/* tslint:disable:quotemark */
import {Command, flags} from '@oclif/command'
import * as chalk from 'chalk'

import {RedmineApi} from '../api/redmine'
import {Inquirer} from '../inquirer/inquirer'

export default class Redmine extends Command {
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

  readonly getProjectId = async (redmineApi: RedmineApi, inquirer: Inquirer, limit?: number | null) => {
    try {
      let returnId = 0
      let status = true
      let pagination = 0
      while (status) {
        const projects: any = await redmineApi.getProjectsObject(pagination, limit)
        const argsProjects = projects.data.projects.map((obj: any) => {
          return {name: obj.name, value: obj.id}
        })
        if ((pagination + parseInt(projects.data.limit, 10)) < parseInt(projects.data.total_count, 10)) argsProjects.push({name: '次のIssuesを取得', value: 'next'})
        if ((pagination - parseInt(projects.data.limit, 10)) >= 0) argsProjects.push({name: '前のIssuesを取得', value: 'prev'})
        const selected: any = await inquirer.list(argsProjects, 'Select Redmine\'s Project:')
        if (selected.id === 'next') {
          pagination = pagination + parseInt(projects.data.limit, 10)
        } else if (selected.id === 'prev') {
          pagination = pagination - parseInt(projects.data.limit, 10)
        } else {
          returnId = parseInt(selected.id, 10)
          status = false
        }
      }
      return returnId
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to get Project IDs.')
    }
  }

  readonly getIssuesData = async (redmineApi: RedmineApi, projectId: number | null, queryId: number | null, statusId: number | null, categoryId: number | null, trackerId: number | null, limit?: number | null, offset?: number | null) => {
    try {
      let returnsObject: Array<any> = []
      let status = true
      let pagination = offset || 0
      while (status) {
        const ticketObject: any = await redmineApi.getIssuesObject(projectId, queryId, statusId, categoryId, trackerId, pagination, limit)
        returnsObject = [...returnsObject, ...ticketObject.data.issues]
        pagination = pagination + parseInt(ticketObject.data.limit, 10)
        if (pagination >= parseInt(ticketObject.data.total_count, 10)) status = false
      }
      return returnsObject
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error(e)
    }
  }

  readonly getIssueStatusId = async (redmineApi: RedmineApi, inquirer: Inquirer) => {
    try {
      const issueStatuses: any = await redmineApi.getIssueStatusesObject()
      const argsIssueStatuses: Array<object> = issueStatuses.data.issue_statuses.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueStatuses.unshift({id: null, name: '指定なし'})
      const selected: any = await inquirer.list(argsIssueStatuses, 'Select Redmine Issue\'s Status:')
      return parseInt(selected.id, 10)
      // tslint:disable-next-line:no-unused
    } catch (e) {
      this.warn('Failed to get Issue Statuses.')
      return null
    }
  }

  readonly getIssueTrackerId = async (redmineApi: RedmineApi, inquirer: Inquirer) => {
    try {
      const issueTrackers: any = await redmineApi.getIssueTrackersObject()
      if (issueTrackers.data.trackers.length === 0) {
        this.log('This project haven\'t trackers.')
        return null
      }
      const argsIssueTrackers: Array<object> = issueTrackers.data.trackers.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueTrackers.unshift({id: null, name: '指定なし'})
      const selected: any = await inquirer.list(argsIssueTrackers, 'Select Redmine Issue\'s Trakcer:')
      return parseInt(selected.id, 10)
      // tslint:disable-next-line:no-unused
    } catch (e) {
      this.warn('Failed to get Issue Trakcers.')
      return null
    }
  }

  readonly getIssueCategoryId = async (redmineApi: RedmineApi, inquirer: Inquirer, projectId: number) => {
    try {
      const issueCategories: any = await redmineApi.getIssueCategoriesObject(projectId)
      if (issueCategories.data.issue_categories.length === 0) {
        this.log('This project haven\'t categories.')
        return null
      }
      const argsIssueCategories: Array<object> = issueCategories.data.issue_categories.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueCategories.unshift({id: null, name: '指定なし'})
      const selected: any = await inquirer.list(argsIssueCategories, 'Select Redmine Issue\'s Category:')
      return parseInt(selected.id, 10)
      // tslint:disable-next-line:no-unused
    } catch (e) {
      this.warn('Failed to get Issue Categorys.')
      return null
    }
  }

  readonly getQueryId = async (redmineApi: RedmineApi, inquirer: Inquirer, projectId: number) => {
    const queries: any = await redmineApi.getQueriesObject()
    const argsQueries = queries.data.queries.map((obj: any) => {
      if (projectId === obj.project_id) {
        return {name: obj.name, value: obj.id}
      } else {
        return false
      }
    }).filter(Boolean)
    if (argsQueries.length === 0) {
      this.warn('not exists queries in project')
      this.log('show all tickets in project')
      return null
    }
    const selected: any = await inquirer.list(argsQueries, 'Select Redmine\'s Query:')
    return parseInt(selected.id, 10)
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
      const redmineApi: RedmineApi = new RedmineApi()
      const inquirer: Inquirer = new Inquirer()

      if (flags.ticket !== '0') {
        const ticketData: any = await redmineApi.getIssueObject(parseInt(flags.ticket, 10))
        this.log(ticketData.data.issue)
        return

      } else if (flags.project !== '0' && flags.query) {
        projectId = parseInt(flags.project, 10)
        queryId = await this.getQueryId(redmineApi, inquirer, projectId)

      } else if (flags.project !== '0') {
        projectId = parseInt(flags.project, 10)
        statusId = await this.getIssueStatusId(redmineApi, inquirer)
        categoryId = await this.getIssueCategoryId(redmineApi, inquirer, projectId)
        trackerId = await this.getIssueTrackerId(redmineApi, inquirer)

      } else if (flags.query) {
        projectId = await this.getProjectId(redmineApi, inquirer)
        queryId = await this.getQueryId(redmineApi, inquirer, projectId)

      } else {
        projectId = await this.getProjectId(redmineApi, inquirer)
        statusId = await this.getIssueStatusId(redmineApi, inquirer)
        categoryId = await this.getIssueCategoryId(redmineApi, inquirer, projectId)
        trackerId = await this.getIssueTrackerId(redmineApi, inquirer)
      }

      this.log(`getting tickets info in project ...`)
      const ticketsData: any = await this.getIssuesData(redmineApi, projectId, queryId, statusId, categoryId, trackerId)
      const ticketsList: Array<string> = ticketsData.map((obj: any) => {
        return (flags.detail)
          ? `${chalk.default.bgBlue(` ${obj.id} `)} ${chalk.default.blue.bold(obj.subject)}

${chalk.default.blueBright('Status:')}
${obj.status.name}

${chalk.default.blueBright('Priority:')}
${obj.priority.name}

${chalk.default.blueBright('Author:')}
${obj.author.name}

${chalk.default.blueBright('Done ratio:')}
${obj.done_ratio}%

${chalk.default.blueBright('Description:')}
${obj.description}
`
          : `${chalk.default.blue.bold(`${obj.id}`)}: ${obj.subject}`
      })
      ticketsList.forEach(ticket => {
        this.log(ticket)
      })
      this.log(`---`)
      this.log(`${chalk.default.greenBright(`Project ID`)}: ${projectId}`)
      // 仕様上表示できなくなりますが必要ですか？
      //this.log(`${chalk.default.greenBright(`total count`)}: ${ticketsData.data.total_count}`)
      //this.log(`${chalk.default.greenBright(`offset`)}: ${ticketsData.data.offset}`)
      //this.log(`${chalk.default.greenBright(`limit`)}: ${ticketsData.data.limit}`)

    } catch (e) {
      this.error(`${e.message}`)
    }
  }
}
