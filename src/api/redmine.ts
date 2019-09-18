/* tslint:disable:ordered-imports */
/* tslint:disable:member-ordering */
/* tslint:disable:no-redundant-jsdoc */
import {ApiBase} from './base'
import {ApiKeys} from '../settings/apikeys'

export class RedmineApi extends ApiBase {
  private readonly projectsUrl: string = '/projects.json'
  private readonly queriesUrl: string = '/queries.json'
  private readonly issuesUrl: string = '/issues.json'
  private readonly issueStatusesUrl: string = '/issue_statuses.json'
  private readonly issueCategoriesUrl: string = '/issue_categories.json'
  private readonly issueTrackerUrl: string = '/trackers.json'
  private readonly defaultLimit: number = 20
  private readonly keys: ApiKeys = new ApiKeys()

  private readonly getProjectsURL = (): string => `${this.keys.redmineUrl}${this.projectsUrl}`
  private readonly getQueriesURL = (): string => `${this.keys.redmineUrl}${this.queriesUrl}`
  private readonly getIssuesURL = (): string => `${this.keys.redmineUrl}${this.issuesUrl}`
  private readonly getIssueStatusesURL = (): string => `${this.keys.redmineUrl}${this.issueStatusesUrl}`
  private readonly getIssueCategoriesURL = (projectId: string): string => `${this.keys.redmineUrl}/projects/${projectId}${this.issueCategoriesUrl}`
  private readonly getIssueTrackersURL = (): string => `${this.keys.redmineUrl}${this.issueTrackerUrl}`
  private readonly getIssueURL = (ticketId: string) => `${this.keys.redmineUrl}/issues/${ticketId}.json`

  private readonly createParams = (projectId?: number | null, queryId?: number | null, limit?: number | null, offset?: number | null, status?: number | null, category?: number | null, tracker?: number | null): object => {
    return {
      key: this.keys.redmineKey,
      project_id: projectId || null,
      query_id: queryId || null,
      limit: limit || null,
      offset: offset || null,
      status_id: status || null,
      category_id: category || null,
      tracker_id: tracker || null
    }
  }

  /**
   * getProjectsObject
   * - Projectsのオブジェクトを返します。一覧取得用
   * @param pagination ページネーション位置
   * @param limit 取得上限 / 指定なし: defaultLimit
   * @return ProjectsのObject
   */
  readonly getProjectsObject = async (pagination: number, limit?: number): Promise<object> => {
    const limitParam = limit || this.defaultLimit
    const returns: object = await this.get(this.getProjectsURL(), this.createParams(null, null, limitParam, pagination))
    return returns
  }
}
