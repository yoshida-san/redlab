/* tslint:disable:quotemark */
/* tslint:disable:no-redundant-jsdoc */
import {ApiConnectBase, Base} from './base'

class GitlabApi extends ApiConnectBase {
  readonly apiBseUrl: string = ''
  readonly key: string = ''
  readonly owned: boolean = true
  readonly projectsUrl: string = '/projects'
  readonly issuesUrl: string = '/issues'

  constructor(url: string, key: string, owned: boolean) {
    super()
    this.apiBseUrl = url
    this.key = key
    this.owned = owned
  }

  public getProjectsURL = (): string => `${this.apiBseUrl}${this.projectsUrl}`
  public getIssuesURL = (projectId: number): string => `${this.apiBseUrl}/${this.projectsUrl}/${String(projectId)}${this.issuesUrl}`
  public getIssueURL = (projectId: number, issueId: number): string => `${this.apiBseUrl}/${this.projectsUrl}/${String(projectId)}${this.issuesUrl}/${String(issueId)}`

  public createParams = (): object => {
    return {
      private_token: this.key,
      owned: this.owned
    }
  }
}

class GitlabBase extends Base {
  /**
   * プロジェクトリストを取得・表示・選択し、プロジェクトIDを返す
   *
   * @param gApi GitlabApi
   * @returns projectId
   */
  readonly getProjectId = async (gApi: GitlabApi) => {
    try {
      const projects = await gApi.get(gApi.getProjectsURL(), gApi.createParams())
      const argsProjects = projects.data.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      const projectsList: object = {
        name: 'id',
        message: 'Select Project:',
        type: 'list',
        choices: argsProjects
      }
      const selected: any = await this.inquiry(projectsList)
      return parseInt(selected.id, 10)
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to get List of Projects.')
    }
  }

  protected createGitlabApiObject = (): GitlabApi => {
    this.readSettingsJson()
    if (this.settingsData === null) {
      throw new Error('Failed to read \'settings.json\'. Please try to following command:\nredlab settings')
    }
    return new GitlabApi(this.settingsData.g_url, this.settingsData.g_key, this.settingsData.g_owned)
  }
}

export {GitlabApi, GitlabBase}
