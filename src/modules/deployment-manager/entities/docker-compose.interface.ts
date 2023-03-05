export interface DockerCompose {
  services: Record<string, DockerService>
}

export interface DockerService {
    build: {
      context: string,
      args: Record<string, string>
    }
    hostname: string
    // eslint-disable-next-line camelcase
    env_file: string[]
}
