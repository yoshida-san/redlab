import {expect, test} from '@oclif/test'

describe('gitlab', () => {
  test
  .nock('https://gitlab.com/api/v4', api => api
    .get('/')
    // user is logged in, return their name
    .reply(200, {email: 'jeff@example.com'})
  )
  .stdout()
  .command(['redlab:gitlab'])
  .it('shows user email when logged in', ctx => {
    expect(ctx.stdout).to.equal('jeff@example.com\n')
  })

  test
  .nock('https://api.heroku.com', api => api
    .get('/account')
    // HTTP 401 means the user is not logged in with valid credentials
    .reply(401)
  )
  .command(['redlab:gitlab'])
  // checks to ensure the command exits with status 100
  .exit(100)
  .it('exits with status 100 when not logged in')
})

describe('hello', () => {
  test
    .stdout()
    .command(['hello'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world')
    })

  test
    .stdout()
    .command(['hello', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff')
    })
})
