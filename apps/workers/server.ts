import sql from "./db.config";
import { getMonitor } from "./worker/getMonitor";
import { makeRequest } from "./worker/makeRequest";

const sleep=(ms:number)=>{
    return new Promise((resolve)=>setTimeout(resolve,ms))
}
async function startWorker() {
  while(true){  
  try {
      const currentMonitor = await getMonitor()
      if (!currentMonitor[0]) {
        await sleep(1000)
      }
      console.log('hmm')
      await makeRequest(currentMonitor[0]!)
      await sleep(1000)
      console.log('working 2');
    } catch (error) {
      await sleep(5000)
    }
  }
}
startWorker();