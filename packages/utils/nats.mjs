import { connect, consumerOpts } from 'nats'
import { EventEmitter } from 'events'

export default class Nats {
  constructor (options) {
    this.natsServers = options.natsServers
    this.connection = undefined
    this.jetstreamClient = undefined
    this.emitter = new EventEmitter()
  }

  async connect () {
    // Connect
    this.connection = await connect({
      servers: this.natsServers,
    })
    // Setup stream manager
    await this.getJetstreamManager()
    // Setup Jetstream client
    this.jetstreamClient = await this.connection.jetstream()
  }

  async getJetstreamManager () {
    this.streamManager = await this.connection?.jetstreamManager()
  }

  async createStream (streamConfig) {
    const newStream = await this.streamManager?.streams.add(streamConfig)
    return newStream
  }

  async createConsumer (streamName, consumerConfig) {
    const consumer = await this.streamManager?.consumers.add(streamName, consumerConfig)
    return consumer
  }

  // eslint-disable-next-line class-methods-use-this
  getLocalConsumerOpts (queueName, durableConsumerName, stream) {
    const opts = consumerOpts()
    opts.queue(queueName)
    opts.bind(stream, durableConsumerName)
    return opts
  }

  async watchConnectionNotifications () {
    for await (const status of this.connection.status()) {
      this.emitter.emit('natsConnectionEvents', `NATS Connection ${status.type}: ${status.data}`)
      this.emitter.emit('natsConnectionEvents', {
        status: `Nats Connection: ${status.type}`,
        data: status.data,
      })
    }
  }
}
