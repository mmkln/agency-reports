export const LOCAL_PASSWORD_CREDENTIAL_ALGORITHM = 'local-demo-password-v1'

const PASSWORD_MIN_LENGTH = 8

function requireText(value, fieldName) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalizedValue
}

function createLocalPasswordHash(password, salt) {
  const input = `${salt}:${password}`
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return `${LOCAL_PASSWORD_CREDENTIAL_ALGORITHM}:${(hash >>> 0).toString(16)}`
}

export function validatePasswordPair({ confirmPassword, password }) {
  const normalizedPassword = requireText(password, 'Password')
  const normalizedConfirmPassword = requireText(confirmPassword, 'Password confirmation')

  if (normalizedPassword.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  }

  if (normalizedPassword !== normalizedConfirmPassword) {
    throw new Error('Password confirmation does not match.')
  }

  return normalizedPassword
}

export function findPasswordCredential({ repositories, userId }) {
  return repositories.authCredentials
    ?.list()
    .find((credential) => (
      credential.user_id === userId
      && credential.type === 'password'
      && credential.algorithm === LOCAL_PASSWORD_CREDENTIAL_ALGORITHM
    )) ?? null
}

export function createPasswordCredential({
  idGenerator,
  now = () => new Date().toISOString(),
  password,
  repositories,
  userId,
}) {
  if (!idGenerator) {
    throw new Error('idGenerator is required.')
  }

  const normalizedPassword = requireText(password, 'Password')
  const timestamp = now()
  const existingCredential = findPasswordCredential({ repositories, userId })
  const salt = existingCredential?.salt ?? idGenerator()
  const credential = {
    algorithm: LOCAL_PASSWORD_CREDENTIAL_ALGORITHM,
    created_at: existingCredential?.created_at ?? timestamp,
    id: existingCredential?.id ?? idGenerator(),
    password_hash: createLocalPasswordHash(normalizedPassword, salt),
    salt,
    type: 'password',
    updated_at: timestamp,
    user_id: userId,
  }

  repositories.authCredentials.upsert(credential)

  return credential
}

export function verifyPasswordCredential({ password, repositories, userId }) {
  const credential = findPasswordCredential({ repositories, userId })

  if (!credential) {
    return false
  }

  const normalizedPassword = requireText(password, 'Password')

  return credential.password_hash === createLocalPasswordHash(normalizedPassword, credential.salt)
}
