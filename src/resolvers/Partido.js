
import {ObjectID} from 'mongodb';
const Partido = {
    equipos: async(parent, args, ctx, info)=>{
        const { client } = ctx;
        const db = client.db("futbol");
        const collection = db.collection("equipo");
        return (await collection.find({$or: [{_id: ObjectID(parent.equipos[0])}, {_id: ObjectID(parent.equipos[1])}]}).toArray());
    }
}
export {Partido as default}