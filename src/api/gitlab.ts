/* tslint:disable:ordered-imports */
import {ApiBase} from './base'
import {SettingsBase} from '../settings/settings'
import {SettingsData} from '../data/settingsdata'

class GitlabApi extends ApiBase {
  private readonly settings: SettingsBase = new SettingsBase()

  readonly createParams = (): object => {
    try {
      this.settings.readSettingsJson()
      let returnObject: object = {}
      if (this.settings.settingsData !== null) {
        returnObject = {
          private_token: this.settings.settingsData.g_key,
          owned: this.settings.settingsData.g_owned
        }
      } else {
        throw new Error('Failed to read settingsData.')
      }
      return returnObject
    } catch (e) {
      throw new Error(e)
    }
  }
  readonly getGitlabIssues = () => {
    this.settings.readSettingsJson()
    this.settings.writeSettingsJson()
    const data: SettingsData = this.settings.settingsData
  }
}

export {GitlabApi}
