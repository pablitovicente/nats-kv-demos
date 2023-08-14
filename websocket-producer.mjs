import { v4 as uuidv4 } from 'uuid'
import { JSONCodec } from 'nats'
import Pino from 'pino'

import Nats from './packages/utils/nats.mjs'

const jc = JSONCodec()

const logger = Pino({
  name: 'KeyValueCreator',
})
// A variable to have some mutable data
let value = 0

// Cleanup handlers
let nats

const drain = async () => {
  // we want to insure that messages that are in flight
  // get processed, so we are going to drain the
  // connection. Drain is the same as close, but makes
  // sure that all messages in flight get seen
  // by the iterator. After calling drain on the connection
  // the connection closes.
  logger.info('Draining NATS connection...')
  await nats.connection.drain()
  await nats.connection.close()
  logger.info(`Total created pairs: '${value}'`)
  logger.info('Done. Quitting.')
  process.exit()
}

// Catch term signal and cleanup
process.on('SIGINT', await drain)

try {
  nats = new Nats({
    natsWebSocketServers: ['localhost:1443', 'localhost:1444', 'localhost:1445'],
  })

  // Connect to NATS
  await nats.connect()
  // Just connection information
  nats.watchConnectionNotifications()
  nats.emitter.on('natsConnectionEvents', (status) => logger.info(status))

  const bucketName = 'status'
  const keyPrefix = uuidv4()
  // Create bucket
  const kv = await nats.jetstreamClient.views.kv(bucketName, { history: 5 })

  logger.info(nats.connection?.info)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = {
      value,
      created: Date.now(),
    }

    await kv.create(`${keyPrefix}-${value}`, jc.encode(data))

    value += 1
  }
} catch (err) {
  logger.error('Error on main:')
  logger.error(err)
  logger.info(`Total created pairs: '${value}'`)
}
