class FilterGroup{
    constructor(options = {
        listeners : {}
    }){
        const { listeners } = options;
        this.buffer = [];
        this.originalQuery = {};

        if(!(listeners instanceof Object)) throw new Error(`[FilterGroup]\tWrong parameter\t(options.listeners:Object)`);
        const listenerValidation = Object.values(listeners).map(listener => listener instanceof Function).every(a => a);
        
        if(!listenerValidation) throw new Error(`[FilterGroup]\tWrong parameter\tListener should be function`);
        this.listeners = listeners;
    }

    push(elem){
        if(elem){
            if(!(typeof(elem) == 'object')) throw new Error(`[FilterGroup]\tWrong parameter in push\t(elem:Object)`);
            
            this.buffer.push(elem);
        }
    }

    toJson(){
        const json = {};

        for(const elem of this.buffer){
            const [key, val] = [Object.keys(elem)[0], Object.values(elem)[0] ];
            json[key] = val;
        }

        return json;
    }

    async watch(){
        const keys = Object.keys(this.originalQuery);
        
        for(const key of keys){
            if(this.listeners[key]) await this.listeners[key](this);
        }
    }
}

module.exports = function useFilter(config){
    async function watcher(req, res, next){
        try{
            let newFilter = new FilterGroup(config);
            newFilter.originalQuery = req.query;

            req.filters = req.filters ? req.filters : newFilter;

            await req.filters.watch();
            next();
        }
        catch(e){
            console.error(e);
            return res.status(500).send({sucess : 'failed', message : 'Internal server error'})
        }
    }

    return watcher;
}