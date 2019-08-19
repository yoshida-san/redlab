# redlab
Cli tool for redmine and gitlab

## setup

### use global command

```bash
$ git clone https://github.com/yoshida-san/redlab.git
$ cd redlab
$ npm install -g
```

### use local command

```bash
$ git clone https://github.com/yoshida-san/redlab.git
$ cd redlab
$ ./bin/run -h
$ ./bin/run settings -h
$ ./bin/run redmine -h
```

## settings command

```bash
redlab settings

USAGE
  $ redlab settings

OPTIONS
  -c, --check   do check API connect
  -h, --help    show CLI help
  -l, --log     show log(check API connect process)
  -r, --result  confirm setting data after setting

EXAMPLE
  $ redlab settings -rc
```

## redmine command

```bash
$ redlab redmine -h
show redmine tickets info

USAGE
  $ redlab redmine

OPTIONS
  -d, --detail           show ticket detail
  -h, --help             show CLI help
  -l, --limit=limit      [default: 100] number of issues per page(max: 100)
  -o, --offset=offset    [default: 0] skip this number of issues in response
  -p, --project=project  [default: 0] project id. can be used with query id option(-q, --query)
  -q, --query            use query
  -t, --ticket=ticket    [default: 0] ticket id

EXAMPLES
  $ redlab redmine -t=12345
  $ redlab redmine -qdp=4567
```

