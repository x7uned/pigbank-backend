export const getStats = async (request, reply, clientDB) => {
    try {
        const id = request.userId;

        const result = await clientDB.query('SELECT * FROM owner_data WHERE owner_id = $1', [id]);


        if (result.rows.length === 0) {
            return reply.status(404).send({
                message: 'Data not found',
            });
        }

        const userData = result.rows[0];
        delete userData.card_pin;

        reply.send({ userData });
    } catch (err) {
        console.error(err);
        reply.status(500).send({
            message: 'Internal server error',
        });
    }
};

export const removeCard = async (request, reply, clientDB) => {
    try {
        const id = request.userId;

        const fetchSelectedCard = await clientDB.query('SELECT selected_card FROM owner_data WHERE owner_id = $1', [id]);
        const selectedCard = fetchSelectedCard.rows[0];
        const selectedId = (selectedCard.selected_card)

        await clientDB.query('UPDATE owner_data SET cards = array_remove(cards, $1::text) WHERE owner_id = $2;', [selectedId, id])

        reply.send({ message: 'Card removed successfully', success: true });
    } catch (error) {
        console.error('Error remove card:', error);
        reply.code(500).send({ message: 'Error remove card' });
    }
}

export const selectCard = async (request, reply, clientDB) => {
    try {
        if (!request.body) {
            return reply.status(400).send({ message: 'Body is missing' });
        }

        const userId = request.userId;
        const id = request.body;

        await clientDB.query(
            'UPDATE owner_data SET selected_card = $1 WHERE owner_id = $2',
            [id, userId]
        );

        reply.send({ message: 'Selected card updated successfully', success: true });
    } catch (error) {
        console.error('Error select card:', error);
        reply.code(500).send({ message: 'Error select card' });
    }
}

export const getCards = async (request, reply, clientDB) => {
    try {
        const id = request.userId;

        const fetchCards = await clientDB.query('SELECT cards FROM owner_data WHERE owner_id = $1', [id]);
        const cardIds = fetchCards.rows[0].cards;

        const fetchCardDetails = async (cardId) => {
            const cardDetails = await clientDB.query('SELECT id, card_name, card_number, card_design FROM card_data WHERE id = $1', [cardId]);
            return cardDetails.rows[0];
        };

        const cardDetailsList = await Promise.all(cardIds.map(fetchCardDetails));

        reply.send({ cards: cardDetailsList });
    } catch (error) {
        console.error('Error fetching card details:', error);
        reply.code(500).send({ message: 'Error fetching card details' });
    }
};


export const createStats = async (id, reply, clientDB) => {
    try {
        const insertUserQuery = 'INSERT INTO owner_data (owner_id, selected_card, contacts, cards) VALUES ($1, $2, $3, $4)';
        const insertUserParams = [id, 0, [], []]; 
        await clientDB.query(insertUserQuery, insertUserParams);

        reply.send({ message: 'User registered successfully', success: true });  
    } catch (error) {
        console.error('Error createStats:', error);
        reply.code(500).send({ message: 'Error createStats' });
    }
}

export const setDesignCard = async (request, reply, clientDB) => {
    try {
        if (!request.body) {
            return reply.status(400).send({ message: 'Body is missing' });
        }

        const {design, id} = request.body;

        await clientDB.query('UPDATE card_data SET card_design = $1 WHERE id = $2', [design, id]);

        reply.send({ message: 'Design update successfully', success: true }); 
    } catch (error) {
        console.error('Error setDesignCard:', error);
        reply.code(500).send({ message: 'Error setDesignCard' });
    }
}

export const sendMoney = async (request, reply, clientDB) => {
    try {
        if (!request.body) {
            return reply.status(400).send({ message: 'Body is missing' });
        }

        const { addresserNumber, receiverNumber, sum, comment } = request.body;
        const transactionDate = new Date();
        const userId = request.userId;

        await clientDB.query('BEGIN');

        const addresserDataFetch = await clientDB.query('SELECT card_name, card_number, card_design, balance_value, transactions FROM card_data WHERE card_number = $1', [addresserNumber]);
        const receiverDataFetch = await clientDB.query('SELECT card_name, card_number, card_design, balance_value, transactions FROM card_data WHERE card_number = $1', [receiverNumber]);

        if (addresserDataFetch.rowCount === 0 || receiverDataFetch.rowCount === 0) {
            await clientDB.query('ROLLBACK');
            return reply.status(404).send({ message: 'Addresser or receiver not found' });
        }

        const addresserData = addresserDataFetch.rows[0];
        const receiverData = receiverDataFetch.rows[0];

        if (addresserData.balance_value < sum) {
            await clientDB.query('ROLLBACK');
            return reply.code(400).send({ message: 'Insufficient balance' });
        }

        if (addresserData.card_number == receiverData.card_number) {
            await clientDB.query('ROLLBACK');
            return reply.code(408).send({ message: 'Invalid number' });
        }

        const transactionAddresser = {
            title: `${receiverData.card_name}`,
            text: `Sent: ${comment}`,
            logo: `${receiverData.card_name.slice(0,1)}`,
            date: transactionDate,
            cost: (sum * -1)
        };

        const transactionReceiver = {
            title: `${addresserData.card_name}`,
            text: `Received: ${comment}`,
            logo: `${addresserData.card_name.slice(0,1)}`,
            date: transactionDate,
            cost: sum
        };

        const contactsAddresser = {
            name: `${receiverData.card_name}`,
            avatar: `${receiverData.card_design}`,
            number: `${receiverData.card_number}`
        };

        await clientDB.query('UPDATE card_data SET balance_value = balance_value - $1, transactions = array_append(transactions, $2) WHERE card_number = $3', [sum, transactionAddresser, addresserNumber]);
        await clientDB.query('UPDATE card_data SET balance_value = balance_value + $1, transactions = array_append(transactions, $2) WHERE card_number = $3', [sum, transactionReceiver, receiverNumber]);

        const contactsFetch = await clientDB.query('SELECT contacts FROM owner_data WHERE owner_id = $1', [userId]);
        const currentContacts = contactsFetch.rows[0].contacts;

        const contactExists = currentContacts.some(contact => contact.number === receiverNumber);

        if (!contactExists) {
            await clientDB.query('UPDATE owner_data SET contacts = array_append(contacts, $1) WHERE owner_id = $2', [contactsAddresser, userId]);
        }

        await clientDB.query('COMMIT');

        reply.status(200).send({ message: 'Transaction successful', transactionDate });

    } catch (error) {
        await clientDB.query('ROLLBACK');
        console.error('Error transaction:', error);
        reply.code(500).send({ message: 'Transaction error' });
    }
};

