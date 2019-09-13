import * as fs from 'fs'

import {SettingsData} from '../data/settingsdata'

class SettingsBase {
  settingsData: SettingsData | null = null
  protected settingsFilePath: string = __dirname + '/data/settings.json'

  readonly readSettingsJson = () => {
    try {
      if (this.settingsData === null) {
        this.settingsData = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
      }
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to read \'settings.json\'. Please try to the following command:\n      $ redlab settings')
    }
  }

  readonly writeSettingsJson = () => {
    try {
      if (this.settingsData !== null) {
        fs.writeFileSync(this.settingsFilePath, JSON.stringify(this.settingsData, null, '  '))
      } else {
        throw new Error('Failed to read SettingsData object.')
      }
      // tslint:disable-next-line:no-unused
    } catch (e) {
      throw new Error('Failed to write \'settings.json\'. ')
    }
  }
}

export {SettingsBase}
