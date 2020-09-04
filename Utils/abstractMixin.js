const AbstractBaseMixin = {

    debug: false,

    checkDebug(callback, message) {
        if(this.debug) callback(message);
    }

};
