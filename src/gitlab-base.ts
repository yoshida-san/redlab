/* tslint:disable:quotemark */
/* tslint:disable:no-redundant-jsdoc */
import {ApiConnectBase, Base} from './base'

/**
 * TSDOC
 */

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
      let returnId = 0
      let status = true
      let pagination = 1
      while (status) {
        // const projects = await gApi.get(gApi.getProjectsURL(pagination), gApi.createParams())
        const projects = await gApi.getGitlabProjectsObject(pagination)
        const argsProjects = projects.data.map((obj: any) => {
          return {name: obj.name, value: obj.id}
        })
        if (projects.headers['x-page'] !== projects.headers['x-total-pages']) argsProjects.push({name: '次のIssuesを取得', value: 'next'})
        if (projects.headers['x-page'] > 1) argsProjects.push({name: '前のIssuesを取得', value: 'prev'})
        const projectsList: object = {
          name: 'id',
          message: 'Select Gitlab\'s Project:',
          type: 'list',
          choices: argsProjects
        }
        const selected: any = await this.inquirer(projectsList)
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

  /**
   * TSDOC
   */
  readonly getIssuesData = async (gApi: GitlabApi, projectId: number) => {
    try {
      let returnsObject: Array<any> = []
      let status = true
      let pagination = 0
      while (status) {
        pagination++
        //const issueObject: any = await gApi.get(gApi.getIssuesURL(projectId, pagination) , gApi.createParams())
        returnsObject = [...returnsObject, ...issueObject.data]
        if (issueObject.headers['x-page'] === issueObject.headers['x-total-pages']) status = false
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
      //await gApi.post(gApi.postIssueURL(projectsId), gApi.createIssueBody(issueTitle))
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
