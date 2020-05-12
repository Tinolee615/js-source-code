const PENDING = 'pending';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

class MyPromise {
    constructor(executor) {
        this.status = PENDING;
        this.value = null;
        this.fulfilledQueues = [];
        this.rejectedQueues = [];
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch (error) {
            this.reject(error)
        }
    }

    resolve(value) {
        if (this.status === PENDING) {
            this.status = FULFILLED;
            this.value = value;
            this.fulfilledQueues.map((fulfilled) => fulfilled(value))
        }
    }

    reject(reason) {
        if (this.status === PENDING) {
            this.status = REJECTED;
            this.value = reason;
            this.rejectedQueues.map((rejected) => rejected(reason))
        }
    }
    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        let promise = new MyPromise((resolve, reject) => {
            if (this.status == FULFILLED) {
                setTimeout(() => {
                    try {
                        this.resolvePromise(promise, onFulfilled(this.value), resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            }
            if (this.status == REJECTED) {
                setTimeout(() => {
                    try {
                        this.resolvePromise(promise, onRejected(this.value), resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            }
            if (this.status == PENDING) {
                this.fulfilledQueues.push((value) => {
                    setTimeout(() => {
                        try {
                            this.resolvePromise(promise, onFulfilled(value), resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
                this.rejectedQueues.push((value) => {
                    setTimeout(() => {
                        try {
                            this.resolvePromise(promise, onRejected(value), resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
            }
        })
        return promise
    }
    resolvePromise(promise, result, resolve, reject) {
        if (promise == result) {
            reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
        }
        if (result && typeof result === 'object' || typeof result === 'function') {
            let oneUsed;
            try {
                let then = result.then;
                if (typeof then === 'function') {
                    then.call(result, (y) => {
                        if (oneUsed) return;
                        oneUsed = true;
                        this.resolvePromise(promise, y, resolve, reject);
                    }, (err) => {
                        if (oneUsed) return;
                        oneUsed = true;
                        reject(err)
                    })
                } else {
                    if (oneUsed) return;
                    oneUsed = true;
                    resolve(result)
                }
            } catch (err) {
                if (oneUsed) return;
                oneUsed = true;
                reject(err)
            }
        } else {
            resolve(result)
        }
    }

    static resolve(value) {
        return new MyPromise((resolve, reject) => {
            if (value instanceof MyPromise) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }
    static reject(value) {
        return new MyPromise((resolve, reject) => {
            reject(value)
        })
    }
    static all(promises) {
        let values = [];
        return new MyPromise((resolve, reject) => {
            promises.forEach((promise) => {
                promise.then((value) => {
                    values.push(value)
                    if (values.length === promises.length) {
                        resolve(values)
                    }
                }, (reason) => {
                    reject(reason)
                })
            })
        })
    }
    static race(promises) {
        return new MyPromise((resolve, reject) => {
            promises.map((promise) => {
                promise.then((value) => {
                    resolve(value)
                }, (reason) => {
                    reject(reason)
                })
            })
        })
    }
}
//安装测试脚本：npm install -g promises-aplus-tests
//运行测试：promises-aplus-tests promise.js
MyPromise.defer = MyPromise.deferred = function() {
    let dfd = {};
    dfd.promise = new MyPromise((resolve, reject) => {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}

module.exports = MyPromise
