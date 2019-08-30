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

### Using with Docker
Dockerを利用して、既存の環境を壊さずアプリケーションを利用することができます。

```bash
$ git clone -b develop https://github.com/kounakay/redlab
$ cd redlab

# Redlabコンテナーのビルド
$ ./build

# Redlabの実行
$ ./redlab [subcommand and args]

# Example
./redlab settings -h
./redlab r2g

# Redlabコンテナーの削除
docker rmi redlab

# Redlab設定情報の削除
docker volume rm config
```

Docker実行コマンドは同梱のredlabバイナリーをpathの通っている場所に設置することで、redlabディレクトリ外でも利用できます。

```bash
$ cp ./redlab /path/foo/redlab
$ redlab [subcommands and args]

# Example
$ redlab settings
$ redlab r2g
```

dockerコマンドを直接利用する場合

```bash
# Build docker container
$ docker build -t redlab .
# Running command
$ docker run -it -v config:/usr/src/app/src/data --rm redlab [subcommand and args]
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

## gitlab command

```bash
$ redlab gitlab -h
show gitlab issues info

USAGE
  $ redlab gitlab

OPTIONS
  -d, --detail           show issue detail
  -h, --help             show CLI help
  -i, --issue=issue      [default: 0] issue id. used with project id option(-p, --project)
  -p, --project=project  [default: 0] project id

EXAMPLE
  $ redlab gitlab
```
