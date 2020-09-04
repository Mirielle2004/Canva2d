<<<<<<< HEAD
let CURRENT_CONTEXT = null;
=======
let CURRENT_CONTEXT;
>>>>>>> 3e89290683c8e78d54f57bf987b0521a2250dc03

const AbstractBaseMixin = {

    debug: false,

    checkDebug(callback, message) {
        if(this.debug) callback(message);
    }

};
