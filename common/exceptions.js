'use strict'; 

module.exports = function excepUtil(logPrefix) {
    function ExcepUtil() {
        const _this = this; 

        this.try = (expr, options) => {
            let error = null; 
            try {
                return expr();
            }
            catch(err) {
                try {
                    error = err;
                    _this.handleError(err); 
                    if (options && options.onError) {
                        return options.onError(err); 
                    }
                    if (options && options.rethrow) {
                        throw err; 
                    }

                    return options ? options.defaultValue : null; 
                } catch(e) {}
            }
            finally {
                if (options && options.finally) 
                    return options.finally(error); 
            }
        }; 

        this.handleError = (err) => {
            console.log(logPrefix + ': ' + err); 
        }; 
    }

    return new ExcepUtil();
};