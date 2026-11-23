const assert = require('node:assert/strict')
const { createServer } = require('node:http')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { createJiti } = require('jiti')

const directory = mkdtempSync(join(tmpdir(), 'vpn-portal-test-'))
process.env.DATABASE_PATH = join(directory, 'auth.sqlite')
const jiti = createJiti(__filename)
const { database } = jiti('../src/lib/database.ts')
const { RemnawaveAPI } = jiti('../src/lib/panel-api/remnawave.ts')
let creates = 0
let lookedUpId = false
let panelUsername
const server = createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  assert.equal(req.headers.authorization, 'Bearer test-token')
  assert.equal(req.headers['x-forwarded-proto'], 'https')
  let response
  if (req.url.startsWith('/api/users/by-username/')) {
    res.statusCode = 404
    response = {}
  } else if (req.url === '/api/internal-squads/') {
    response = { response: { internalSquads: [{ name: 'Default-Squad', uuid: 'test-squad' }] } }
  } else if (req.url === '/api/users/' && req.method === 'POST') {
    let body = ''
    for await (const chunk of req) body += chunk
    const request = JSON.parse(body)
    assert.equal(request.trafficLimitBytes, 0)
    assert.equal(request.trafficLimitStrategy, 'NO_RESET')
    assert.deepEqual(request.activeInternalSquads, ['test-squad'])
    panelUsername = request.username
    creates++
    response = { response: { id: 42, shortUuid: 'short-id' } }
  } else if (req.url === '/api/users/42') {
    lookedUpId = true
    response = { response: { id: 42, shortUuid: 'short-id' } }
  } else if (req.url === '/api/sub/short-id/info') {
    response = { response: { isFound: true, subscriptionUrl: 'https://example.test/sub', user: {} } }
  } else {
    res.statusCode = 500
    response = {}
  }
  res.end(JSON.stringify(response))
})
server.listen(0, '127.0.0.1', async () => {
  try {
    const api = new RemnawaveAPI(`http://127.0.0.1:${server.address().port}`, 'test-token')
    const user = { id: 'auth-user-1' }
    const first = await api.getOrCreatePanelUser(user)
    assert.equal(first.subscriptionUrl, 'https://example.test/sub')
    assert.match(panelUsername, /^vp_[0-9a-f]{28}$/)
    await api.getOrCreatePanelUser(user)
    assert.equal(creates, 1)
    assert.equal(lookedUpId, true)
    database.prepare('INSERT INTO vpn_bindings (user_id, remnawave_id) VALUES (?, ?)').run('auth-user-2', 99)
    assert.throws(() => database.prepare('INSERT INTO vpn_bindings (user_id, remnawave_id) VALUES (?, ?)').run('auth-user-3', 99))
    console.log('Remnawave creation, reuse, and duplicate binding checks passed')
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    server.close()
    database.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
