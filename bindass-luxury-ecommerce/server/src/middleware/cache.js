const cacheControl = (req, res, next) => {
    // Stale-While-Revalidate caching strategy
    res.set('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400');
    next();
};

module.exports = { cacheControl };
