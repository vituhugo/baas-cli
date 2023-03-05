import {ConfigPort} from '../config.port'
import * as yaml from 'js-yaml'
import * as fs from 'node:fs'
import * as path from 'node:path'

export class ConfigYamlAdapter<T> implements ConfigPort<T> {
  private readonly path: string;
  private data: T;

  constructor(path: string) {
    if (!fs.existsSync(path)) {
      throw new Error(`File ${path} does not exists.`)
    }

    this.path = path
    this.data = yaml.load(fs.readFileSync(path).toString()) as T
  }

  get<R>(propPath: string): R {
    // eslint-disable-next-line unicorn/no-array-reduce
    return propPath.split('.').reduce((carry, item) => {
      if (!carry[item]) return null
      return carry[item]
    }, this.data as any) as R
  }

  getKeys(propPath: string): string[] {
    return Object.keys(this.get(propPath))
  }

  getAll<R>(propPath: string): R[] {
    return [this.get(propPath)]
  }

  save(): T {
    fs.writeFileSync(this.path, yaml.dump(this.data))
    return this.data
  }

  set(value: unknown | T, propPath: string): void {
    if (!propPath) {
      this.data = value as T
      return
    }

    // eslint-disable-next-line unicorn/no-array-reduce
    return propPath.split('.').reduce((carry, item) => {
      if (!carry[item]) return null
      return carry[item]
    }, this.data as any)
  }

  static load<T>(filePath: string): ConfigPort<T> {
    return new ConfigYamlAdapter(filePath)
  }

  static loadFromDir<T>(dirPath: string): { fileName: string, config: ConfigPort<T> }[] {
    if (!fs.existsSync(dirPath)) throw new Error(`The folder in ${dirPath} does not exists.`)
    return fs.readdirSync(dirPath).map(filePath => ({
      fileName: path.basename(filePath),
      config: ConfigYamlAdapter.load<T>(filePath),
    }))
  }
}
