import bcrypt from 'bcrypt';

export const addCard = async (request, reply, clientDB) => {
    try {
        if (!request.body) {
            return reply.status(400).send({ message: 'Body is missing' });
        }

        const { card_number, card_pin } = request.body;
        const id = request.userId;

        const fetchResult = await clientDB.query('SELECT * FROM card_data WHERE card_number = $1', [card_number]);
        const card = fetchResult.rows[0];

        if (!card) {
            return reply.code(404).send({ message: 'Card not found' });
        }

        const card_pin_str = String(card_pin);
        const isPINCorrect = await bcrypt.compare(card_pin_str, card.card_pin);

        if (!isPINCorrect) {
            return reply.code(401).send({ message: 'Incorrect pin code' });
        } else {
            const checkCardExists = await clientDB.query(`
                SELECT 1 
                FROM owner_data 
                WHERE owner_id = $1 AND $2 = ANY(cards)
            `, [id, String(card.id)]);

            if (checkCardExists.rowCount > 0) {
                return reply.code(409).send({ message: 'Card already added' });
            }

            await clientDB.query(
            `UPDATE owner_data 
            SET cards = COALESCE(cards, '{}') || $1::text
            WHERE owner_id = $2`, 
            [String(card.id), id]);
        }

        await clientDB.query(
            'UPDATE owner_data SET selected_card = $1 WHERE owner_id = $2',
            [String(card.id), id]
        );

        reply.send({ message: 'Card access successful', success: true });
    } catch (error) {
        console.error(error);
        reply.status(500).send({
            message: 'Internal server error #card',
        });
    }
}

export const getCard = async (request, reply, clientDB) => {
    try {
        const owner_id = request.userId;

        const findUserReq = await clientDB.query('SELECT * FROM owner_data WHERE owner_id = $1', [owner_id]);
        const findUser = findUserReq.rows[0]

        const selectedCardId = String(findUser.selected_card);

        if (!findUser.cards.includes(selectedCardId)) {
            reply.status(403).send({
                message: 'Card no access',
            });
        }

        const resultReq = await clientDB.query('SELECT * FROM card_data WHERE id = $1', [selectedCardId])
        const result = resultReq.rows[0];
        delete result.card_pin

        reply.send({ message: 'Card get successful', data: result, success: true });
    } catch (error) {
        console.error(error);
        reply.status(500).send({
            message: 'Internal server error #card',
        });
    }
}

export const createCard = async (request, reply, clientDB) => {
    try {
        const owner_id = request.userId;

        if (!request.body) {
            return reply.status(400).send({ message: 'Body is missing' });
        }

        const { card_number, card_pin, card_name } = request.body;
        const created_at = new Date();

        const card_pin_str = String(card_pin); // Преобразование в строку
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(card_pin_str, salt);

        const fetchResult = await clientDB.query('INSERT INTO card_data (owner_id, card_name, card_number, balance_value, transactions, card_pin, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id', 
        [owner_id, card_name, card_number, 0, [], hash, created_at]);
        const id = fetchResult.rows[0].id;

        reply.send({ message: 'Card access successful', id , success: true });
    } catch (error) {
        console.error(error);
        reply.status(500).send({
            message: 'Internal server error #card',
        });
    }
}