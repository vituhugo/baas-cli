import {Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import {Client, ClientConfig} from 'pg'
import {ROOT_PATH} from '../../constants'
import {parse} from 'yaml'
import {parse as envParse} from 'dotenv'
import * as inquirer from 'inquirer'
import {spawn} from 'node:child_process'

export default class PostgresImport extends Command {
  static description = 'import postgres database'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    host: Flags.string({char: 'h', required: true}),
    port: Flags.integer({char: 'P', default: 5432}),
    user: Flags.string({char: 'u', required: true}),
    password: Flags.string({char: 'p', required: true}),
  }

  private configs: Record<string, ClientConfig> = {}

  public async run(): Promise<void> {
    const {flags: dbRemoteConfig} = await this.parse(PostgresImport)
    const dbLocalConfig = this.resolveDbCredentials()

    this.configs = {
      remote: dbRemoteConfig,
      local: dbLocalConfig,
    }

    await this.createDumpFiles()
  }

  private async setRemoteDatabaseName() {
    const client = new Client({...this.configs.remote, database: 'postgres'})
    await client.connect()

    const res = await client.query('SELECT datname FROM pg_database WHERE datname <> ALL (\'{template0,template1,postgres}\');')
    const dbs = res.rows.map(row => row.datname)

    if (dbs.includes(this.configs.local.database)) {
      this.configs.remote.database = this.configs.local.database
      return
    }

    const {database} = await inquirer.prompt({
      type: 'list',
      name: 'database',
      choices: dbs,
      message: 'Select the database you would like to import:',
    })

    this.configs.remote.database = database
  }

  private resolveDbCredentials(): ClientConfig {
    const dockerCompose = parse(fs.readFileSync(`${ROOT_PATH}/docker-compose.override.yml`).toString())
    const namespaces = Object.keys(dockerCompose.services)

    const serviceName = namespaces.find((namespace: string) => process.cwd().includes(namespace.replace(/_/g, '/')))
    if (!serviceName) throw new Error('The current folder is not a service root folder')

    const env = dockerCompose.services[serviceName].env_file.find((envFile: string) => envFile.includes('-db'))
    if (!env) throw new Error(`The service ${serviceName} dont have database credentials.`)
    const config = {
      ...envParse(fs.readFileSync(`${ROOT_PATH}/${env}`)),
      ...envParse(fs.readFileSync(`${ROOT_PATH}/config/envs/${serviceName}.env`)),
    }

    return {
      host: 'localhost',
      port: Number(config.DB_PORT ?? 5432),
      user: config.DB_USER,
      database: config.DB_NAME,
      password: config.DB_PASS,
    }
  }

  private async spawnLoadDump(filename: string): Promise<void> {
    const config = this.configs.local
    let lastData = ''
    return new Promise((resolve, reject) => {
      const child = spawn('docker', [
        'run',
        '--network',
        'host',
        '--mount',
        `type=bind,source=${process.cwd()}/${filename},target=/file.sql`,
        '-t',
        'postgres',
        '/bin/bash',
        '-c',
        `PGPASSWORD=${config.password} \
              psql \
                  --port ${config.port ?? 5432} \
                  --username ${config.user} \
                  --host ${config.host} \
                  ${config.database} \
                  -f /file.sql`,
      ], {timeout: 1000 * 60})
      child.on('close', code => {
        if (code) return reject({data: lastData, code})
        resolve()
      })

      child.stdout.on('data', data => {
        lastData = data.toString()
      })

      child.stderr.on('data', data => {
        reject(data.toString())
      })
    })
  }

  private async createDumpFiles() {
    fs.mkdirSync('.temp', {recursive: true})

    await this.setRemoteDatabaseName()
    const client = new Client(this.configs.remote)
    await client.connect()

    await this.createDatabaseIfNotExists()

    this.log(`Importing ${this.configs.remote.database} starting...`)

    try {
      const preData = await this.spawnPgDumpData()
      await this.spawnLoadDump(preData)

      this.log(`Remote database ${this.configs.remote.database} imported to locale as ${this.configs.local.database}.`)
    } catch (error) {
      console.log('ERROR', error)
    }

    process.exit(0)
  }

  private async createDatabaseIfNotExists() {
    const localClient = new Client({...this.configs.local, database: 'postgres'})
    await localClient.connect()
    await localClient.query(`CREATE DATABASE ${this.configs.local.database};`).catch(() => null)
  }

  private async spawnPgDumpData(): Promise<string> {
    const config = this.configs.remote
    let lastData = ''
    return new Promise((resolve, reject) => {
      const fileWriteStream = fs.createWriteStream('.temp/dump.sql')
      const child = spawn('docker', [
        'run',
        '-t',
        'postgres',
        '/bin/bash',
        '-c',
        `PGPASSWORD=${this.configs.remote.password} \
              pg_dump \
                --no-owner \
                --no-acl \
                --clean \
                --port ${config.port ?? 5432} \
                --username ${config.user} \
                --host ${config.host} \
                ${config.database}`,
      ], {timeout: 1000 * 60 * 10})

      child.stdout.pipe(fileWriteStream)

      child.on('close', code => {
        if (code) return reject({code, data: lastData})
        fileWriteStream.close()
        resolve('.temp/dump.sql')
      })

      child.stdout.on('data', data => {
        lastData = data.toString()
      })

      child.stderr.on('data', data => {
        reject(data.toString())
      })
    })
  }
}
