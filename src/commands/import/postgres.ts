import {Command, Flags} from '@oclif/core'
import {exec, execSync} from 'node:child_process'
import * as fs from 'node:fs'
import {Client, ClientConfig} from 'pg'
import {ROOT_PATH} from '../../constants'
import {parse} from 'yaml'
import {parse as envParse} from 'dotenv'
import * as inquirer from 'inquirer';

export default class PostgresImport extends Command {
  static description = 'import postgres database'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    host: Flags.string({char: 'h', required: true }),
    port: Flags.integer({char: 'P', default: 5432}),
    user: Flags.string({char: 'u', required: true }),
    password: Flags.string({char: 'p', required: true }),
  }

  private clients: Record<string, Client> = {}

  public async run(): Promise<void> {
    const {flags: dbRemoteConfig} = await this.parse(PostgresImport)
    const dbLocalConfig = this.resolveDbCredentials();

    this.clients = {
      remotePostgres: new Client({ database: 'postgres', ...dbRemoteConfig }),
      localPostgres: new Client({ database: 'postgres', ...dbLocalConfig }),
      local: new Client(dbLocalConfig),
    }

    await this.clients['remotePostgres'].connect();
    this.clients.remote = new Client({ database: await this.getDatabaseName(dbLocalConfig.database as string), ...dbRemoteConfig });
    await this.clients['remote'].connect();

    await this.createDumpFiles(this.clients['remote']);
  }

  private async getDatabaseName(localDatabase: string) {
    const client = this.clients['remotePostgres'];
    const res = await client.query('SELECT datname FROM pg_database WHERE datname <> ALL (\'{template0,template1,postgres}\');')
    const dbs = res.rows.map(row => row.datname)

    if (dbs.includes(localDatabase)) return localDatabase;

    const {database} = await inquirer.prompt({
      type: 'list',
      name: 'database',
      choices: dbs,
      message: 'Select the database you would like to import:',
    })
    return database;
  }

  private resolveDbCredentials(): ClientConfig {
    const dockerCompose = parse(fs.readFileSync(`${ROOT_PATH}/docker-compose.override.yml`).toString())
    const namespaces = Object.keys(dockerCompose.services)

    const serviceName = namespaces.find((namespace: string) => process.cwd().includes(namespace.replace(/_/g, '/')))
    if (!serviceName) throw new Error(`The current folder is not a service root folder`)

    const env = dockerCompose.services[serviceName].env_file.find((envFile: string) => envFile.includes('-db'));
    if (!env) throw new Error(`The service ${serviceName} dont have database credentials.`)
    const config = {
      ...envParse(fs.readFileSync(`${ROOT_PATH}/${env}`)),
      ...envParse(fs.readFileSync(`${ROOT_PATH}/config/envs/${serviceName}.env`))
    }

    return {
      host: 'localhost',
      port: Number(config.DB_PORT ?? 5432),
      user: config.DB_USER,
      database: config.DB_NAME,
      password: config.DB_PASS
    }
  }

  private async createDumpFiles(client: Client) {
    fs.mkdirSync('.temp', { recursive: true });
    //Importa estrutura do banco de dados
    const res = await client.query(`SELECT table_name FROM information_schema."tables" WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema');`)
    await Promise.all(res.rows.map(({ table_name: table }) => {
      const fileWriteStream = fs.createWriteStream(`.temp/${table}.sql`);
      return new Promise((resolve, reject) => exec(`docker run \
          -t postgres \
          /bin/bash -c "\
          PGPASSWORD=${this.clients['remote'].password} \
              pg_dump \
                  --no-owner \
                  --no-acl \
                  --clean \
                  --create \
                  --section=pre-data \
                  --table ${table} \
                  --port ${this.clients['remote'].port ?? 5432} \
                  --username ${this.clients['remote'].user} \
                  --host ${this.clients['remote'].host} \
                  ${this.clients['remote'].database}"`)
        .on('close', (code: number) => {
          fileWriteStream.close();
          if (code) {
            console.log(`Import of ${table} return error code ${code} with message: ${fs.readFileSync(`.temp/${table}.sql`).toString()}`);
            return resolve(true);
          }

          execSync(`docker run \
            --network host \
            --mount type=bind,source="${process.cwd()}"/.temp/${table}.sql,target=/file.sql \
            -t postgres \
            /bin/bash -c "\
            PGPASSWORD=${this.clients['local'].password} \
                psql \
                    --port ${this.clients['local'].port ?? 5432} \
                    --username ${this.clients['local'].user} \
                    --host ${this.clients['local'].host} \
                    postgres \
                    -f /file.sql"`)

          const dataFileWriteStream = fs.createWriteStream(`.temp/data_${table}.sql`, { flags: 'w' });
          exec(`docker run \
            -t postgres \
            /bin/bash -c "\
            PGPASSWORD=${this.clients['remote'].password} \
              pg_dump \
                --section=data \
                --port ${this.clients['remote'].port ?? 5432} \
                --username ${this.clients['remote'].user} \
                --host ${this.clients['remote'].host} \
                --table ${table} \
                ${this.clients['remote'].database}"`
          )
            .on('close', (code: number) => {
              dataFileWriteStream.close();
              if (code) {
                console.log(`Import of ${table} return error code ${code} with message: ${fs.readFileSync(`.temp/${table}.sql`).toString()}`);
                return resolve(true);
              }

              execSync(`docker run \
                --network host \
                --mount type=bind,source="${process.cwd()}"/.temp/data_${table}.sql,target=/file.sql,readonly \
                -t postgres \
                /bin/bash -c "\
                  PGPASSWORD=${this.clients['local'].password} \
                  psql \
                    --username ${this.clients['local'].user} \
                    --host localhost \
                    -d ${this.clients['local'].database} \
                    -f /file.sql"`
              )

              console.log('Imported table: ', table);
            }).stdout?.pipe(dataFileWriteStream)
        }).stdout?.pipe(fileWriteStream)
      )
    }));

    await new Promise((resolve, reject) => {
      const fileWriteStream = fs.createWriteStream(`.temp/constraints.sql`, { flags: 'w' });
      exec(`docker run \
          -t postgres \
          /bin/bash -c "\
          PGPASSWORD=${this.clients['remote'].password} \
              pg_dump \
                  --section=post-data \
                  --port ${this.clients['remote'].port ?? 5432} \
                  --username ${this.clients['remote'].user} \
                  --host ${this.clients['remote'].host} \
                  ${this.clients['remote'].database}"`)
        .on('close', (code: number) => {
          fileWriteStream.close();
          if (code) {
            return reject(new Error(`Error while tring create dump constraint.`));
          }

          execSync(`docker run \
            --network host \
            --mount type=bind,source="${process.cwd()}"/.temp/constraints.sql,target=/file.sql \
            -t postgres \
            /bin/bash -c "\
            PGPASSWORD=${this.clients['local'].password} \
                psql \
                    --port ${this.clients['local'].port ?? 5432} \
                    --username ${this.clients['local'].user} \
                    --host ${this.clients['local'].host} \
                    postgres \
                    -f /file.sql"`)
          resolve(true);
        }).stdout?.pipe(fileWriteStream)
    })

    console.log('Finished!');
    fs.rmdirSync('.temp', { recursive: true });
    process.exit(0);
  }
}
