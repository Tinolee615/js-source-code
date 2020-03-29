function globalThis() {
    return this;
}

function callExecuteExpression(argList) {
    var expression = 'return arguments[0][arguments[1]]('
    for (var i = 0, len = argList.length; i < len; i++) {
        i > 0 ?
            expression += ',arguments[2][' + i + ']' :
            expression += 'arguments[2][' + i + ']'
    }
    expression += ')'
    return expression
}
Function.prototype.callFunc = function(target) {
    //this为绑定函数func
    //15.3.4.4.1
    if (typeof this !== 'function') {
        throw new TypeError(this + ' is not a function');
    }
    //thisArg 是 undefined 或 null 时它会被替换成全局对象
    if (typeof target === 'undefined' || target === null) {
        target = globalThis();
    }
    //所有其他值会被应用 ToObject 并将结果作为 this 值
    target = new Object(target);
    var argList = [];
    for (var i = 0, len = arguments.length; i < len; i++) {
        argList[i] = arguments[i + 1];
    }
    var __func = '__' + new Date().getTime();
    //还可以进一步做暂存
    var ownFunc = target[__func];
    var hasOwnFunc = target.hasOwnProperty(__func);
    target[__func] = this; //this为绑定函数
    // target.__func(...argList);
    //eval('target.__func(' + argList + ')')
    var expression = callExecuteExpression(argList)
    new Function(expression)(target, __func, argList)
    delete target[__func]
    if (hasOwnFunc) {
        target[__func] = ownFunc;
    }
}
Function.prototype.applyFunc = function(target, argsArray) {
    if (typeof this !== 'function') {
        throw new TypeError(this + 'is not a function')
    }

    if (typeof argsArray === 'undefined' || argsArray === null) {
        argsArray = [];
    }

    if (argsArray !== new Object(argsArray)) {
        throw new TypeError('CreateListFromArrayLike called on non-object')
    }

    if (typeof target === 'undefined' || target === null) {
        target = globalThis();
    }

    target = new Object(target);
    var __func = '__' + new Date().getTime();
    var ownFunc = target[__func];
    var hasOwnFunc = target.hasOwnProperty(__func);
    target[__func] = this; //this为绑定函数
    var code = callExecuteExpression(argsArray);
    var result = new Function(code)(target, __func, argsArray);
    delete target[__func];
    if (hasOwnFunc) {
        target[__func] = ownFunc;
    }
    return result;
}
//测试
console.log(Function.prototype.callFunc.length)
// 1
var tObj = {
    name: 'tino'
}

function func(arg1, arg2, arg3) {
    console.log('this:', this)
    console.log('name:', this.name)
    console.log('arg1:', arg1)
    console.log('arg2:', arg2)
}
func.callFunc(tObj, "tinolee", 2, 4);
//原生call此处的this打印是没有__1585152978563这个属性的，还没思考好这步改怎么解决
//this: {name: "tino", __1585152978563: ƒ}
//name: tino
//arg1: tinolee
//arg2: 2
