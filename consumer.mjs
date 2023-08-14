import Pino from 'pino'

import Nats from './packages/utils/nats.mjs'

const logger = Pino({
  name: 'KeyValueCreator',
})

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
  logger.info('Done. Quitting.')
  process.exit()
}

// Catch term signal and cleanup
process.on('SIGINT', await drain)

try {
  nats = new Nats({
    natsServers: ['localhost:4222', 'localhost:4223', 'localhost:4224'],
  })

  // Connect to NATS
  await nats.connect()
  // Just connection information
  nats.watchConnectionNotifications()
  nats.emitter.on('natsConnectionEvents', (status) => logger.info(status))

  const bucketName = 'status'
  // Create bucket
  const kv = await nats.jetstreamClient.views.kv(bucketName, { history: 5 })

  logger.info(nats.connection?.info)

  const watcher = await kv.watch()

  for await (const k of watcher) {
    console.log(k)
  }

  // const keys = await kv.keys()
  // for await (const k of keys) {
  //   console.log(k)
  // }
} catch (err) {
  logger.error('Error on main:')
  logger.error(err)
}
