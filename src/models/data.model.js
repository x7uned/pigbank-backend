export const dataValidation = {
    type: 'object',
    properties: {
        ownerId: {
            type: 'number',
            minimum: 1,
        },
        selectedCard: {
            type: 'number',
            minimum: 1,
        },
        contacts: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    contactId: {
                        type: 'number',
                        minimum: 1,
                    },
                },
                required: ['contactId'],
            },
        },
        cards: {
            type: 'array',
            items: {
                type: 'object',
                required: ['cardId'],
                properties: {
                    cardId: {
                        type: 'number',
                        minimum: 1,
                    },
                },
            },
        },
    },
};
