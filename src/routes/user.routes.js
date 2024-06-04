import handleValidationErrors from '../utils/handleValidationErrors.js';
import isAuth from '../utils/isAuth.js';
import { loginValidation, registrationValidation } from '../models/user.model.js';
import { loginService, registerService, getMe, logService } from '../service/user.service.js';

export default function userRoutes(server, clientDB) {
    server.get('/', {
        preHandler: [isAuth],
        handler: (req, rep) => logService(req, rep),
    });

    server.get('/auth/me', {
        preHandler: [isAuth],
        handler: (request, reply) => getMe(request, reply, clientDB),
    });

    server.post('/auth/login', {
        schema: { body: loginValidation },
        preHandler: handleValidationErrors,
        handler: (request, reply) => loginService(request, reply, clientDB),
    });

    server.post('/auth/register', {
        schema: { body: registrationValidation },
        preHandler: handleValidationErrors,
        handler: (request, reply) => registerService(request, reply, clientDB),
    });
}