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
    rproject: flags.string({char: 'r', description: '[Redmine] Project ID. Only can using with Query option(-q, --query).', default: '0'}),
    query: flags.boolean({char: 'q', description: '[Redmine] Use Query.', default: false})
  }

  readonly ValidationFlags = (flags: any) => {
    if (isNaN(parseInt(flags.gproject, 10))) throw new Error('Please enter the \'GitLab Project ID(-g, --groject)\' by numeric.')
    if (isNaN(parseInt(flags.rproject, 10))) throw new Error('Please enter the \'Redmine Project ID(-r, --rproject)\' by numeric.')
  }

  /**
   * フラグの指定状況によって数値を返します
   * Gitlab ProjectID, Redmine ProjectID, Query全指定の場合: 1
   * Gitlab ProjectID, Redmine ProjectIDのみ指定の場合: 2
   * //
   *
   * @param flags flagsのオブジェクト
   * @returns number(1~6)
   */
  readonly FlagsSwitcher = (flags: any): number => {
    if (flags.gproject !== 0) return 1
    else return 5
  }

  async run() {
    const {flags} = this.parse(R2g)
    // for GitLab
    let gitlabProjectId = 0
    // for Redmine
    let redmineProjectId: number | null = null
    let statusId: number | null = null
    let categoryId: number | null = null
    let trackerId: number | null = null
    let queryId: number | null = null
    //let limit: number | null = null
    //let offset: number | null = null

    try {
      this.ValidationFlags(flags)
    } catch (e) {
      this.error(`${e.message}`)
      return
    }

    try {
      const gBase: GitlabR2GBase = new GitlabR2GBase()
      const rBase: RedmineR2GBase = new RedmineR2GBase()
      const gApi: GitlabApi = gBase.createGitlabApiObject()
      const rApi: RedmineApi = rBase.createRedmineApiObject()

      if (flags.gproject !== '0') {
        //
      } else {
        //Gitlab
        gitlabProjectId = await gBase.getProjectId(gApi)
        //Redmine
        redmineProjectId = await rBase.getProjectId(rApi)
        statusId = await rBase.getIssueStatusId(rApi)
        categoryId = await rBase.getIssueCategoryId(rApi, redmineProjectId)
        trackerId = await rBase.getIssueTrackerId(rApi)
      }

      // Issues一覧取得処理
      this.log('Getting the diff...')
      const gitlabIssuesData: any = await gBase.getIssuesData(gApi, gitlabProjectId)
      const redmineTicketsData: any = await rBase.getIssuesData(rApi, redmineProjectId, queryId, statusId, categoryId, trackerId)

      // 突合処理
      const notExistsTickets: Array<string> = redmineTicketsData.data.issues.map((redmine: any) => {
        const issue = gitlabIssuesData.find((gitlab: any) => gitlab.title.indexOf(`r${redmine.id}_`) === 0)
        return (issue === undefined) ? redmine : false
      }).filter((redmine: any) => redmine !== false)

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
