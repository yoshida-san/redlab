/* tslint:disable:no-redundant-jsdoc */
import * as fs from 'fs'

import {SettingsData} from '../interfaces/settingsdata'

/**
 * API Connection Data
 * - ApiConnectionData.gitlabKey: Gitlab's Key
 * - ApiConnectionData.gitlabUrl: Gitlab's URL
 * - ApiConnectionData.redmineKey: Redmine's Key
 * - ApiConnectionData.redmineUrl: Redmine's URL
 * - ApiConnectionData.gitlabOwned: Gitlab's Owned Status
 * - function ApiConnectionData.save: Write Settings to JSON file
 */
export class ApiConnectionData {
  public gitlabKey = ''
  public gitlabUrl = ''
  public redmineKey = ''
  public redmineUrl = ''
  public gitlabOwned = false
  private settingsData: SettingsData | null = null
  private readonly settingsFilePath: string = __dirname + '/../data/settings.json'
  constructor() {
    this.readSettingsJson()
    if (this.settingsData !== null) {
      this.gitlabKey = this.settingsData.g_key
      this.gitlabUrl = this.settingsData.g_url
      this.redmineKey = this.settingsData.r_key
      this.redmineUrl = this.settingsData.r_url
      this.gitlabOwned = this.settingsData.g_owned
    } else {
      throw new Error('Failed to read \'settings.json\'. Please try to the following command:\n      $ redlab settings')
    }
  }

  /**
   * Write Settings to JSON File
   */
  readonly save = () => this.writeSettingsJson()

  private readonly readSettingsJson = () => {
    try {
      if (this.settingsData === null) {
        this.settingsData = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
      }
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to read \'settings.json\'. Please try to the following command:\n      $ redlab settings')
    }
  }

  private readonly writeSettingsJson = () => {
    try {
      fs.writeFileSync(this.settingsFilePath, JSON.stringify(this.settingsObject, null, '  '))
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to write \'settings.json\'. ')
    }
  }

  private readonly settingsObject = (): SettingsData => {
    return {
      r_url: this.redmineUrl,
      r_key: this.redmineKey,
      g_url: this.gitlabUrl,
      g_key: this.gitlabKey,
      g_owned: this.gitlabOwned
    }
  }
}
