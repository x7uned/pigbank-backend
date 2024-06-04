import bcrypt from 'bcrypt';
import { createStats } from './stats.service.js';

export const logService = (req, rep) => {
    rep.send({ message: 'Fastify Server by x7uned' });
}

export const registerService = async (request, reply, clientDB) => {
    if (!request.body) {
        return reply.status(400).send({ message: 'Body is missing' });
    }

    const { firstName, secondName, password, phone, email } = request.body;

    // Проверка существования пользователя по phone или email
    const userExistsQuery = 'SELECT * FROM users WHERE phone = $1 OR email = $2';
    const userExistsParams = [phone || null, email || null];
    const userExists = await clientDB.query(userExistsQuery, userExistsParams);
    
    if (userExists.rows.length > 0) {
        return reply.code(400).send({ message: 'Phone or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const insertUserQuery = 'INSERT INTO users (first_name, second_name, password, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const insertUserParams = [firstName, secondName, hashedPassword, phone || null, email || null];
        
        const result = await clientDB.query(insertUserQuery, insertUserParams);
        const id = result.rows[0].id;

        await createStats(id, reply, clientDB)
        
        reply.send({ message: 'User registered successfully', success: true }); 
    } catch (err) {
        // Обработка ошибки кода `22001`
        if (err.code === '22001') {
            reply.code(400).send({ message: 'Input data too long for the column' });
        } else {
            console.error('Error registering user:', err);
            reply.code(500).send({ message: 'Error registering user' });
        }
    } 
};


export const loginService = async (request, reply, clientDB) => {
    if (!request.body) {
        return reply.status(400).send({ message: 'Body is missing' });
    }

    const { email, password } = request.body;
    
    // Поиск пользователя по email
    const result = await clientDB.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
        return reply.code(404).send({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return reply.code(401).send({ message: 'Incorrect password' });
    }

    const token = await reply.jwtSign({ userId: user.id }, { expiresIn: '3d' });

    // Отправка токена и сообщения об успешном входе
    reply.send({ message: 'Login successful', token, success: true });
};

export const getMe = async (request, reply, clientDB) => {
    try {
        const id = request.userId;

        const result = await clientDB.query('SELECT * FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return reply.status(404).send({
                message: 'User not found',
            });
        }

        const userData = result.rows[0];
        delete userData.password;

        reply.send({ userData });
    } catch (err) {
        console.error(err);
        reply.status(500).send({
            message: 'Internal server error',
        });
    }
};

