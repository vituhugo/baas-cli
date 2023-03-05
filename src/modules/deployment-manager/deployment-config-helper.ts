import {DockerService} from './entities/docker-compose.interface'
import {ROOT_PATH} from '../../constants'
import * as fs from 'node:fs'
import {configFactory} from '../config-manager/config-manager.class'
import {DeploymentConfigEnv} from './entities/deployment-config.interface'

export const DeploymentConfigHelper = {
  getDeploymentByEnv: (service: DockerService, envName: string): DeploymentConfigEnv[] => {
    const deploymentFolder = `${ROOT_PATH}/${service.build}/deployments`
    const files = fs.readdirSync(deploymentFolder)
    const developYamlFile = files.find(file => file.match(new RegExp(`/-${envName}.yml/`)))
    if (!developYamlFile) throw new Error(`deployment of develop not found in folder ${deploymentFolder}`)

    return configFactory(developYamlFile).get<DeploymentConfigEnv[]>('spec.template.spec.containers.0.env')
  },
}
