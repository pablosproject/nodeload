var BUILD_AS_SINGLE_FILE;
if (BUILD_AS_SINGLE_FILE === undefined) {
var util = require('../util');
}

var Program = exports.Program = function(fun, args) {
    this._plan = [];
    this.runData = {};
    this.attrs = util.extend({}, Program.default_attrs);
    fun(this, args);
};

// Registration

Program.interpreters = {};
Program.default_attrs = {};

Program.registerInterpreter = function(type, fn, isRequest) {
    Program.prototype[type] = function() {
        return this.addStep(type, Array.prototype.slice.call(arguments));
    };
    Program.interpreters[type] = {
        fn: fn,
        isRequest: isRequest
    };
    console.log(Program.interpreters[type]);
};


// Planning

Program.prototype.addStep = function(type, args) {
    this._plan.push({type: type, args: args});
    return this;
};

// Execution
Program.prototype.pendingIsRequest = function() {
    return Program.interpreters[this._plan[0].type].isRequest;
};

Program.prototype.next = function(cb) {
    var nextStep = this._plan.shift();
    nextStep.args.push(cb);
    var interpreter = Program.interpreters[nextStep.type].fn;
    return interpreter.apply(this, nextStep.args);
};

Program.prototype.finished = function() {
    return this._plan.length === 0;
};

// We always want "wait"
Program.registerInterpreter('wait', function(duration, next) {
    setTimeout(next, duration);
});
