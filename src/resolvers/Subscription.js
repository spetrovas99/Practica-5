const Subscription = {
    subscribeEq:{ 
        subscribe(parent,args,ctx,info){
            const {_id} =args;
            const{pubsub} =ctx;
            return pubsub.asyncIterator(_id);
        }
    },
    subscribePar:{ 
        subscribe(parent,args,ctx,info){
            const {_id} =args;
            const{pubsub} =ctx;
            return pubsub.asyncIterator(_id);
        }
    }
};
export {Subscription as default}