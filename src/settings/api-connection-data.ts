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
  public gitlabUrl = 'https://example.com'
  public redmineKey = ''
  public redmineUrl = 'https://example.com'
  public gitlabOwned = true
  private readonly settingsFilePath: string = __dirname + '/../data/settings.json'
  constructor(setupFlag?: boolean) {
    if (this.fileExists() || !setupFlag) this.readSettingsObject(this.readSettingsJson())
  }

  /**
   * Write Settings to JSON File
   */
  readonly save = () => this.writeSettingsJson()

  private readonly readSettingsJson = (): SettingsData | null => {
    let settingsData: SettingsData | null = null
    try {
      settingsData = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to read \'settings.json\'. Please try to the following command:\n      $ redlab settings')
    }
    return settingsData
  }

  private readonly writeSettingsJson = () => {
    try {
      fs.writeFileSync(this.settingsFilePath, JSON.stringify(this.makeSettingsObject(), null, '  '))
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to write \'settings.json\'.')
    }
  }

  private readonly makeSettingsObject = (): SettingsData => {
    return {
      r_url: this.redmineUrl,
      r_key: this.redmineKey,
      g_url: this.gitlabUrl,
      g_key: this.gitlabKey,
      g_owned: this.gitlabOwned
    }
  }

  private readonly readSettingsObject = (settingsData: SettingsData | null) => {
    if (settingsData !== null) {
      this.gitlabKey = settingsData.g_key
      this.gitlabUrl = settingsData.g_url
      this.redmineKey = settingsData.r_key
      this.redmineUrl = settingsData.r_url
      this.gitlabOwned = settingsData.g_owned
    } else {
      throw new Error('Failed to read Settings Data.')
    }
  }

  private readonly fileExists = (): boolean => {
    try {
      JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
      return true
      // tslint:disable-next-line:no-unused
    } catch (e) {
      return false
    }
  }
}
