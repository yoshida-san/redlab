/* tslint:disable:quotemark */
import {Base, SettingsData, Question, RedmineApi, GitlabApi} from '../base'
import {flags} from '@oclif/command'
import * as fs from 'fs'
import * as chalk from 'chalk'

export default class Settings extends Base {
  static description = 'redlab settings'

  static examples = [
    `$ redlab settings -rc`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    check: flags.boolean({char: 'c', default: false, description: 'do check API connect'}),
    result: flags.boolean({char: 'r', default: false, description: 'confirm setting data after setting'}),
    log: flags.boolean({char: 'l', default: false, description: 'show log(check API connect process)'})
  }

  private questions: { [key: string]: Question } = {
    r_url: {
      name: 'r_url',
      message: 'Redmine URL(API base URL)',
      type: 'input',
      default: 'https://foobar.example'
    },
    r_key: {
      name: 'r_key',
      message: 'Redmine access key',
      type: 'input',
      default: ''
    },
    g_url: {
      name: 'g_url',
      message: 'GitLab URL(API base URL)',
      type: 'input',
      default: 'https://foobar.example'
    },
    g_key: {
      name: 'g_key',
      message: 'GitLab private token',
      type: 'input',
      default: ''
    },
    g_owned: {
      name: 'g_owned',
      message: 'Use owned flag(Gitlab only)',
      type: 'confirm',
      default: true
    }
  }

  async run() {
    const { flags } = this.parse(Settings)
    let questions: Array<Question> = []

    let updateDefault = (q: Question, n?: string | boolean): Question => {
      q.default = (n !== undefined) ? n : q.default
      return q;
    }

    try {
      fs.statSync(this.settingsFilePath)
      const settingsData: SettingsData = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
      questions.push(updateDefault(this.questions.r_url, settingsData.r_url))
      questions.push(updateDefault(this.questions.r_key, settingsData.r_key))
      questions.push(updateDefault(this.questions.g_url, settingsData.g_url))
      questions.push(updateDefault(this.questions.g_key, settingsData.g_key))
      questions.push(updateDefault(this.questions.g_owned, settingsData.g_owned))
    } catch (e) {
      this.log(`${chalk.default.bgRed.bold('error')} ${chalk.default.red(e.message)}`)
      this.log(`start initialize settings.json`)
      questions.push(updateDefault(this.questions.r_url))
      questions.push(updateDefault(this.questions.r_key))
      questions.push(updateDefault(this.questions.g_url))
      questions.push(updateDefault(this.questions.g_key))
      questions.push(updateDefault(this.questions.g_owned))
    }

    const answers: SettingsData = await this.inquiry(questions)

    try {
      fs.writeFileSync(this.settingsFilePath, JSON.stringify(answers, null, '  '))
      this.log(`${chalk.default.bgGreen.bold('setting file update is complete')}`)
    } catch (e) {
      this.log(`${chalk.default.bgRed.bold('error')} ${chalk.default.red(e.message)}`)
      this.log(`please retry 'redlab setting [-c] [-r]'`)
      return
    }

    if (flags.result) {
      this.log(`${chalk.default.blue.bold(`redmine url`)}:          ${answers.r_url}`)
      this.log(`${chalk.default.blue.bold(`redmine access key`)}:   ${answers.r_key}`)
      this.log(`${chalk.default.blue.bold(`gitlab url`)}:           ${answers.g_url}`)
      this.log(`${chalk.default.blue.bold(`gitlab private token`)}: ${answers.g_key}`)
      this.log(`${chalk.default.blue.bold(`gitlab owned flag`)}:    ${answers.g_owned}`)
    }

    if (flags.check) {
      try {
        this.log(chalk.default.cyan('start check Redmine API connect'))
        const rApi: RedmineApi = new RedmineApi(answers.r_url, answers.r_key)
        const rInfo = await rApi.get(rApi.getProjectsURL(), rApi.createParams())
        if (flags.log) {
          this.log(rInfo.data)
        }
        this.log(chalk.default.cyan('start check GitLab API connect'))
        const gApi: GitlabApi = new GitlabApi(answers.g_url, answers.g_key, answers.g_owned)
        const gInfo = await gApi.get(gApi.getProjectsURL(), gApi.createParams())
        if (flags.log) {
          this.log(gInfo.data)
        }
        this.log(`${chalk.default.green('success check api connect')}`)
      } catch (e) {
        this.log(`${chalk.default.bgRed.bold('error')} ${chalk.default.red(e.message)}`)
        this.log(`${chalk.default.red('fail check api connect')}`)
      }
    }
  }
}
