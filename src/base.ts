/* tslint:disable:quotemark */
import {Command} from '@oclif/command'
import axios from 'axios'
import * as fs from 'fs'
import * as inq from 'inquirer'

import {SettingsData} from './data/settingsdata'

/**
 * TSDOC
 */
class ApiConnectBase {
  async get(url: string, params: object) {
    // tslint:disable-next-line:no-return-await
    return await axios.get(url, {
      params
    })
  }
  async post(url: string, params: object) {
    // tslint:disable-next-line:no-return-await
    return await axios.post(url, params)
  }
}

/**
 * TSDOC
 */
class Base extends Command {
  public settingsData: SettingsData | null = null
  protected settingsFilePath: string = __dirname + '/settings/settings.json'

  readonly readSettingsJson = () => {
    try {
      if (this.settingsData === null) {
        this.settingsData = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
      }
    } catch (e) {
      throw new Error('Failed to read \'settings.json\'. Please try to the following command:\n      $ redlab settings')
    }
  }

  protected inquirer = async (param: any): Promise<any> => {
    const getResponse = () => inq.prompt(param)
    const res: any = await getResponse()
    return res
  }

  // tslint:disable-next-line:member-ordering
  async run() { }
}

export {ApiConnectBase, Base}
