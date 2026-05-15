import { Hono } from "hono";
import { getUserFromSession } from "../middlewares/requireAuthenticated";
import z from "zod";
import sql from "../../db.config";


interface Variables{
    user:{
        id:string
    }
}
interface monitorInterface{
    service_id: string,
    method: string,
    duration_between_calls: number,
    failure_threshold: number,
    timeout_seconds: number,
    url: string,
    is_active: boolean
}

const monitorSchema=z.object({
    service_id: z.uuid(),
    method: z.string(),
    duration_between_calls: z.number(),
    failure_threshold: z.number(),
    timeout_seconds: z.number(),
    url: z.string().min(10,'The url length is too short'),
    is_active: z.boolean()
})

const monitorRouter=new Hono<{Variables: Variables}>();
monitorRouter.post('/create',getUserFromSession,async(c)=>{
        const body=await c.req.json<monitorInterface>()
        const validation=z.safeParse(monitorSchema,body);
        if(validation.error){
            return c.json({success:false, message:'Failed to create monitor', error:validation.error.flatten().fieldErrors});
        }
        const {service_id,method,duration_between_calls,failure_threshold,timeout_seconds,url,is_active}=body;
        const monitor=await sql`INSERT INTO monitor_config (service_id, method, duration_between_calls, failure_threshold, timeout_seconds, url, is_active)
        VALUES (${service_id},${method},${duration_between_calls},${failure_threshold},${timeout_seconds},${url},${is_active})
        RETURNING id`;
        if(!monitor[0]?.id){
            return c.json({sucess: false,message:'Failed to add the monitor', error:'Failed to add the monitor'});
        }
        return c.json({success: true,message:'Monitor Added successfully'});
})

export default monitorRouter;