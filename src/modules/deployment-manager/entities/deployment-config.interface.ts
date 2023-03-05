// doc.spec.template.spec.containers[0].env
export interface DeploymentConfig { spec: DeploymentSpec | DeploymentJobSpec }

export interface DeploymentSpec {
  template: {
    spec: {
      containers: {
        env: DeploymentConfigEnv[]
      }[]
    }
  }
}

export interface DeploymentJobSpec {
  jobTemplate: {
    spec: DeploymentSpec
  }
}

export interface DeploymentConfigEnv {
  name: string,
  value?: string,
  valueFrom?: {
    secretKeyRef: {
      name: string,
      key: string
    }
  }
}
