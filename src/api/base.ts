import axios from 'axios'

export class ApiBase {
  protected async get(url: string, params: object) {
    const returns: any = await axios.get(url, {
      params
    })
    return returns
  }

  protected async post(url: string, params: object) {
    const returns: any = await axios.post(url, params)
    return returns
  }
}
