import {Args, Command} from '@oclif/core'
import * as fs  from 'node:fs'
import {load, dump} from 'js-yaml'
import {CONFIG_PATH, DEST_ENVS_PATH, SECRETS_PATH, ROOT_PATH} from '../../constants'
import {DockerCompose} from '../../modules/deployment-manager/entities/docker-compose.interface'
import {
  DeploymentConfigEnv,
} from '../../modules/deployment-manager/entities/deployment-config.interface'
import * as dotenv from 'dotenv'
import {SkipException} from '../../modules/skip.exception'

export default class LoadCommand extends Command {
  static description = 'load cluster config'
  static args = {
    service: Args.string(),
  }

  private dockerComposeConfig: DockerCompose = load(fs.readFileSync(`${ROOT_PATH}/docker-compose.yml`).toString()) as DockerCompose;
  private secrets = this.loadSecrets();
  private loadConfig = load(fs.readFileSync(`${CONFIG_PATH}/load.config.yml`).toString()) as any;

  async run(): Promise<void> {
    this.dockerComposeConfig = load(fs.readFileSync(`${ROOT_PATH}/docker-compose.yml`).toString()) as DockerCompose
    const {args: {service}} = await this.parse(LoadCommand)

    if (service) {
      this.refreshSecrets(service)
      this.refreshEnv(service)
      this.updateDockerCompose(service)

      return
    }

    for (const property in this.dockerComposeConfig.services) {
      if (!Object.prototype.hasOwnProperty.call(this.dockerComposeConfig.services, property)) continue
      try {
        this.refreshSecrets(property)
        this.refreshEnv(property)
        this.updateDockerCompose(property)
      } catch (error) {
        if (error instanceof SkipException) {
          console.log(error.message)
          continue
        }

        console.error(error)
      }
    }

    fs.writeFileSync(`${ROOT_PATH}/docker-compose.override.yml`, dump(this.dockerComposeConfig))
  }

  private refreshSecrets(serviceName: string) {
    const service = this.dockerComposeConfig.services[serviceName]
    const servicePath = `${ROOT_PATH}/${service.build.context}`
    if (!fs.existsSync(`${servicePath}/deployments`)) {
      throw new SkipException(`${serviceName} no deployments file, SKIP!`)
    }

    const files = fs.readdirSync(`${servicePath}/deployments`)
    const developYamlFile = files.find(file => file.match(/-develop(ment)?.ya?ml/))
    if (!developYamlFile) {
      throw new SkipException(`${serviceName} no develop file, SKIP!`)
    }

    const doc = load(fs.readFileSync(`${servicePath}/deployments/${developYamlFile}`).toString()) as any

    const developEnvs = doc.spec.template?.spec.containers[0].env ?? doc.spec.jobTemplate?.spec.template.spec.containers[0].env

    const refresedSecrets = []
    for (const config of developEnvs) {
      if (!config.valueFrom) continue
      const {name, key} = config.valueFrom.secretKeyRef
      refresedSecrets.push(name)
      if (!this.secrets[name]) this.secrets[name] = {}
      if (typeof this.secrets[name][key] === 'undefined') this.secrets[name][key] = this.loadConfig.secret[key] ?? this.tryFillByEnvExample(serviceName, key) ?? ''
    }

    for (const secretName of refresedSecrets) {
      for (const prop of Object.keys(this.secrets[secretName])) {
        this.secrets[secretName][prop] = this.loadConfig.replace[this.secrets[secretName][prop]] ?? this.secrets[secretName][prop]
      }
    }

    for (const secretName of refresedSecrets) {
      fs.writeFileSync(`${SECRETS_PATH}/${secretName}.env`, this.envToString(this.secrets[secretName]))
    }
  }

  private loadSecrets() {
    const secrets: Record<string, Record<string, string>> = {}
    const files = fs.readdirSync(SECRETS_PATH)
    for (const file of files) {
      secrets[file.replace('.env', '')] = dotenv.parse(fs.readFileSync(`${SECRETS_PATH}/${file}`).toString()) as Record<string, string>
    }

    return secrets
  }

  private loadEnv(path: string): Record<string, string> {
    if (!fs.existsSync(path)) return {}
    return dotenv.parse(fs.readFileSync(path))
  }

  private envToString(env: Record<string, string>) {
    return Object.keys(env).map(prop => `${prop}="${env[prop]}"`).join('\n')
  }

  private getDeploymentDevEnvs(servicePath: string): DeploymentConfigEnv[] {
    if (!fs.existsSync(`${servicePath}/deployments`)) {
      throw new SkipException(`${servicePath} no deployments file, SKIP!`)
    }

    const files = fs.readdirSync(`${servicePath}/deployments`)
    const developYamlFile = files.find(file => file.match(/-develop(ment)?.ya?ml/))
    if (!developYamlFile) throw new SkipException('Algo de errado não está certo.')
    const doc = load(fs.readFileSync(`${servicePath}/deployments/${developYamlFile}`).toString()) as any

    return doc.spec?.template?.spec.containers[0].env ?? doc.spec?.jobTemplate.spec.template.spec.containers[0].env
  }

  private getDeploymentDevSecretNames(servicePath: string) {
    const envs = this.getDeploymentDevEnvs(servicePath)
    return envs
    .filter(env => env.valueFrom)
    .map(env => `${SECRETS_PATH}/${(env.valueFrom as any).secretKeyRef.name}.env`)
    .filter((item, index, self) => self.indexOf(item) === index)
  }

  private refreshEnv(serviceName: string) {
    const service = this.dockerComposeConfig.services[serviceName]
    const deploymentEnvs = this.getDeploymentDevEnvs(`${ROOT_PATH}/${service.build.context}`)
    const envConfig = this.loadEnv(`${DEST_ENVS_PATH}/${serviceName}.env`)
    if (this.isApi(serviceName)) envConfig.VIRTUAL_HOST = this.getVirtualHost(serviceName)

    for (const item of deploymentEnvs
    .filter(item => !envConfig[item.name ?? (item.valueFrom as any).secretKeyRef.key])) {
      if (item.valueFrom) continue
      envConfig[item.name] = item.value as string
    }

    for (const prop of Object.keys(envConfig)) {
      envConfig[prop] = this.loadConfig.replace[envConfig[prop]] ?? envConfig[prop]
    }

    fs.writeFileSync(`${DEST_ENVS_PATH}/${serviceName}.env`, this.envToString({...envConfig, ...this.loadConfig.environment}))
  }

  private updateDockerCompose(serviceName: string) {
    // eslint-disable-next-line camelcase
    this.dockerComposeConfig.services[serviceName].env_file = [
      `${DEST_ENVS_PATH}/${serviceName}.env`,
      ...this.getDeploymentDevSecretNames(`${ROOT_PATH}/${this.dockerComposeConfig.services[serviceName].build.context}`),
      ...(this.dockerComposeConfig.services[serviceName].env_file ?? []),
    ].filter((item, index, self) => self.indexOf(item) === index)
  }

  private tryFillByEnvExample(serviceName: string, envName: string) {
    const serviceRootPath = `${ROOT_PATH}/${this.dockerComposeConfig.services[serviceName].build.context}`
    if (!fs.existsSync(`${serviceRootPath}/.env.example`)) return null

    const envExample = dotenv.parse(fs.readFileSync(`${serviceRootPath}/.env.example`).toString())
    return envExample[envName] ?? null
  }

  private isApi(serviceName: string) {
    return /(_apis_|_api$)/.test(serviceName)
  }

  private getVirtualHost(serviceName: string) {
    return serviceName.replace('services_', '').split('_')[0] + '.localhost'
  }
}
