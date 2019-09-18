/* tslint:disable:no-redundant-jsdoc */
/**
 * Question
 * @interface
 */
export interface Question {
  name: string
  message: string
  type: string
  default: string | number | boolean
}
