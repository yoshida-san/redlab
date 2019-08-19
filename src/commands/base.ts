import {Command} from '@oclif/command'
import * as inq from 'inquirer'
import axios from 'axios'
import * as fs from 'fs'
import { isNull } from 'util';

interface Question {
  name: string
  message: string
  type: string
  default:  string | number | boolean
}

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

  constructor(url: string, key: string) {
    super();
    this.apiBseUrl = url
    this.key = key
  }

  public getProjectsURL = (): string => `${this.apiBseUrl}${this.projectsUrl}`
  public getQueriesURL = (): string => `${this.apiBseUrl}${this.queriesUrl}`
  public getIssuesURL = (): string => `${this.apiBseUrl}${this.issuesUrl}`
  public getIssueURL = (ticketId: string) => `${this.apiBseUrl}/issues/${ticketId}.json`
  
  public createParams = (projectId?: number | null, queryId?: number | null, limit?: number | null, offset?: number | null): object => {
    return {
      key: this.key,
      project_id: projectId || null,
      query_id: queryId || null,
      limit: limit || null,
      offset: offset || null
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
    if (isNull(this.settingsData)) {
      this.settingsData = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
    }
  }

  protected createRedmineApiObject = (): RedmineApi => {
    this.readSettingsJson()
    if (isNull(this.settingsData)) {
      throw new Error('fail read settings data file.');
    }
    return new RedmineApi(this.settingsData.r_url, this.settingsData.r_key)
  }

  protected createGitlabApiObject = (): GitlabApi => {
    this.readSettingsJson()
    if (isNull(this.settingsData)) {
      throw new Error('fail read settings data file.');
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

export { Base, RedmineApi, GitlabApi, SettingsData, Question }