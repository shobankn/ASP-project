module.exports = (fn) => {
    return (req, res, next) => {
      try {
        const promise = fn(req, res, next);
  
        if (!promise || !promise.catch) {
          // If the route handler doesn't return a promise, continue to the next middleware
          return next();
        }
  
        promise.catch(next);
      } catch (error) {
        // If there's a synchronous error, forward it to the error handling middleware
        next(error);
      }
    };
  };
  