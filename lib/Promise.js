
const Promise = require('bluebird')



if (!Promise.prototype.spread) {
    Promise.prototype.spread = function (fn) {
        return this.then(function (args) {
            return Promise.all(args); // wait for all
        }).then(function(args){
         //this is always undefined in A+ complaint, but just in case
            return fn.apply(this, args); 
        });

    };

}

module.exports = Promise