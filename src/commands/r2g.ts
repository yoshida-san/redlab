/* tslint:disable:quotemark */
import {flags} from '@oclif/command'
import * as chalk from 'chalk'

import {Base} from '../base'
import {GitlabApi, GitlabBase} from '../gitlab-base'
import {RedmineApi, RedmineBase} from '../redmine-base'

export default class R2g extends Base {
  static description = 'R2g\'s description'

  static examples = [
    `$ redlab r2g -t=12345`,
    `$ redlab r2g -some-example-flags`,
  ]

  //TODO: 書く
  static flags = {
    help: flags.help({char: 'h'}),
    project: flags.string({char: 'p', description: 'project id. can be used with query id option(-q, --query)', default: '0'}),
    query: flags.boolean({char: 'q', description: 'use query', default: false}),
    limit: flags.string({char: 'l', description: 'number of issues per page(max: 100)', default: '100'}),
    offset: flags.string({char: 'o', description: 'skip this number of issues in response', default: '0'}),
    detail: flags.boolean({char: 'd', description: 'show ticket detail', default: false}),
    ticket: flags.string({char: 't', description: 'ticket id', default: '0'})
  }

  readonly ValidationFlags = (flags: any) => {
    //flags validation
  }
  async run() {
    const {flags} = this.parse(R2g)
    //git
    let gitlabProjectId: number | null = null
    let issueId: number | null = null
    //redlab
    let redmineProjectId: number | null = null
    let statusId: number | null = null
    let categoryId: number | null = null
    let trackerId: number | null = null
    let queryId: number | null = null
    let limit: number | null = null
    let offset: number | null = null

    try {
      this.ValidationFlags(flags)
    } catch (e) {
      this.error(`${e.message}`)
      return
    }

    try {
      //オブジェクト初期化をしたい
      const gBase!: GitlabBase
      const rBase!: RedmineBase
      const gApi: GitlabApi = gBase.createGitlabApiObject()
      const rApi: RedmineApi = rBase.createRedmineApiObject()

      if (false) {
        //とりあえず情報取得のため
      } else {
        //Gitlab
        gitlabProjectId = await gBase.getProjectId(gApi)
        //Redmine
        redmineProjectId = await rBase.getProjectId(rApi)
        statusId = await rBase.getIssueStatusId(rApi)
        categoryId = await rBase.getIssueCategoryId(rApi, redmineProjectId)
        trackerId = await rBase.getIssueTrackerrId(rApi)
      }

      // GitlabのIssues取得
      this.log('Starting...')
      const gitlabIssuesData: any = await gApi.get(gApi.getIssuesURL(gitlabProjectId), gApi.createParams())
      const gitlabIssuesList: Array<string> = gitlabIssuesData.data.map((obj: any) => {
        return obj
      })
      gitlabIssuesList.forEach(issue => {
        this.log(`${issue.state}`)
      })

      // RedmineのIssues取得
      this.log('Starting...')
      const redmineTicketsData: any = await rApi.get(rApi.getIssuesURL(), rApi.createParams(redmineProjectId, queryId, limit, offset, statusId, categoryId, trackerId))
      const redmineTicketsList: Array<string> = redmineTicketsData.data.issues.map((obj: any) => {
        return obj
      })
      redmineTicketsList.forEach(ticket => {
        this.log(`${ticket.status.name}`)
      })
    } catch (e) {
      this.error(`${e.message}`)
    }
  }
}
