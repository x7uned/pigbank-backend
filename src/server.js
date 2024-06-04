import fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import userRoutes from './routes/user.routes.js';
import dataRoutes from './routes/stats.routes.js';
import cardRoutes from './routes/card.routes.js';

dotenv.config();

const { Client } = pkg;

const server = fastify({ logger: false });

const connectToDatabase = async () => {
    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });

        await client.connect();
        console.log('Connected to the database');
        return client;
    } catch (err) {
        console.error(`Database connection error: ${err}`);
    }
};

const fixCORS = async () => {
    try {
        await server.register(fastifyCors, {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
    } catch (error) {
        console.log(`CORS Error: ${error}`);
    }
};

const jwtReg = async () => {
    try {
        await server.register(fastifyJwt, {
            secret: process.env.JWT_TOKEN,
        });
    } catch (error) {
        console.log(`jwtReg Error: ${error}`);
    }
};

const startServer = async () => {
    const clientDB = await connectToDatabase();

    await fixCORS();
    await jwtReg();

    userRoutes(server, clientDB);
    dataRoutes(server, clientDB);
    cardRoutes(server, clientDB);

    server.listen({ port: 2722, host: 'localhost' }, (err, address) => {
        if (err) {
            server.log.error(err);
            process.exit(1);
        }
        console.log(`Server listening on ${address}`);
    });
};

startServer();