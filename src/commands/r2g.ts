/* tslint:disable:quotemark */
import {flags} from '@oclif/command'
import * as chalk from 'chalk'
import * as fs from 'fs'

import {Base, Question} from '../base'
import {GitlabApi, GitlabBase} from '../gitlab-base'
import {RedmineApi, RedmineBase} from '../redmine-base'

export default class R2g extends Base implements GitlabBase, RedmineBase {
  static description = 'add issue from redmine'

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

  //
}
