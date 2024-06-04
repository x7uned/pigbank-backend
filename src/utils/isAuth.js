const isAuth = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization || '';
        const token = authHeader.replace(/^Bearer\s/, '');

        if (!token) {
            return reply.code(401).send({ message: 'Access Denied' });
        }

        const decoded = await request.jwtVerify();

        if (decoded.userId) {
            request.userId = decoded.userId;
        } else {
            return reply.code(401).send({ message: 'Access Denied' });
        }
    } catch (err) {
        console.error('Authentication error:', err);
        return reply.code(401).send({ message: 'Authentication failed' });
    }
};

export default isAuth;