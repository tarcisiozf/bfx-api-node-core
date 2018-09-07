'use strict'

const debug = require('debug')('bfx:api:ws:events:info')
const _isFinite = require('lodash/isFinite')
const Config = require('../../config')

/**
 * Emits an error if the server reports an incompatible API version. Does not
 * mutate state.
 *
 * @param {Object} state
 * @param {Object} msg
 * @param {number} msg.version - must be 2
 * @return {null} nextState
 */
module.exports = (state = {}, msg = {}) => {
  const { version, code, platform } = msg
  const { emit, ws } = state

  emit('event:info', msg)

  if (_isFinite(version) && version !== 2) {
    const err = new Error(`server not running API v2: v${version}`)

    emit('error', err)
    ws.close()
    return null
  }

  if (platform) {
    const { status } = platform

    debug(
      'server running API v2 (platform: %s (%d))',
      status === 0 ? 'under maintenance' : 'operating normally', status
    )
  }

  if (_isFinite(code)) {
    if (code === Config.INFO_CODES.SERVER_RESTART) {
      debug('server restarted')
      emit('event:info:server-restart')
    } else if (code === Config.INFO_CODES.MAINTENANCE_START) {
      debug('maintenance period started')
      emit('event:info:maintenance-start')
    } else if (code === Config.INFO_CODES.MAINTENANCE_END) {
      debug('maintenance period ended')
      emit('event:info:maintenance-end')
    }
  }

  return null
}