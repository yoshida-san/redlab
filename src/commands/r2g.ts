/* tslint:disable:quotemark */
import {flags} from '@oclif/command'
require('array-foreach-async')

import {Base} from '../base'
import {GitlabApi, GitlabR2GBase} from '../gitlab-base'
import {RedmineApi, RedmineR2GBase} from '../redmine-base'

export default class R2g extends Base {
  static description = 'r2g\'s description'

  static examples = [
    `$ redlab r2g -g=5134`,
    `$ redlab r2g -qr=375`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    gproject: flags.string({char: 'g', description: '[GitLab] Project ID', default: '0'}),
    issue: flags.string({char: 'i', description: '[GitLab] Issue ID. Using with Project ID option(-g, --gproject).', default: '0'}),
    rproject: flags.string({char: 'r', description: '[Redmine] Project ID. Only can using with Query option(-q, --query).', default: '0'}),
    ticket: flags.string({char: 't', description: '[Redmine] Ticket ID.', default: '0'}),
    query: flags.boolean({char: 'q', description: '[Redmine] Use Query.', default: false}),
    limit: flags.string({char: 'l', description: '[Redmine] Number of issues per page(MAX: 100).', default: '100'}),
    offset: flags.string({char: 'o', description: '[Redmine] Skip this number of issues in response.', default: '0'})
  }

  readonly ValidationFlags = (flags: any) => {
    if (isNaN(parseInt(flags.gproject, 10))) throw new Error('Please enter the \'GitLab Project ID(-g, --groject)\' by numeric.')
    if (isNaN(parseInt(flags.issue, 10))) throw new Error('Please enter the \'Issue ID(-i, --issue)\' by numeric.')
    if (isNaN(parseInt(flags.rproject, 10))) throw new Error('Please enter the \'Redmine Project ID(-r, --rproject)\' by numeric.')
    if (isNaN(parseInt(flags.ticket, 10))) throw new Error('Please enter the \'Ticket ID(-t, --ticket)\' by numeric.')
    if (isNaN(parseInt(flags.limit, 10))) throw new Error('Please enter the \'Query Limit(-l, --limit)\' by numeric.')
    if (isNaN(parseInt(flags.offset, 10))) throw new Error('Please enter the \'Query ID(-o, --offset)\' by numeric.')
  }

  readonly CompareTitleString = (gitlab: any, redmine: any) => {
    return gitlab.title.indexOf(`r${redmine.id}_`) === 0 ? false : true
  }

  readonly feIssueData = (gitlabObject: object, redmine: any) => {
    gitlabObject.data.forEach((gitlab: any) => {
      return this.CompareTitleString(gitlab, redmine)
    })
  }

  async run() {
    const {flags} = this.parse(R2g)
    // for GitLab
    let gitlabProjectId: number | null = null
    let issueId: number | null = null
    // for Redmine
    let redmineProjectId: number | null = null
    let statusId: number | null = null
    let categoryId: number | null = null
    let trackerId: number | null = null
    let queryId: number | null = null
    let limit: number | null = null
    let offset: number | null = null

    try {
      this.ValidationFlags(flags)
      limit = parseInt(flags.limit, 10)
      offset = parseInt(flags.offset, 10)
    } catch (e) {
      this.error(`${e.message}`)
      return
    }

    try {
      const gBase: GitlabR2GBase = new GitlabR2GBase()
      const rBase: RedmineR2GBase = new RedmineR2GBase()
      const gApi: GitlabApi = gBase.createGitlabApiObject()
      const rApi: RedmineApi = rBase.createRedmineApiObject()

      if (false) {
        //とりあえず情報取得のため省略
      } else {
        //Gitlab
        gitlabProjectId = await gBase.getProjectId(gApi)
        //Redmine
        redmineProjectId = await rBase.getProjectId(rApi)
        statusId = await rBase.getIssueStatusId(rApi)
        categoryId = await rBase.getIssueCategoryId(rApi, redmineProjectId)
        trackerId = await rBase.getIssueTrackerrId(rApi)
      }

      // Issues一覧取得処理
      this.log('Getting the diff...')
      const gitlabIssuesData: any = await gApi.get(gApi.getIssuesURL(gitlabProjectId), gApi.createParams())
      const redmineTicketsData: any = await rApi.get(rApi.getIssuesURL(), rApi.createParams(redmineProjectId, queryId, limit, offset, statusId, categoryId, trackerId))
      //バグがあるため修正(うまく差分を抜き出せていない)
      //const notExistsTickets: Array<string> = gitlabIssuesData.data.map((issue: any) => {
      //  return redmineTicketsData.data.issues.map((ticket: any) => {
      //    if (this.CompareTitleString(issue, ticket)) return ticket
      //  }).filter((ticket: any) => ticket)
      //}).slice(-1)[0]

      const notExistsTickets: any = redmineTicketsData.data.issues.filter((redmine: any) => {
        //gitlabIssuesData.data.forEach((gitlab: any) => {
        //  //return gitlab.title.indexOf(`r${redmine.id}_`) === 0 ? false : true
        //  return this.CompareTitleString(gitlab, redmine)
        //})
        this.log(`${redmine.id}`)
        this.feIssueData(gitlabIssuesData, redmine)
        this.log(`${gitlabIssuesData}`)
        //gitlabIssuesData.data.title.indexOf(`r${redmine.id}_`) !== 0
        //const gitlab: any = gitlabIssuesData.data.find((data: any) => data.id === redmine.id)
        //gitlab.title.indexOf(`r${redmine.id}_`) === 0
        //this.CompareTitleString(gitlab, redmine)
      })

      //const result: any = gitlabIssuesData.data.map((gitlab: any) => {
      //  for (let redmine in this) {
      //    if (gitlab.title.indexOf(`r${redmine.id}_`) !== 0) return this[gitlab.id]
      //  }
      //}, redmineTicketsData.data.issues)

      notExistsTickets.forEach((ne: any) => {
        ne.forEach((ni: any) => {
          this.log(`${ni.id}`)
        })
        this.log(`${ne.id}`)
      })

      // Issues投稿処理
      const selected = await gBase.selectNewIssue(notExistsTickets)
      await selected.id.forEachAsync(async (selected: any) => {
        const issueData: any = notExistsTickets.find((data: any) => data.id === selected)
        const issueMessage = `r${issueData.id}_${issueData.subject}`
        await gBase.postNewIssue(gApi, gitlabProjectId, issueMessage)
      })

      this.log(`All done.`)

      // エラーキャッチ
    } catch (e) {
      this.error(`${e.message}`)
    }
  }
}
