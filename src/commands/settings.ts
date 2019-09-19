/* tslint:disable:quotemark */
/* tslint:disable:ordered-imports */
import {Command, flags} from '@oclif/command'
import * as chalk from 'chalk'

import {ApiConnectionData} from '../settings/api-connection-data'
import {Inquirer} from '../inquirer/inquirer'
import {GitlabApi} from '../api/gitlab'
import {RedmineApi} from '../api/redmine'

export default class Settings extends Command {
  static description = 'redlab settings'

  static examples = [
    `$ redlab settings -rc`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    check: flags.boolean({char: 'c', default: false, description: 'Checking API Connection.'}),
    result: flags.boolean({char: 'r', default: false, description: 'Show setting data after setup process.'}),
    log: flags.boolean({char: 'l', default: false, description: 'Show Log (Checking API Connection process)'})
  }

  async run() {
    const {flags} = this.parse(Settings)

    try {
      this.log(`Starting initialize settings.json`)
      const inquirer: Inquirer = new Inquirer()
      const connectionData: ApiConnectionData = new ApiConnectionData(true)
      connectionData.redmineUrl = await inquirer.input(connectionData.redmineUrl, 'Redmine URL (API base URL): ')
      connectionData.redmineKey = await inquirer.input(connectionData.redmineKey, 'Redmine Access Key: ')
      connectionData.gitlabUrl = await inquirer.input(connectionData.gitlabUrl, 'GitLab URL (API base URL): ')
      connectionData.gitlabKey = await inquirer.input(connectionData.gitlabKey, 'GitLab Private Token: ')
      connectionData.gitlabOwned = await inquirer.confirm(connectionData.gitlabOwned, 'Use owned flag (Gitlab only): ')
      connectionData.save()
      this.log(`${chalk.default.bgGreen.bold('Done initialize settings.')}`)
    } catch (e) {
      this.log(`${chalk.default.bgRed.bold(' Error ')} ${chalk.default.red(e.message)}`)
      this.log(`Please retry following command:\n$ redlab setting [-c] [-r]`)
      return
    }

    if (flags.result) {
      try {
        const connectionData: ApiConnectionData = new ApiConnectionData()
        this.log(`${chalk.default.blue.bold(`Redmine URL`)}:          ${connectionData.redmineUrl}`)
        this.log(`${chalk.default.blue.bold(`Redmine Access Key`)}:   ${connectionData.redmineKey}`)
        this.log(`${chalk.default.blue.bold(`Gitlab URL`)}:           ${connectionData.gitlabUrl}`)
        this.log(`${chalk.default.blue.bold(`Gitlab Private Token`)}: ${connectionData.gitlabKey}`)
        this.log(`${chalk.default.blue.bold(`Gitlab Owned Flag`)}:    ${connectionData.gitlabOwned}`)
      } catch (e) {
        this.log(`${chalk.default.bgRed.bold(' ERROR ')} ${chalk.default.red(e.message)}`)
        this.log(`${chalk.default.red('Failed to showing result.')}`)
        return
      }
    }

    if (flags.check) {
      try {
        this.log(chalk.default.cyan('Checking connection of Redmine\'s API.'))
        const redmineApi: RedmineApi = new RedmineApi()
        const redmineInfo: any = await redmineApi.getProjectsObject()
        if (flags.log) {
          this.log(redmineInfo.data)
        }
        this.log(chalk.default.cyan('Checking connection of GitLab\'s API.'))
        const gitlabApi: GitlabApi = new GitlabApi()
        const gitlabInfo: any = await gitlabApi.getProjectsObject()
        if (flags.log) {
          this.log(gitlabInfo.data)
        }
        this.log(`${chalk.default.green('Succeeded to checking connections of APIs.')}`)
      } catch (e) {
        this.log(`${chalk.default.bgRed.bold('ERROR')} ${chalk.default.red(e.message)}`)
        this.log(`${chalk.default.red('Failed to checking connections of APIs.')}`)
        return
      }
    }
  }
}
