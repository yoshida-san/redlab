import {Command} from '@oclif/command'
import * as inq from 'inquirer'
import axios from 'axios'
import * as fs from 'fs'
import { isNull } from 'util';

interface SettingsData {
  r_url: string
  r_key: string
  g_url: string
  g_key: string
  g_owned: boolean
}

class ApiConnectBase {
  async get(url: string, params: object) {
    return await axios.get(url, {
      params: params
    })
  }
}

class RedmineApi extends ApiConnectBase{
  private apiBseUrl: string = ''
  private key: string = ''
  private projectsUrl: string = '/projects.json'
  private queriesUrl: string = '/queries.json'
  private issuesUrl: string = '/issues.json'
  private issueStatusesUrl: string = '/issue_statuses.json'
  private issueCategoriesUrl: string = '/issue_categories.json'
  private issueTrackerUrl: string = '/trackers.json'

  constructor(url: string, key: string) {
    super();
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

class GitlabApi extends ApiConnectBase{
  private apiBseUrl: string = ''
  private key: string = ''
  private owned: boolean = true
  private projectsUrl: string = '/projects'
  private issuesUrl: string = '/issues'

  constructor(url: string, key: string, owned: boolean) {
    super();
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

class Base extends Command {

  private settingsData: SettingsData | null = null
  protected settingsFilePath: string = __dirname + '/data/settings.json'

  private readSettingsJson = () => {
    try {
      if (isNull(this.settingsData)) {
        this.settingsData = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
      }
    } catch (e) {
      throw new Error('fail read settings data file. try \'redlab settings\'')
    }
  }

  protected createRedmineApiObject = (): RedmineApi => {
    this.readSettingsJson()
    if (isNull(this.settingsData)) {
      throw new Error('fail read settings data file. try \'redlab settings\'');
    }
    return new RedmineApi(this.settingsData.r_url, this.settingsData.r_key)
  }

  protected createGitlabApiObject = (): GitlabApi => {
    this.readSettingsJson()
    if (isNull(this.settingsData)) {
      throw new Error('fail read settings data file. try \'redlab settings\'');
    }
    return new GitlabApi(this.settingsData.g_url, this.settingsData.g_key, this.settingsData.g_owned)
  }

  protected inquiry = async (param: any): Promise<any> => {
    const getResponse = () => inq.prompt(param)
    const res: any = await getResponse()
    return res
  }

  async run() { }
  
}

export { Base, RedmineApi, GitlabApi, SettingsData }