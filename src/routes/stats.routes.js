import isAuth from '../utils/isAuth.js';
import { getCards, getStats, removeCard, selectCard, sendMoney, setDesignCard } from '../service/stats.service.js';

export default function dataRoutes(server, clientDB) {
    server.get('/data/me', {
        preHandler: [isAuth],
        handler: (request, reply) => getStats(request, reply, clientDB),
    });

    server.patch('/data/removecard', {
        preHandler: [isAuth],
        handler: (request, reply) => removeCard(request, reply, clientDB),
    });

    server.get('/data/cards', {
        preHandler: [isAuth],
        handler: (request, reply) => getCards(request, reply, clientDB)
    });

    server.post('/data/selectcard', {
        preHandler: [isAuth],
        handler: (request, reply) => selectCard(request, reply, clientDB)
    })

    server.post('/data/setdesign', {
        preHandler: [isAuth],
        handler: (request, reply) => setDesignCard(request, reply, clientDB)
    })

    server.post('/transaction/transfer', {
        preHandler: [isAuth],
        handler: (request, reply) => sendMoney(request, reply, clientDB)
    })
}