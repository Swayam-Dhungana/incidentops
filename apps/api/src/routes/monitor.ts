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

monitorRouter.get("/list", getUserFromSession, async (c) => {
  const userId = c.get("user").id

  const monitors = await sql`
    SELECT
      mc.id,
      mc.service_id,
      s.name AS service_name,
      mc.method,
      mc.url,
      mc.duration_between_calls,
      mc.failure_threshold,
      mc.timeout_seconds,
      mc.is_active,
      mc.created_at
    FROM monitor_config mc
    JOIN services s
      ON s.id = mc.service_id
    JOIN environments e
      ON e.id = s.environment_id
    JOIN organization_members om
      ON om.organization_id = e.organization_id
    WHERE om.user_id = ${userId}
    ORDER BY mc.created_at DESC
  `

  return c.json({
    success: true,
    message: "Monitors fetched successfully",
    monitors,
    error: null,
  })
})

monitorRouter.get("/dashboard", getUserFromSession, async (c) => {
  const userId = c.get("user").id

  const monitors = await sql`
    SELECT
      mc.id AS monitor_id,
      mc.url,
      mc.method,
      mc.duration_between_calls,
      mc.failure_threshold,
      mc.timeout_seconds,
      mc.is_active,

      s.id AS service_id,
      s.name AS service_name,
      s.service_status,

      e.id AS environment_id,
      e.name AS environment_name,

      ms.last_checked_at,
      ms.last_response_time_ms,
      ms.consecutive_failure_count,
      ms.last_failure_at,
      ms.last_success_at
    FROM monitor_config mc
    JOIN services s
      ON s.id = mc.service_id
    JOIN environments e
      ON e.id = s.environment_id
    JOIN organization_members om
      ON om.organization_id = e.organization_id
    LEFT JOIN monitor_state ms
      ON ms.monitor_id = mc.id
    WHERE om.user_id = ${userId}
    ORDER BY ms.last_checked_at DESC NULLS LAST
  `

  return c.json({
    success: true,
    message: "Monitor dashboard fetched successfully",
    monitors,
    error: null,
  })
})

monitorRouter.get("/:id/history", getUserFromSession, async (c) => {
  const userId = c.get("user").id
  const monitorId = c.req.param("id")

  const history = await sql`
    SELECT
      mh.id,
      mh.monitor_id,
      mh.checked_at,
      mh.status,
      mh.status_code,
      mh.response_time_ms,
      mh.error_message
    FROM monitor_history mh
    JOIN monitor_config mc
      ON mc.id = mh.monitor_id
    JOIN services s
      ON s.id = mc.service_id
    JOIN environments e
      ON e.id = s.environment_id
    JOIN organization_members om
      ON om.organization_id = e.organization_id
    WHERE 
      mh.monitor_id = ${monitorId}
      AND om.user_id = ${userId}
    ORDER BY mh.checked_at DESC
    LIMIT 50
  `

  return c.json({
    success: true,
    message: "Monitor history fetched successfully",
    history,
    error: null,
  })
})

monitorRouter.post('/start',getUserFromSession,async(c)=>{
    const body=await c.req.json<{monitor_id: string}>();
    const monitorState=await sql`INSERT INTO monitor_state (monitor_id) VALUES (${body.monitor_id}) RETURNING id`;
    if(!monitorState[0]?.id){
        return c.json({success:false, message:'Failed to start the monitor',error:'Database Failuer'});
    }
    return c.json({success:true, message:'Monitor is now active',error:null});
})

export default monitorRouter;