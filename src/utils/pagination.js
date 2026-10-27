function validatePagination(page, limit) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return { valid: false, error: "page and limit must be positive integers" };
    }
    return { valid: true };
}

function getPaginationParams(page, limit) {
    const validatedPage = parseInt(page) || 1;
    const validatedLimit = parseInt(limit) || 10;
    const finalLimit = validatedLimit > 50 ? 50 : validatedLimit;
    return { page: validatedPage, limit: finalLimit };
}

module.exports = {
    validatePagination,
    getPaginationParams
};
