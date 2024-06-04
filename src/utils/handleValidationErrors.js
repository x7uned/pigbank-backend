const handleValidationErrors = (request, reply, done) => {
    if (request.validationError) {
        reply.code(400).send({ error: request.validationError.message });
    } else {
        done();
    }
};

export default handleValidationErrors;