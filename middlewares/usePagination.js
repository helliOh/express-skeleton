class Pagination{
    constructor(options = {
        allowed : [40, 80, 100],
        reference : {
            pagesize : 'pagesize',
            page : 'page',
        }
    }){
        if(options && options instanceof Object && Object.keys(options).length < 1){
            options = {
                allowed : [40, 80, 100],
                reference : {
                    pagesize : 'pagesize',
                    page : 'page',
                }
            };
        }

        const allowed = options.allowed ? options.allowed : [40, 80, 100];
        const { reference } = options;
        
        if(reference && !(reference instanceof Object)) throw new Error(`[Pagination]\tWrong parameter\t(options.reference:Object)`);

        const { page, pagesize } = reference && reference instanceof Object? reference : { pagesize : 'pagesize', page : 'page' };

        this.allowed = [40, 80, 100];
        this.reference = {
            pagesize : 'pagesize',
            page : 'page'
        };

        if(!(allowed instanceof Array)) throw new Error(`[Pagination]\tWrong parameter\t(options.allowed:Array)`);

        if(allowed.every(e => e > 0) && allowed.every(e => Number.isInteger(e))) this.allowed = allowed;
        else console.warn(`[Pagination]\tWrong parameter\tElement of allowed should be positive integer.\tAllowed is replaced to the default value.([40, 80, 100])`);

        if(pagesize && typeof(pagesize) == 'string' && pagesize.length > 0) this.reference.pagesize = pagesize;
        else console.warn(`[Pagination]\tWrong parameter\treference.pagesize should be meaningful string.\tPagesize reference is replaced to the default value.("pagesize")`);
        
        if(page && typeof(page) == 'string' && page.length > 0) this.reference.page = page;
        else console.warn(`[Pagination]\tWrong parameter\treference.page should be meaningful string.\tPage reference is replaced to the default value.("page")`);
    }

    parse(source){
        let page = source[this.reference.page];
        let pagesize = source[this.reference.pagesize];

        if(isNaN(page) || parseInt(page) < 1) page = 1;
        else page = parseInt(page);

        if(isNaN(pagesize) || parseInt(pagesize) < this.allowed[0] || !this.allowed.filter(allowed => allowed == pagesize)[0] ) pagesize = this.allowed[0];
        else pagesize = parseInt(pagesize);

        const nextpage = page + 1;
        const offset = (page - 1) * pagesize;

        this.state =  {
            page : page,
            nextpage : nextpage,
            pagesize : pagesize,
            offset : offset
        };
    }

    toJson(arr = []){ 
        const { page, pagesize, offset, nextpage } = this.state;

        return {
            page : page ,
            nextpage : arr.length == pagesize? nextpage : 1, 
            limit : pagesize,
            offset : offset
        };
    }
}

module.exports = function usePagination(config){
    async function watcher(req, res, next){
        try{
            let newPagination = new Pagination(config);

            req.pagination = req.pagination ? req.pagination : newPagination;
            req.pagination.parse(req.query);
            next();
        }
        catch(e){
            console.error(e);
            return res.status(500).send({sucess : 'failed', message : 'Internal server error'})
        }
    }

    return watcher;
}