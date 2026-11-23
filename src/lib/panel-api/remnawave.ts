import {
  CreateUserCommand,
  GetInternalSquadsCommand,
  GetSubscriptionInfoByShortUuidCommand,
  GetUserByIdCommand,
  GetUserByUsernameCommand,
} from '@remnawave/backend-contract'
import axios, { type AxiosInstance } from 'axios'
import { randomBytes } from 'node:crypto'
import type { User } from 'better-auth'
import { database } from '../database'
import { EXPIRE_NEVER } from './defaults'

export type RemnawavePanelUser = GetSubscriptionInfoByShortUuidCommand.Response['response']
type Binding = { remnawave_uuid: string | null; pending_username: string | null }

export class RemnawaveAPI {
  private client: AxiosInstance
  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({ baseURL: baseUrl, timeout: 15000, headers: { Authorization: `Bearer ${apiKey}`, 'X-Forwarded-For': '127.0.0.1', 'X-Forwarded-Proto': 'https', 'User-Agent': 'Valhallishe-VPN-Portal' } })
  }

  async getOrCreatePanelUser(user: User): Promise<RemnawavePanelUser> {
    // Reserve a cryptographically random name before creating the panel user. A retry
    // recovers a successful but interrupted request without matching existing accounts.
    const name = `vp_${randomBytes(14).toString('hex')}`
    database.prepare('INSERT OR IGNORE INTO vpn_bindings (user_id, pending_username) VALUES (?, ?)').run(user.id, name)
    const binding = database.prepare('SELECT remnawave_uuid, pending_username FROM vpn_bindings WHERE user_id = ?').get(user.id) as Binding
    let panelUser: { uuid: string; shortUuid: string }
    if (binding.remnawave_uuid) {
      const result = await this.client.get(GetUserByIdCommand.url(binding.remnawave_uuid))
      panelUser = result.data.response
    } else {
      if (!binding.pending_username) throw new Error('VPN binding is incomplete; contact administrator')
      const pending = binding.pending_username
      try {
        const result = await this.client.get(GetUserByUsernameCommand.url(pending))
        panelUser = result.data.response
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error
        const squads = await this.client.get(GetInternalSquadsCommand.url)
        const matching = squads.data.response.internalSquads.filter((s: { name: string }) => s.name === 'Default-Squad')
        if (matching.length !== 1) throw new Error('Default-Squad must exist exactly once')
        try {
          const created = await this.client.post(CreateUserCommand.url, {
            username: pending, status: 'ACTIVE', expireAt: EXPIRE_NEVER.toISOString(),
            trafficLimitStrategy: 'NO_RESET', trafficLimitBytes: 0,
            description: 'Created by Valhallishe VPN portal',
            activeInternalSquads: [matching[0].uuid],
          })
          panelUser = created.data.response
        } catch (error) {
          // Another request may have created this exact reserved username.
          if (!axios.isAxiosError(error) || ![400, 409].includes(error.response?.status ?? 0)) throw error
          const result = await this.client.get(GetUserByUsernameCommand.url(pending))
          panelUser = result.data.response
        }
      }
      const result = database.prepare('UPDATE vpn_bindings SET remnawave_uuid = ?, pending_username = NULL WHERE user_id = ? AND pending_username = ?').run(panelUser.uuid, user.id, pending)
      if (!result.changes) throw new Error('VPN binding changed; retry')
    }
    const subscription = await this.client.get(GetSubscriptionInfoByShortUuidCommand.url(panelUser.shortUuid))
    return subscription.data.response
  }
}
