# NATS Key/Value Store tests

Quick demo about using [NATS Key/Value Store](https://docs.nats.io/nats-concepts/jetstream/key-value-store) with NodeJS

## Prerequisites

- Docker
- NodeJS 16+

## Setup

- run `docker-compose up` and wait for Nats to start
- run `npm i`
- run `npm i -g pm2`

## How to run?

- Start a process `pm2 start --name producer producer.mjs`
- Start a watcher `node consumer.mjs`
- Scale the producer to several instances `pm2 scale producer 60`

## Gotchas

- Demo build late at night so the consumer.mjs will not be able to consume all keys after a couple of million keys (in a real world scenario watching a whole bucket for all keys might not be realistic though)

## Demo setup helpers

- run `watch -n 1 nats kv info status` to look evolution of the 'status' bucket that is created by the producer script.

## TODO

- Add connection over WS
- Add more realistic examples
