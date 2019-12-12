import 'babel-polyfill';
import dateTime from "date-time";
import {ObjectID} from 'mongodb';

const Mutation = {
    tellyou: (parent, args, ctx, info) =>{
        const {_id,value} = args;
        const{pubsub} =ctx;
        pubsub.publish(_id, {tellme:value});
        return 1;
    },
    addEquipo: async (parent, args, ctx, info) => {
        const {client} = ctx;
        const {nombre} = args;
        
        const db = client.db("futbol");
        const collection = db.collection("equipo");

        if(await collection.findOne({nombre})){
            throw new Error(`nombre ya usado: ${nombre}`);
        }

        const equipo = {
            nombre,
        }
        return (await collection.insertOne(equipo)).ops[0]; 
    },
    addPartido: async (parent,args,ctx,info) =>{
        const {client} = ctx;
        const {resultado,enJuego,finalizado,equipos} = args;
        
        const db = client.db("futbol");
        const collection = db.collection("partido"); 
        const collectionEq = db.collection("equipo");

        equipos.forEach(async (element) => {
            if(!(await collectionEq.findOne({_id: ObjectID(element)}))){
                throw new Error (`equipo no encontrado`);
            }
        });
        if(enJuego && finalizado){
            throw new Error("inconsistencia de datos");
        }
        const partido ={
            resultado,
            equipos: equipos.map(obj => ObjectID(obj)),
            finalizado,
            enJuego,
            fecha: dateTime(),
        }
        return (await collection.insertOne(partido)).ops[0];
    },
    inicializarPartido: async (parent,args,ctx,info) =>{
        const {client} = ctx;
        const {_id} = args;
        
        const db = client.db("futbol");
        const collection = db.collection("partido"); 
        let partido = collection.findOne({_id: ObjectID})
        if(!(await partido)){
            throw new Error(`el partido no existe`);
        }
        if(partido.enJuego|| partido.finalizado){
            throw new Error("inconsistencia de datos");
        }
        const{pubsub} =ctx;
        pubsub.publish(_id, {subscribePar: "partido empezado"});
        pubsub.publish(partido.equipos[0], {subscribeEq: "partido empezado"});
        pubsub.publish(partido.equipos[1], {subscribeEq: "partido empezado"});

        return (await collection.findOneAndUpdate({_id:ObjectID(_id)}, {$set: {enJuego:true}}, {returnOriginal: false})).value;

    },
    finalizarPartido: async (parent,args,ctx,info) =>{
        const {client} = ctx;
        const {_id} = args;
        
        const db = client.db("futbol");
        const collection = db.collection("partido"); 

        let partido = collection.findOne({_id: ObjectID})
        if(!(await partido)){
            throw new Error(`el partido no existe`);
        }
        if(partido.finalizado || !partido.enJuego){
            throw new Error("inconsistencia de datos");
        }
        const{pubsub} =ctx;
        pubsub.publish(_id, {subscribePar: `partido terminado y resultado es ${partido.resultado}`});
        pubsub.publish(partido.equipos[0], {subscribeEq: `partido terminado y el resultado es${partido.resultado}`});
        pubsub.publish(partido.equipos[1], {subscribeEq: `partido terminado y el resultado es ${partido.resultado}`});

        return (await collection.findOneAndUpdate({_id:ObjectID(_id)}, {$set: {finalizado:true , enJuego:false}}, {returnOriginal: false})).value;
    },
    actualizarResultados: async (parent,args,ctx,info) =>{
        const {client} = ctx;
        const {_id,resultado} = args;
        
        const db = client.db("futbol");
        const collection = db.collection("partido"); 

        if(!(await collection.findOne({_id}))){
            throw new Error(`el partido no existe`);
        }
        if(!enJuego){
            throw new Error("inconsistencia de datos");
        }

        const{pubsub} =ctx;
        pubsub.publish(_id, {subscribePar: `resultado es ${partido.resultado}`});
        pubsub.publish(partido.equipos[0], {subscribeEq: `el resultado es${partido.resultado}`});
        pubsub.publish(partido.equipos[1], {subscribeEq: `el resultado es ${partido.resultado}`});

        return (await collection.findOneAndUpdate({_id:ObjectID(_id)}, {$set: {resultado}}, {returnOriginal: false})).value;
    }
}
export {Mutation as default};