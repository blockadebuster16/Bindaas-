const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        // Override with parsed data to ensure type casting/coercion from Zod is preserved
        if (parsed.body) req.body = parsed.body;
        if (parsed.query) req.query = parsed.query;
        if (parsed.params) req.params = parsed.params;
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors ? err.errors.map(e => ({ path: e.path.join('.'), message: e.message })) : err.message
        });
    }
};

module.exports = validate;
