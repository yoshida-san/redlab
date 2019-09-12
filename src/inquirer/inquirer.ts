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
 * Inquirer command class
 * - Inquirer.list: Show Inquirer with list view
 * - Inquirer.checkbox: Show Inquirer with checkbox view
 */
class Inquirer extends InquirerBase {
  constructor() {
    super()
  }

  readonly list = async (param: any, message: string): Promise<object> => {
    const returns: object = await this.inquirer(param, 'list', 'id', message)
    return returns
  }

  readonly checkbox = async (param: any, message: string): Promise<object> => {
    const returns: object = await this.inquirer(param, 'checkbox', 'id', message)
    return returns
  }

  private readonly inquirer = async (param: any, type: string, name: string, message: string): Promise<object> => {
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

export {Inquirer}
