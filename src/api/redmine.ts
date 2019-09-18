/* tslint:disable:ordered-imports */
/* tslint:disable:member-ordering */
/* tslint:disable:no-redundant-jsdoc */
import {ApiBase} from './base'
import {ApiKeys} from '../settings/apikeys'

/**
 * Redmine API
 * - RedmineApi.getProjectsObject: Return Gitlab's Projects Object
 * - RedmineApi.getIssuesObject: Return Gitlab's Issues Object
 * - RedmineApi.getIssueObject: Return Gitlab's Issue Object
 * - RedmineApi.postIssueText: Post new Issue with IssueTitle text parameters
 */
export class RedmineApi extends ApiBase {
  private readonly projectsUrl: string = '/projects.json'
  private readonly queriesUrl: string = '/queries.json'
  private readonly issuesUrl: string = '/issues.json'
  private readonly issueStatusesUrl: string = '/issue_statuses.json'
  private readonly issueCategoriesUrl: string = '/issue_categories.json'
  private readonly issueTrackerUrl: string = '/trackers.json'
  private readonly defaultLimit: number = 20
  private readonly maxLimit: number = 100
  private readonly defaultPagination: number = 0
  private readonly keys: ApiKeys = new ApiKeys()

  private readonly getProjectsURL = (): string => `${this.keys.redmineUrl}${this.projectsUrl}`
  private readonly getQueriesURL = (): string => `${this.keys.redmineUrl}${this.queriesUrl}`
  private readonly getIssuesURL = (): string => `${this.keys.redmineUrl}${this.issuesUrl}`
  private readonly getIssueStatusesURL = (): string => `${this.keys.redmineUrl}${this.issueStatusesUrl}`
  private readonly getIssueCategoriesURL = (projectId: number): string => `${this.keys.redmineUrl}/projects/${String(projectId)}${this.issueCategoriesUrl}`
  private readonly getIssueTrackersURL = (): string => `${this.keys.redmineUrl}${this.issueTrackerUrl}`
  private readonly getIssueURL = (issueId: number) => `${this.keys.redmineUrl}/issues/${String(issueId)}.json`

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
   * @param {?number} pagination ページネーション位置 / 指定なし: defaultPagination
   * @param {?number} limit 取得上限 / 指定なし: defaultLimit
   * @return {object} ProjectsのObject
   */
  readonly getProjectsObject = async (pagination: number | null, limit?: number | null): Promise<object> => {
    const paginationParam = pagination || this.defaultPagination
    const limitParam = limit || this.defaultLimit
    const returns: object = await this.get(this.getProjectsURL(), this.createParams(null, null, limitParam, paginationParam))
    return returns
  }

  /**
   * getIssuesObject
   * - Issuesのオブジェクトを返します。一覧取得用
   * @param {?number} projectId プロジェクトID
   * @param {?number} queryId クエリ利用時のID
   * @param {?number} statusId ステータス利用時のID
   * @param {?number} categoryId カテゴリー利用時のID
   * @param {?number} trackerId トラッカー利用時のID
   * @param {?number} pagination ページネーション位置 / 指定なし: defaultPagination
   * @param {?number} limit 取得上限 / 指定なし: defaultLimit
   * @return {object} IssuesのObject
   */
  readonly getIssuesObject = async (projectId: number | null, queryId: number | null, statusId: number | null, categoryId: number | null, trackerId: number | null, pagination: number | null, limit?: number | null): Promise<object> => {
    const paginationParam = pagination || this.defaultPagination
    const limitParam = limit || this.defaultLimit
    const returns: object = await this.get(this.getIssuesURL(), this.createParams(projectId, queryId, limitParam, paginationParam, statusId, categoryId, trackerId))
    return returns
  }

  /**
   * getIssueObject
   * - Issueのオブジェクトを返します。個別取得用
   * @param {number} issueId IssueID
   * @return {object} IssueのObject
   */
  readonly getIssueObject = async (issueId: number): Promise<object> => {
    const returns: object = await this.get(this.getIssueURL(issueId), this.createParams)
    return returns
  }

  /**
   * getIssueStatusesObject
   * - IssueStatusesのオブジェクトを返します。一覧取得用
   * @param {?number} pagination ページネーション位置 / 指定なし: defaultPagination
   * @param {?number} limit 取得上限 / 指定なし: maxLimit(100)
   * @return {object} IssueStatusesのObject
   */
  readonly getIssueStatusesObject = async (pagination?: number | null, limit?: number | null): Promise<object> => {
    const paginationParam = pagination || this.defaultPagination
    const limitParam = limit || this.maxLimit
    const returns: object = await this.get(this.getIssueStatusesURL(), this.createParams(null, null, limitParam, paginationParam))
    return returns
  }

  /**
   * getIssueTrackersObject
   * - IssueTrackersのオブジェクトを返します。一覧取得用
   * @param {?number} pagination ページネーション位置 / 指定なし: defaultPagination
   * @param {?number} limit 取得上限 / 指定なし: maxLimit(100)
   * @return {object} IssueTrackersのObject
   */
  readonly getIssueTrackersObject = async (pagination?: number | null, limit?: number | null): Promise<object> => {
    const paginationParam = pagination || this.defaultPagination
    const limitParam = limit || this.maxLimit
    const returns: object = await this.get(this.getIssueTrackersURL(), this.createParams(null, null, limitParam, paginationParam))
    return returns
  }

  /**
   * getIssueCategoriesObject
   * - IssueCategoriesのオブジェクトを返します。一覧取得用
   * @param {?number} projectId プロジェクトID
   * @param {?number} pagination ページネーション位置 / 指定なし: defaultPagination
   * @param {?number} limit 取得上限 / 指定なし: maxLimit(100)
   * @return {object} IssueCategoriesのObject
   */
  readonly getIssueCategoriesObject = async (projectId: number, pagination?: number, limit?: number): Promise<object> => {
    const paginationParam = pagination || this.defaultPagination
    const limitParam = limit || this.maxLimit
    const returns: object = await this.get(this.getIssueCategoriesURL(projectId), this.createParams(null, null, limitParam, paginationParam))
    return returns
  }

  /**
   * getQueriesObject
   * - Queriesのオブジェクトを返します。一覧取得用
   * @param {?number} pagination ページネーション位置 / 指定なし: defaultPagination
   * @param {?number} limit 取得上限 / 指定なし: maxLimit(100)
   * @return {object} QueriesのObject
   */
  readonly getQueriesObject = async (pagination?: number, limit?: number): Promise<object> => {
    const paginationParam = pagination || this.defaultPagination
    const limitParam = limit || this.maxLimit
    const returns: object = await this.get(this.getQueriesURL(), this.createParams(null, null, limitParam, paginationParam))
    return returns
  }
}
