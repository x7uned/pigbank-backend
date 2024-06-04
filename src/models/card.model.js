export const cardValidation = {
    type: 'object',
    required: ['ownerId', 'card_pin', 'card_number', 'card_name'],
    properties: {
        owner_id: {
            type: 'number',
            minimum: 1,
        },
        card_name: {
            type: 'string',
            minLength: 1
        },
        card_number: {
            type: 'number',
            minimum: 100000000000,
            maximum: 999999999999
        },
        balance_value: {
            type: 'number',
            default: 0
        },
        transactions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1
                    },
                    subTitle: {
                        type: 'string',
                    },
                    date: {
                        type: 'string',
                        format: 'date-time'
                    },
                    value: {
                        type: 'number',
                        default: 0
                    }
                },
                required: ['title']
            }
        },
        card_pin: {
            type: 'string',
            minLength: 4,
            maxLength: 4
        },
        created_at: {
            type: 'string',
            format: 'date-time'
        }
    },
};
