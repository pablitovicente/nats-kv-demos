# NATS Key/Value Store tests

Quick demo about using [NATS Key/Value Store](https://docs.nats.io/nats-concepts/jetstream/key-value-store) with NodeJS

- Shows usage of Key/Value store over NATS native connection
- Shows usage of Key/Value store over NATS Websocket connection

## Prerequisites

- Docker
- NodeJS 16+

## Setup

- run `docker-compose up` and wait for Nats to start
- run `npm i`
- run `npm i -g pm2`

## How to run?

- Start a producer `pm2 start --name producer producer.mjs` (will generate key/value pairs as fast as possible)
- Start a watcher `node consumer.mjs`
- Scale the producer to several instances `pm2 scale producer 20`
- Start a producer that connects using WebSockets `pm2 start --name wsproducer websocket-producer.mjs` (will generate key/value pairs as fast as possible only difference is that it uses WebSocket for transport)
- Alternatively also scale this producer `pm2 scale wsproducer 20`

## Gotchas

- Demo build late at night so the consumer.mjs will not be able to consume all keys after a couple of million keys (in a real world scenario watching a whole bucket for all keys might not be realistic though)

## Demo setup helpers

- run `watch -n 1 nats kv info status` to look evolution of the 'status' bucket that is created by the producer script.

## TODO

- Add more realistic examples
