/* tslint:disable:no-redundant-jsdoc */
import * as inq from 'inquirer'

/**
 * Inquirer base class
 */
class InquirerBase {
  protected inquirerBase = async (param: any): Promise<any> => {
    const getResponse = () => inq.prompt(param)
    const returns: any = await getResponse()
    return returns
  }
}

/**
 * Inquirer
 * - Inquirer.list: Show Inquirer with list view
 * - Inquirer.checkbox: Show Inquirer with checkbox view
 */
export class Inquirer extends InquirerBase {
  /**
   * list
   * - Inquirerのリストを表示します。個別選択向け
   * @param {any} param リストのオブジェクト
   * @param {string} message リストの説明メッセージ
   * @return {object} 選択が含まれたオブジェクト
   */
  readonly list = async (param: any, message: string): Promise<object> => {
    const returns: object = await this.inquirerMulti(param, 'list', 'id', message)
    return returns
  }

  /**
   * checkbox
   * - Inquirerのチェックボックスを表示します。複数選択向け
   * @param {any} param リストのオブジェクト
   * @param {string} message リストの説明メッセージ
   * @return {object} 選択が含まれたオブジェクト
   */
  readonly checkbox = async (param: any, message: string): Promise<object> => {
    const returns: object = await this.inquirerMulti(param, 'checkbox', 'id', message)
    return returns
  }

  /**
   * input
   * - メッセージに対する返答を受け取ることができます。返値はstringです。
   * @param {string} param デフォルトのstring値
   * @param {string} message ダイアログの説明メッセージ
   * @return {string} ユーザによって入力されたstring値
   */
  readonly input = async (param: string, message: string): Promise<string> => {
    const returns: any = await this.inquirerSingle(param, 'input', 'answer', message)
    return String(returns.answer)
  }

  /**
   * confirm
   * - メッセージの内容の確認ができます。返値はboolです。
   * @param {boolean} param デフォルトのbool値
   * @param {string} message ダイアログの説明メッセージ
   * @return {boolean} trueまたはfalse
   */
  readonly confirm = async (param: boolean, message: string): Promise<boolean> => {
    const returns: any = await this.inquirerSingle(param, 'confirm', 'answer', message)
    return Boolean(returns.answer)
  }

  private readonly inquirerSingle = async (param: any, type: string, name: string, message: string): Promise<object> => {
    const inquirerObject: object = {
      name,
      message,
      type,
      default: param
    }
    const returns: object = await this.inquirerBase(inquirerObject)
    return returns
  }

  private readonly inquirerMulti = async (param: any, type: string, name: string, message: string): Promise<object> => {
    const inquirerObject: object = {
      name,
      message,
      type,
      choices: param
    }
    const returns: object = await this.inquirerBase(inquirerObject)
    return returns
  }
}
