/* tslint:disable:quotemark */
import {Command} from '@oclif/command'
import axios from 'axios'
import * as fs from 'fs'
import * as inq from 'inquirer'

/**
 * TSDOC
 */
interface Question {
  name: string
  message: string
  type: string
  default: string | number | boolean
}

/**
 * TSDOC
 */
interface SettingsData {
  r_url: string
  r_key: string
  g_url: string
  g_key: string
  g_owned: boolean
}

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
}

/**
 * TSDOC
 */
class Base extends Command {
  public settingsData: SettingsData | null = null
  protected settingsFilePath: string = __dirname + '/data/settings.json'

  readonly readSettingsJson = () => {
    try {
      if (this.settingsData === null) {
        this.settingsData = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'))
      }
    } catch (e) {
      throw new Error('Failed to read \'settings.json\'. Please try to the following command:\n      $ redlab settings')
    }
  }

  protected inquiry = async (param: any): Promise<any> => {
    const getResponse = () => inq.prompt(param)
    const res: any = await getResponse()
    return res
  }

  // tslint:disable-next-line:member-ordering
  async run() { }
}

export {ApiConnectBase, Base, Question, SettingsData}
