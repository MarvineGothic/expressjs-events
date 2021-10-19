class EventEmitter {

    results = {};
    listeners = {};

    async fire(event) {
        for (var id in this.listeners) {
            let listener = this.listeners[id];
            this.unregister(id); // unregister this listener
            console.log('Run event: ', listener)

            const result = await listener(event);

            this.results[id] = {
                status: 'Finished',
                result
            }
        }
    }

    register(id, listener) {
        this.listeners[id] = listener;
        this.results[id] = {
            status: 'Pending',
            result: {}
        }
        console.log("Register", id)
    }

    unregister(id) {
        console.log("Event unregistered: ", id)
        return delete this.listeners[id];
    }

    getEvent(id) {
        return this.results[id];
    }
}

module.exports = EventEmitter;