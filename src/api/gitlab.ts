/* tslint:disable:ordered-imports */
/* tslint:disable:member-ordering */
/* tslint:disable:no-redundant-jsdoc */
import {ApiBase} from './base'
import {ApiKeys} from '../settings/apikeys'

export class GitlabApi extends ApiBase {
  private readonly projectsUrl: string = '/projects'
  private readonly issuesUrl: string = '/issues'
  private readonly defaultLimit: number = 20
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
   * @param pagination ページネーション位置
   * @param limit 取得上限 / 指定なし: defaultLimit
   * @return ProjectsのObject
   */
  readonly getProjectsObject = async (pagination: number, limit?: number): Promise<object> => {
    const limitParam = limit || this.defaultLimit
    const returns: object = await this.get(this.getProjectsURL(pagination, limitParam), this.createParams())
    return returns
  }

  /**
   * getIssuesObject
   * - Issuesのオブジェクトを返します。一覧取得用
   * @param projectId プロジェクトID
   * @param pagination ページネーション位置
   * @param limit 取得上限 / 指定なし: defaultLimit
   * @return IssuesのObject
   */
  readonly getIssuesObject = async (projectId: number, pagination: number, limit?: number): Promise<object> => {
    const limitParam = limit || this.defaultLimit
    const returns: object = await this.get(this.getIssuesURL(projectId, pagination, limitParam), this.createParams())
    return returns
  }

  /**
   * getIssueObject
   * - Issueのオブジェクトを返します。個別取得用
   * @param projectId プロジェクトID
   * @param issueId IssueID
   * @return IssueのObject
   */
  readonly getIssueObject = async (projectId: number, issueId: number): Promise<object> => {
    const returns: object = await this.get(this.getIssueURL(projectId, issueId), this.createParams())
    return returns
  }

  /**
   * postIssueText
   * - IssueTitleをProjectIDに投稿します。
   * @param projectId プロジェクトID
   * @param issueTitle 投稿するIssueのタイトル
   * @return Axiosの返答Object
   */
  readonly postIssueText = async (projectId: number, issueTitle: string): Promise<object> => {
    const returns: object = await this.post(this.postIssueURL(projectId), this.createIssueBody(issueTitle))
    return returns
  }
}
