import { Hono } from "hono";
import { getMonitor } from "./worker/getMonitor";
import { makeRequest } from "./worker/makeRequest";

const app=new Hono();

const sleep=(ms:number)=>{
    return new Promise((resolve)=>setTimeout(resolve,ms))
}

async function startWorker(){
    while(true){
        const currentMonitor=await getMonitor();
        if(!currentMonitor[0]){
            sleep(1000)
            continue
        }
        const {monitor_id,method,failure_threshold,timeout_seconds,url}=currentMonitor[0];
        const data={
            monitor_id,method,failure_threshold,timeout_seconds,url
        }
        makeRequest(data);
        await sleep(1000);
    }
}

startWorker();
export default app;