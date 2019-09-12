/* tslint:disable:no-redundant-jsdoc */
/**
 * Question
 * @interface
 */
interface Question {
  name: string
  message: string
  type: string
  default: string | number | boolean
}
export {Question}
