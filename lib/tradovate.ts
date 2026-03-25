import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'midas-ai-default-key-32-chars!!'
const IV_LENGTH = 16

export function encryptCredentials(data: object): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decryptCredentials(encrypted: string): Record<string, string> {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const [ivHex, encryptedHex] = encrypted.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encryptedBuf = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  const decrypted = Buffer.concat([decipher.update(encryptedBuf), decipher.final()])
  return JSON.parse(decrypted.toString())
}

export type TradovateEnvironment = 'demo' | 'live'

function getBaseUrl(environment: TradovateEnvironment): string {
  return environment === 'demo'
    ? 'https://demo.tradovateapi.com/v1'
    : 'https://live.tradovateapi.com/v1'
}

export interface TradovateAuthResult {
  accessToken: string
  mdAccessToken?: string
  expirationTime: string
  userId: number
  name: string
}

export async function tradovateAuth(
  username: string,
  password: string,
  environment: TradovateEnvironment,
  appId?: string,
  appVersion?: string,
  deviceId?: string,
  cid?: string,
  sec?: string
): Promise<TradovateAuthResult> {
  const baseUrl = getBaseUrl(environment)

  const body: Record<string, string> = {
    name: username,
    password,
    appId: appId || 'Sample App',
    appVersion: appVersion || '1.0',
    deviceId: deviceId || crypto.randomUUID(),
  }

  if (cid) body.cid = cid
  if (sec) body.sec = sec

  const res = await fetch(`${baseUrl}/auth/accesstokenrequest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Tradovate auth failed: ${res.status} ${text}`)
  }

  const data = await res.json()

  if (data['p-ticket'] || data.errorText) {
    throw new Error(data.errorText || 'Authentication failed — check credentials')
  }

  if (!data.accessToken) {
    throw new Error('No access token returned from Tradovate')
  }

  return {
    accessToken: data.accessToken,
    mdAccessToken: data.mdAccessToken,
    expirationTime: data.expirationTime,
    userId: data.userId,
    name: data.name,
  }
}

export interface TradovateAccount {
  id: number
  name: string
  userId: number
  accountType: string
  active: boolean
  clearingHouseId: number
  riskCategoryId: number
  autoLiqProfileId: number
  marginAccountType: string
  legalStatus: string
  timestamp: string
}

export async function fetchTradovateAccounts(
  accessToken: string,
  environment: TradovateEnvironment
): Promise<TradovateAccount[]> {
  const baseUrl = getBaseUrl(environment)
  const res = await fetch(`${baseUrl}/account/list`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch accounts: ${res.status}`)
  }

  return res.json()
}

export interface TradovateFill {
  id: number
  orderId: number
  contractId: number
  timestamp: string
  tradeDate: { year: number; month: number; day: number }
  action: 'Buy' | 'Sell'
  qty: number
  price: number
  active: boolean
  finallyPaired: number
}

export async function fetchTradovateFills(
  accessToken: string,
  environment: TradovateEnvironment,
  accountId?: number
): Promise<TradovateFill[]> {
  const baseUrl = getBaseUrl(environment)
  const url = accountId
    ? `${baseUrl}/fill/deps?masterid=${accountId}`
    : `${baseUrl}/fill/list`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch fills: ${res.status}`)
  }

  return res.json()
}

export interface TradovateOrder {
  id: number
  accountId: number
  contractId: number
  timestamp: string
  action: 'Buy' | 'Sell'
  ordStatus: string
  executionProviderId?: number
  ocoId?: number
  parentId?: number
  linkedId?: number
  admin: boolean
}

export async function fetchTradovateOrders(
  accessToken: string,
  environment: TradovateEnvironment,
  accountId?: number
): Promise<TradovateOrder[]> {
  const baseUrl = getBaseUrl(environment)
  const url = accountId
    ? `${baseUrl}/order/deps?masterid=${accountId}`
    : `${baseUrl}/order/list`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`)
  }

  return res.json()
}
