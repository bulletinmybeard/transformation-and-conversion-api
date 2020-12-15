const Redis = require('ioredis');

const redisConfig = {
    url: `rediss://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    maxRetriesPerRequest: 1,
    ttl: 86400, // time to live is set to 1 day (86400 seconds).
    family: 4, // 4 (IPv4) or 6 (IPv6).
    db: 0, // Instance number.
    no_ready_check: true,
    retry_strategy: (options) => {
        if (options && options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }

        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error('Retry time exhausted');
        }

        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }

        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    },
};

let redisClient = null;
try {
    redisClient = new Redis(redisConfig);

    redisClient.on('connect', () => {
        console.log('connext to redis host');
    });

    redisClient.on('end', () => {
        console.log('redis connection has closed');
    });

    redisClient.on('ready', () => {
        console.log('redis is ready');
    });

    redisClient.on('reconnecting', () => {
        console.log('redis is reconnecting');
    });

    redisClient.on('error', (err) => {
        console.error('redis error', err.message);
    });
} catch (err) {
    throw Error(err);
}

module.exports = redisClient;
