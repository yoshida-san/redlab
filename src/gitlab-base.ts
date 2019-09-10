/* tslint:disable:quotemark */
/* tslint:disable:no-redundant-jsdoc */
import {ApiConnectBase, Base} from './base'

/**
 * TSDOC
 */
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

  public getProjectsURL = (pagination: number): string => `${this.apiBseUrl}${this.projectsUrl}?page=${String(pagination)}`
  public getIssuesURL = (projectId: number, pagination: number): string => `${this.apiBseUrl}${this.projectsUrl}/${String(projectId)}${this.issuesUrl}?page=${String(pagination)}&per_page=5`
  public getIssueURL = (projectId: number, issueId: number): string => `${this.apiBseUrl}${this.projectsUrl}/${String(projectId)}${this.issuesUrl}/${String(issueId)}`
  public postIssueURL = (projectId: number): string => `${this.apiBseUrl}${this.projectsUrl}/${String(projectId)}${this.issuesUrl}`

  public createParams = (): object => {
    return {
      private_token: this.key,
      owned: this.owned
    }
  }

  public createIssueBody = (title: string): object => {
    return {
      private_token: this.key,
      title
    }
  }
}

/**
 * TSDOC
 */
class GitlabBase extends Base {
  /**
   * プロジェクトリストを取得・表示・選択し、プロジェクトIDを返す
   *
   * @param gApi GitlabApiのオブジェクト
   * @returns projectIdが返る
   */
  readonly getProjectId = async (gApi: GitlabApi) => {
    try {
      const projects = await gApi.get(gApi.getProjectsURL(1), gApi.createParams())
      const argsProjects = projects.data.map((obj: any) => {
        return {name: obj.name, value: obj.id}
      })
      //projects.headers['x-page'] === projects.headers['x-total-pages']
      //throw new Error(`${projects.headers['cache-control']}`)
      //throw new Error(`${JSON.stringify(projects.headers)}`)
      if (projects.headers['x-page'] !== projects.headers['x-total-pages']) argsProjects.push({name: '次のIssuesを取得', value: 501})
      if (projects.headers['x-page'] > 1) argsProjects.push({name: '前のIssuesを取得', value: 502})
      const projectsList: object = {
        name: 'id',
        message: 'Select Gitlab\'s Project:',
        type: 'list',
        choices: argsProjects
      }
      const selected: any = await this.inquirer(projectsList)
      return parseInt(selected.id, 10)
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to Get List for Projects.')
    }
  }

  /**
   * TSDOC
   */
  readonly getIssuesData = async (gApi: GitlabApi, projectId: number) => {
    try {
      let returnsJson = ''
      let returnsObject: object = {}
      let status = true
      let counter = 0
      while (status) {
        counter++
        const issueObject: any = await gApi.get(gApi.getIssuesURL(projectId, counter) , gApi.createParams())
        // returnsJson = `${returnsJson},${JSON.stringify(issueObject.data).slice(1).slice(0, -1)}`
        returnsObject = Object.assign(returnsObject, issueObject.data)
        // returnsObject.assign(returnsObject, issueObject.data)
        if (issueObject.headers['x-page'] === issueObject.headers['x-total-pages']) status = false
      }
      //return JSON.parse(`${returnsJson.slice(1)}`)
      return returnsObject
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error(e)
    }
  }

  /**
   * TSDOC
   */
  readonly selectNewIssue = async (issues: Array<string>) => {
    try {
      const argsIssues = issues.map((obj: any) => {
        const title = ` ${obj.id}: ${obj.subject}`
        return {name: title, value: obj.id}
      })
      const issueList: object = {
        name: 'id',
        message: 'Select target Issues if you want post:',
        type: 'checkbox',
        choices: argsIssues
      }
      const selected: any = await this.inquirer(issueList)
      return selected
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to show new Issues prompt.')
    }
  }

  /**
   * TSDOC
   */
  readonly postNewIssue = async (gApi: GitlabApi, projectsId: number, issueTitle: string) => {
    try {
      await gApi.post(gApi.postIssueURL(projectsId), gApi.createIssueBody(issueTitle))
      return true
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error(`Failed to create New Issues.`)
    }
  }

  /**
   * TSDOC
   */
  public createGitlabApiObject = (): GitlabApi => {
    this.readSettingsJson()
    if (this.settingsData === null) {
      throw new Error('Failed to read \'settings.json\'. Please try to the following command:\n      $ redlab settings')
    }
    return new GitlabApi(this.settingsData.g_url, this.settingsData.g_key, this.settingsData.g_owned)
  }
}

class GitlabR2GBase extends GitlabBase {
  constructor() {
    super()
  }
}

export {GitlabApi, GitlabBase, GitlabR2GBase}
