import { Hono } from "hono";

const app=new Hono();

const sleep=(ms:number)=>{
    return new Promise((resolve)=>setTimeout(resolve,ms))
}

async function startWorker(){
    while(true){
        // will fetch the monitor here
        await sleep(1000);
    }
}

startWorker();
export default app;