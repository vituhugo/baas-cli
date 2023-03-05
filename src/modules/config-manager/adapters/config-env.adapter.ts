import {ConfigPort} from '../config.port'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as dotenv from 'dotenv'

export class ConfigEnvAdapter implements ConfigPort<Record<string, string>> {
  private readonly path: string;
  private data: Record<string, string>;

  constructor(path: string) {
    if (!fs.existsSync(path)) {
      throw new Error(`File ${path} does not exists.`)
    }

    this.path = path
    this.data = dotenv.parse(fs.readFileSync(path).toString())
  }

  get<R = any>(propPath: string): R {
    return this.data[propPath] as R
  }

  getKeys(propPath: string): string[] {
    return Object.keys(this.get(propPath))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAll<R>(propPath: string): R[] {
    return []
  }

  save(): Record<string, string> {
    const content = Object.keys(this.data).map(prop => `${prop}=${this.data[prop]}`).join('\n')
    fs.writeFileSync(this.path, content)
    return this.data
  }

  set(value: { toString(): string }, propPath: string): void {
    this.data[propPath] = value.toString()
  }

  static load(filePath: string): ConfigPort<Record<string, string>> {
    return new ConfigEnvAdapter(filePath)
  }

  static loadFromDir(dirPath: string): { fileName: string, config: ConfigPort<Record<string, string>> }[] {
    if (!fs.existsSync(dirPath)) throw new Error(`The folder in ${dirPath} does not exists.`)
    return fs.readdirSync(dirPath).map((filePath: string) => ({
      fileName: path.basename(filePath),
      config: ConfigEnvAdapter.load(filePath),
    }))
  }
}
