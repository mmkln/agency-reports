export const ASYNC_PORTAL_QA_STORAGE_KEY = 'agency-reports.async-qa'

const defaultConfig = Object.freeze({
  failureRate: 0,
  latencyMs: 0,
})

function sleep(ms) {
  if (!ms) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function normalizeConfig(config = {}) {
  const latencyMs = Math.max(0, Number(config.latencyMs) || 0)
  const failureRate = Math.max(0, Math.min(1, Number(config.failureRate) || 0))

  return {
    failureRate,
    latencyMs,
  }
}

function shouldFailRequest(config) {
  return config.failureRate > 0 && Math.random() < config.failureRate
}

export function readAsyncPortalQaConfig(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage) {
    return defaultConfig
  }

  try {
    return normalizeConfig(JSON.parse(storage.getItem(ASYNC_PORTAL_QA_STORAGE_KEY)) ?? defaultConfig)
  } catch {
    return defaultConfig
  }
}

export function writeAsyncPortalQaConfig(config, storage = typeof window !== 'undefined' ? window.localStorage : null) {
  const normalizedConfig = normalizeConfig(config)

  storage?.setItem(ASYNC_PORTAL_QA_STORAGE_KEY, JSON.stringify(normalizedConfig))

  return normalizedConfig
}

export function createAsyncPortalDataClient({
  getConfig = readAsyncPortalQaConfig,
  repositories,
} = {}) {
  async function execute(operation, operationType) {
    const config = normalizeConfig(getConfig())

    await sleep(config.latencyMs)

    if (shouldFailRequest(config)) {
      throw new Error(`Simulated ${operationType} repository failure.`)
    }

    return operation(repositories)
  }

  return {
    read(operation) {
      return execute(operation, 'read')
    },
    repositories,
    write(operation) {
      return execute(operation, 'write')
    },
  }
}
