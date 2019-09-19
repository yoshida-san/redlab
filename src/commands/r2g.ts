/* tslint:disable:quotemark */
import {Command, flags} from '@oclif/command'
require('array-foreach-async')

import {GitlabApi} from '../api/gitlab'
import {RedmineApi} from '../api/redmine'
import {Inquirer} from '../inquirer/inquirer'

export default class R2g extends Command {
  static description = 'compare issues'

  static examples = [
    `$ redlab r2g -g=5134`,
    `$ redlab r2g -qr=375`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    gproject: flags.string({char: 'g', description: '[GitLab] Project ID', default: '0'}),
    rproject: flags.string({char: 'r', description: '[Redmine] Project ID. Only can using with Query option(-q, --query).', default: '0'}),
    query: flags.boolean({char: 'q', description: '[Redmine] Use Query.', default: false})
  }

  readonly ValidationFlags = (flags: any) => {
    if (isNaN(parseInt(flags.gproject, 10))) throw new Error('Please enter the \'GitLab Project ID(-g, --groject)\' by numeric.')
    if (isNaN(parseInt(flags.rproject, 10))) throw new Error('Please enter the \'Redmine Project ID(-r, --rproject)\' by numeric.')
  }

  readonly getGitlabProjectId = async (gitlabApi: GitlabApi, inquirer: Inquirer) => {
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

  readonly getGitlabIssuesData = async (gitlabApi: GitlabApi, projectId: number) => {
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

  readonly selectNewIssue = async (inquirer: Inquirer, issues: Array<string>) => {
    try {
      const argsIssues = issues.map((obj: any) => {
        const title = ` ${obj.id}: ${obj.subject}`
        return {name: title, value: obj.id}
      })
      const selected: any = await inquirer.checkbox(argsIssues, 'Select target Issues if you want post:')
      return selected
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to show new Issues prompt.')
    }
  }

  readonly postNewIssue = async (gitlabApi: GitlabApi, projectId: number, issueTitle: string) => {
    try {
      const returns: any = gitlabApi.postIssueText(projectId, issueTitle)
      return returns
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error(`Failed to create New Issues.`)
    }
  }

  readonly getRedmineProjectId = async (redmineApi: RedmineApi, inquirer: Inquirer, limit?: number | null) => {
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

  readonly getRedmineIssuesData = async (redmineApi: RedmineApi, projectId: number | null, queryId: number | null, statusId: number | null, categoryId: number | null, trackerId: number | null, limit?: number | null, offset?: number | null) => {
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
    const {flags} = this.parse(R2g)
    let gitlabProjectId = 0
    let redmineProjectId: number | null = null
    let statusId: number | null = null
    let categoryId: number | null = null
    let trackerId: number | null = null
    let queryId: number | null = null
    //let limit: number | null = null
    //let offset: number | null = null

    try {
      this.ValidationFlags(flags)
    } catch (e) {
      this.error(`${e.message}`)
      return
    }

    try {
      const gitlabApi: GitlabApi = new GitlabApi()
      const redmineApi: RedmineApi = new RedmineApi()
      const inquirer: Inquirer = new Inquirer()

      gitlabProjectId = flags.gproject !== '0'
                      ? parseInt(flags.gproject, 10)
                      : await this.getGitlabProjectId(gitlabApi, inquirer)

      redmineProjectId = flags.rproject !== '0'
                       ? parseInt(flags.rproject, 10)
                       : await this.getRedmineProjectId(redmineApi, inquirer)

      if (flags.query) {
        queryId = await this.getQueryId(redmineApi, inquirer, redmineProjectId)
      } else {
        statusId = await this.getIssueStatusId(redmineApi, inquirer)
        categoryId = await this.getIssueCategoryId(redmineApi, inquirer, redmineProjectId)
        trackerId = await this.getIssueTrackerId(redmineApi, inquirer)
      }

      this.log('Getting the diff...')
      const gitlabIssuesData: any = await this.getGitlabIssuesData(gitlabApi, gitlabProjectId)
      const redmineTicketsData: any = await this.getRedmineIssuesData(redmineApi, redmineProjectId, queryId, statusId, categoryId, trackerId)

      const notExistsTickets: Array<string> = redmineTicketsData.map((redmine: any) => {
        const issue = gitlabIssuesData.find((gitlab: any) => gitlab.title.indexOf(`r${redmine.id}_`) === 0)
        return (issue === undefined) ? redmine : false
      }).filter((redmine: any) => redmine !== false)

      const selected = await this.selectNewIssue(inquirer, notExistsTickets)
      await selected.id.forEachAsync(async (selected: any) => {
        const issueData: any = notExistsTickets.find((data: any) => data.id === selected)
        const issueMessage = `r${issueData.id}_${issueData.subject}`
        await this.postNewIssue(gitlabApi, gitlabProjectId, issueMessage)
      })

      this.log(`All done.`)

    } catch (e) {
      this.error(`${e.message}`)
    }
  }
}
