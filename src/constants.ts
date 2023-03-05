export const ROOT_PATH = process.env.BAAS_ROOT_PATH ?? '.'
// eslint-disable-next-line unicorn/prefer-module
export const PATH_CLI_ROOT = process.env.BAAS_CLI_PATH ?? __dirname
export const CONFIG_PATH = process.env.CONFIG_PATH ?? `${ROOT_PATH}/config`
export const DEST_ENVS_PATH = process.env.BAAS_ENVS_PATH ?? `${CONFIG_PATH}/envs`
export const SECRETS_PATH = process.env.DEST_SECRETS_PATH ?? `${CONFIG_PATH}/secrets`
