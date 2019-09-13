import {ApiConnectBase, Base} from './base'
import {Inquirer} from './inquirer/inquirer'


/**
 * TSDOC
 */
class RedmineApi extends ApiConnectBase {
  readonly apiBseUrl: string = ''
  readonly key: string = ''
  readonly projectsUrl: string = '/projects.json'
  readonly queriesUrl: string = '/queries.json'
  readonly issuesUrl: string = '/issues.json'
  readonly issueStatusesUrl: string = '/issue_statuses.json'
  readonly issueCategoriesUrl: string = '/issue_categories.json'
  readonly issueTrackerUrl: string = '/trackers.json'

  constructor(url: string, key: string) {
    super()
    this.apiBseUrl = url
    this.key = key
  }

  public getProjectsURL = (): string => `${this.apiBseUrl}${this.projectsUrl}`
  public getQueriesURL = (): string => `${this.apiBseUrl}${this.queriesUrl}`
  public getIssuesURL = (): string => `${this.apiBseUrl}${this.issuesUrl}`
  public getIssueStatusesURL = (): string => `${this.apiBseUrl}${this.issueStatusesUrl}`
  public getIssueCategoriesURL = (projectId: string): string => `${this.apiBseUrl}/projects/${projectId}${this.issueCategoriesUrl}`
  public getIssueTrackersURL = (): string => `${this.apiBseUrl}${this.issueTrackerUrl}`
  public getIssueURL = (ticketId: string) => `${this.apiBseUrl}/issues/${ticketId}.json`

  public createParams = (projectId?: number | null, queryId?: number | null, limit?: number | null, offset?: number | null, status?: number | null, category?: number | null, tracker?: number | null): object => {
    return {
      key: this.key,
      project_id: projectId || null,
      query_id: queryId || null,
      limit: limit || null,
      offset: offset || null,
      status_id: status || null,
      category_id: category || null,
      tracker_id: tracker || null
    }
  }
}

/**
 * TSDOC
 */
class RedmineBase extends Base {
  /**
   * TSDOC
   */

  const inq: Inquirer = new Inquirer()
  readonly getProjectId = async (rApi: RedmineApi, limit?: number | null) => {
    try {
      let returnId = 0
      let status = true
      let pagination = 0
      while (status) {
        // API
        const projects = await rApi.get(rApi.getProjectsURL(), rApi.createParams(null, null, limit, pagination))
        const argsProjects = projects.data.projects.map((obj: any) => {
          return {name: obj.name, value: obj.id}
        })
        if ((pagination + parseInt(projects.data.limit, 10)) < parseInt(projects.data.total_count, 10)) argsProjects.push({name: '次のIssuesを取得', value: 'next'})
        if ((pagination - parseInt(projects.data.limit, 10)) >= 0) argsProjects.push({name: '前のIssuesを取得', value: 'prev'})
        const projectsList: object = {
          name: 'id',
          message: 'Select Redmine\'s Project:',
          type: 'list',
          choices: argsProjects
        }
        const selected: any = await this.inq.list(argsProjects, 'Select Redmine\'s Project:')
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

  /**
   * TSDOC
   */
  readonly getIssueStatusId = async (rApi: RedmineApi) => {
    try {
      const issueStatuses = await rApi.get(rApi.getIssueStatusesURL(), rApi.createParams(null, null, 100))
      const argsIssueStatuses: Array<object> = issueStatuses.data.issue_statuses.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueStatuses.unshift({id: null, name: '指定なし'})
      const issuesStatusesList: object = {
        name: 'id',
        message: 'Select Redmine Issue\'s Status:',
        type: 'list',
        choices: argsIssueStatuses
      }
      const selected: any = await this.inquirer(issuesStatusesList)
      return parseInt(selected.id, 10)
      // tslint:disable-next-line:no-unused
    } catch (e) {
      this.warn('Failed to get Issue Statuses.')
      return null
    }
  }

  /**
   * TSDOC
   */
  readonly getIssueTrackerId = async (rApi: RedmineApi) => {
    try {
      const issueTrackers = await rApi.get(rApi.getIssueTrackersURL(), rApi.createParams(null, null, 100))
      if (issueTrackers.data.trackers.length === 0) {
        this.log('This project haven\'t trackers.')
        return null
      }
      const argsIssueTrackers: Array<object> = issueTrackers.data.trackers.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueTrackers.unshift({id: null, name: '指定なし'})
      const issuesTrackersList: object = {
        name: 'id',
        message: 'Select Redmine Issue\'s Trakcer:',
        type: 'list',
        choices: argsIssueTrackers
      }
      const selected: any = await this.inquirer(issuesTrackersList)
      return parseInt(selected.id, 10)
      // tslint:disable-next-line:no-unused
    } catch (e) {
      this.warn('Failed to get Issue Trakcers.')
      return null
    }
  }

  /**
   * TSDOC
   */
  readonly getIssueCategoryId = async (rApi: RedmineApi, projectId: number) => {
    try {
      const issueCategories = await rApi.get(rApi.getIssueCategoriesURL(String(projectId)), rApi.createParams(null, null, 100))
      if (issueCategories.data.issue_categories.length === 0) {
        this.log('This project haven\'t categories.')
        return null
      }
      const argsIssueCategories: Array<object> = issueCategories.data.issue_categories.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      argsIssueCategories.unshift({id: null, name: '指定なし'})
      const issuesCategoriesList: object = {
        name: 'id',
        message: 'Select Redmine Issue\'s Category:',
        type: 'list',
        choices: argsIssueCategories
      }
      const selected: any = await this.inquirer(issuesCategoriesList)
      return parseInt(selected.id, 10)
      // tslint:disable-next-line:no-unused
    } catch (e) {
      this.warn('Failed to get Issue Categorys.')
      return null
    }
  }

  /**
   * TSDOC
   */
  readonly getIssuesData = async (rApi: RedmineApi, projectId: number | null, queryId: number | null, statusId: number | null, categoryId: number | null, trackerId: number | null, limit?: number | null, offset?: number | null) => {
    try {
      let returnsObject: Array<any> = []
      let status = true
      let pagination = offset || 0
      while (status) {
        const ticketObject: any = await rApi.get(rApi.getIssuesURL(), rApi.createParams(projectId, queryId, limit, pagination, statusId, categoryId, trackerId))
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

  /**
   * TSDOC
   */
  readonly getQueryId = async (rApi: RedmineApi, projectId: number) => {
    const queries = await rApi.get(rApi.getQueriesURL(), rApi.createParams(null, null, 100))
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
    const queriesList: object = {
      name: 'id',
      message: 'Select Redmine\'s Query:',
      type: 'list',
      choices: argsQueries
    }
    const selected: any = await this.inquirer(queriesList)
    return parseInt(selected.id, 10)
  }

  /**
   * TSDOC
   */
  public createRedmineApiObject = (): RedmineApi => {
    this.readSettingsJson()
    if (this.settingsData === null) {
      throw new Error('Failed to read \'settings.json\'. Please try to the following command:\n      $ redlab settings')
    }
    return new RedmineApi(this.settingsData.r_url, this.settingsData.r_key)
  }
}

class RedmineR2GBase extends RedmineBase {
  constructor() {
    super()
  }
}

export {RedmineApi, RedmineBase, RedmineR2GBase}
