export const loginValidation = {
    type: 'object',
    required: ['password'],
    properties: {
        email: {
            type: 'string',
            format: 'email',
            nullable: true, // email может быть опциональным
        },
        phone: {
            type: 'string',
            nullable: true, // phone может быть опциональным
        },
        password: {
            type: 'string',
            minLength: 6,
        },
    },
    oneOf: [
        {
            required: ['email'],
        },
        {
            required: ['phone'],
        },
    ],
};

export const registrationValidation = {
    type: 'object',
    required: ['firstName', 'secondName', 'password'],
    properties: {
        phone: {
            type: 'string',
            nullable: true,
        },
        firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 16,
        },
        secondName: {
            type: 'string',
            minLength: 2,
            maxLength: 16,
        },
        password: {
            type: 'string',
            minLength: 6,
            maxLength: 16,
        },
        email: {
            type: 'string',
            format: 'email',
            nullable: true, 
        },
    },
    oneOf: [
        {
            required: ['phone'],
        },
        {
            required: ['email'],
        },
    ],
};