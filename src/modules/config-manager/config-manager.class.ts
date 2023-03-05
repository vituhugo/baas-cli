import * as path from 'node:path'
import {ConfigEnvAdapter} from './adapters/config-env.adapter'
import {ConfigPort} from './config.port'
import {ConfigYamlAdapter} from './adapters/config-yaml.adapter'

export function configFactory<T>(filePath: string): ConfigPort<T> {
  if (path.extname(filePath) === '.env') {
    return new ConfigEnvAdapter(filePath) as any as ConfigPort<T>
  }

  if (['.yml', '.yaml'].includes(path.extname(filePath))) {
    return new ConfigYamlAdapter<T>(filePath)
  }

  throw new Error(`Adapter from file ${filePath} does not exist.`)
}
