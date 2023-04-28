import {Command} from '@oclif/core'
import {exec} from 'child_process'
import {execSync} from 'node:child_process'

export default class ImportRabbitmqCommand extends Command {
  description = 'Import rabbitmq info';

  run(): Promise<any> {
    execSync('rabbitmqctl export_definitions /path/to/definitions.file.json')

    return Promise.resolve(undefined)
  }
}
