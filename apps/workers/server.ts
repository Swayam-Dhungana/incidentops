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
      await makeRequest(currentMonitor[0]!)
      await sleep(1000)
    } catch (error) {
      await sleep(5000)
    }
  }
}
startWorker();