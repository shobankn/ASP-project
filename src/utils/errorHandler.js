class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
    }
}

const handleError = (error) => {
    if (error instanceof CustomError) {
        return error;
    }
    return new CustomError(error.message || 'Something went wrong', 500);
};

module.exports = { handleError, CustomError };