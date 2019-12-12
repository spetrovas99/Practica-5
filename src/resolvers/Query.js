import 'babel-polyfill';
const Query = {
    ok: (parent, args, ctx, info) => {
        return "ok";
    },
    equipos:async(parent,args,ctx,info)=>{
        const {client} = ctx;
        
        const db = client.db("futbol");
        const collection = db.collection("equipo");

        const result = await collection.find({}).toArray();
        return result;
    },
    partidos:async(parent,args,ctx,info)=>{
        const {client} = ctx;
        
        const db = client.db("futbol");
        const collection = db.collection("partido");

        const result = await collection.find({}).toArray();
        return result;
    }
}
export {Query as default}