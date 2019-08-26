import {ApiConnectBase, Base} from './base'

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

class RedmineBase extends Base {
  protected createRedmineApiObject = (): RedmineApi => {
    this.readSettingsJson()
    if (this.settingsData === null) {
      throw new Error('Failed to read \'settings.json\'. Please try to following command:\nredlab settings')
    }
    return new RedmineApi(this.settingsData.r_url, this.settingsData.r_key)
  }
}

export {RedmineApi, RedmineBase}
