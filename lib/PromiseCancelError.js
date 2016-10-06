function PromiseCancelError(message, cause) {
     this.message = message
     this.stack = cause.stack;
 }
 Object.setPrototypeOf(PromiseCancelError, Error)
 PromiseCancelError.prototype = Object.create(Error.prototype)
 PromiseCancelError.prototype.name = "PromiseCancelError"
 PromiseCancelError.prototype.constructor = PromiseCancelError

module.exports = PromiseCancelError