import { addCard, changePIN, createCard, getCard } from '../service/card.service.js';
import handleValidationErrors from '../utils/handleValidationErrors.js';
import isAuth from '../utils/isAuth.js';

export default function cardRoutes(server, clientDB) {

    server.post('/cards/add', {
        preHandler: [isAuth],
        handler: (request, reply) => addCard(request, reply, clientDB),
    });

    server.post('/cards/create', {
        preHandler: [isAuth],
        handler: (request, reply) => createCard(request, reply, clientDB),
    });

    server.get('/cards/get', {
        preHandler: [isAuth],
        handler: (request, reply) => getCard(request, reply, clientDB),
    });

    server.post('/cards/updatepin', {
        preHandler: [isAuth],
        handler: (request, reply) => changePIN(request,reply,clientDB)
    })
}