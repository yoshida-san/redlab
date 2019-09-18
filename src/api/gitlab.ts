/* tslint:disable:ordered-imports */
/* tslint:disable:member-ordering */
/* tslint:disable:no-redundant-jsdoc */
import {ApiBase} from './base'
import {ApiKeys} from '../settings/apikeys'

/**
 * Gitlab API
 * - GitlabApi.getProjectsObject: Return Gitlab's Projects Object
 * - GitlabApi.getIssuesObject: Return Gitlab's Issues Object
 * - GitlabApi.getIssueObject: Return Gitlab's Issue Object
 * - GitlabApi.postIssueText: Post new Issue with IssueTitle text parameters
 */
export class GitlabApi extends ApiBase {
  private readonly projectsUrl: string = '/projects'
  private readonly issuesUrl: string = '/issues'
  private readonly defaultLimit: number = 20
  private readonly defaultPagination: number = 1
  private readonly keys: ApiKeys = new ApiKeys()

  private readonly getProjectsURL = (pagination: number, limit: number): string => `${this.keys.gitlabUrl}${this.projectsUrl}?per_page=${String(limit)}&page=${String(pagination)}`
  private readonly getIssuesURL = (projectId: number, pagination: number, limit: number): string => `${this.keys.gitlabUrl}${this.projectsUrl}/${String(projectId)}${this.issuesUrl}?per_page=${String(limit)}&page=${String(pagination)}`
  private readonly getIssueURL = (projectId: number, issueId: number): string => `${this.keys.gitlabUrl}${this.projectsUrl}/${String(projectId)}${this.issuesUrl}/${String(issueId)}`
  private readonly postIssueURL = (projectId: number): string => `${this.keys.gitlabUrl}${this.projectsUrl}/${String(projectId)}${this.issuesUrl}`

  private readonly createParams = (): object => {
    return {
      private_token: this.keys.gitlabKey,
      owned: this.keys.gitlabOwned
    }
  }

  private readonly createIssueBody = (title: string): object => {
    return {
      private_token: this.keys.gitlabKey,
      title
    }
  }

  /**
   * getProjectsObject
   * - Projectsのオブジェクトを返します。一覧取得用
   * @param {?number} pagination ページネーション位置 / 指定なし: defaultPagination
   * @param {?number} limit 取得上限 / 指定なし: defaultLimit
   * @return {object} ProjectsのObject
   */
  readonly getProjectsObject = async (pagination?: number, limit?: number): Promise<object> => {
    const paginationParam = pagination || this.defaultPagination
    const limitParam = limit || this.defaultLimit
    const returns: object = await this.get(this.getProjectsURL(paginationParam, limitParam), this.createParams())
    return returns
  }

  /**
   * getIssuesObject
   * - Issuesのオブジェクトを返します。一覧取得用
   * @param {number} projectId プロジェクトID
   * @param {?number} pagination ページネーション位置 / 指定なし: defaultPagination
   * @param {?number} limit 取得上限 / 指定なし: defaultLimit
   * @return {object} IssuesのObject
   */
  readonly getIssuesObject = async (projectId: number, pagination?: number, limit?: number): Promise<object> => {
    const paginationParam = pagination || this.defaultPagination
    const limitParam = limit || this.defaultLimit
    const returns: object = await this.get(this.getIssuesURL(projectId, paginationParam, limitParam), this.createParams())
    return returns
  }

  /**
   * getIssueObject
   * - Issueのオブジェクトを返します。個別取得用
   * @param {number} projectId プロジェクトID
   * @param {number} issueId IssueID
   * @return {object} IssueのObject
   */
  readonly getIssueObject = async (projectId: number, issueId: number): Promise<object> => {
    const returns: object = await this.get(this.getIssueURL(projectId, issueId), this.createParams())
    return returns
  }

  /**
   * postIssueText
   * - IssueTitleをProjectIDに投稿します。
   * @param {number} projectId プロジェクトID
   * @param {string} issueTitle 投稿するIssueのタイトル
   * @return {object} Axiosの返答Object
   */
  readonly postIssueText = async (projectId: number, issueTitle: string): Promise<object> => {
    const returns: object = await this.post(this.postIssueURL(projectId), this.createIssueBody(issueTitle))
    return returns
  }
}
