const fastify = require('fastify');
const fastifyPostgres = require('@fastify/postgres');
const fastifyCors = require('@fastify/cors');
const dotenv = require('dotenv');

const server = fastify({ logger: false });
dotenv.config();

const connectToDatabase = async () => {
    try {
        await server.register(fastifyPostgres, {
            connectionString: process.env.DATABASE_URL,
        });
        console.log(`DB OK`);
    } catch (err) {
        console.log(`DB ${err}`);
    }
}

server.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Разрешенные методы
    allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
});

connectToDatabase();

server.get('/checkDB', async (request, reply) => {
    const client = await server.pg.connect();
    try {
        const result = await client.query('SELECT * FROM User');
        reply.send(result.rows);
    } finally {
        client.release();
    }
});

server.get('/', async (request, reply) => {
    reply.send({ message: 'Fastify Server by x7uned' });
});

server.post('/auth/reg', async (request, reply) => {
    const requestBody = request.body;
    reply.send({ message: 'Received', data: requestBody });
});

server.listen({ port: 2722, host: 'localhost' }, (err, address) => {
    if (err) {
        server.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});
