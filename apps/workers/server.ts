import { getMonitor } from "./worker/getMonitor";
import { makeRequest } from "./worker/makeRequest";

const sleep=(ms:number)=>{
    return new Promise((resolve)=>setTimeout(resolve,ms))
}
async function startWorker() {
    try {
      console.log("cycle started")

      console.log("before getMonitor")
      const currentMonitor = await getMonitor()
      console.log("after getMonitor", currentMonitor.length)

      if (!currentMonitor[0]) {
        await sleep(1000)
      }

      console.log("before makeRequest")
      await makeRequest(currentMonitor[0]!)
      console.log("after makeRequest")

      await sleep(1000)
    } catch (error) {
      console.log("Worker Failed", error)
      await sleep(5000)
    }
  }
startWorker();