import { Hono } from "hono";
import { getUserFromSession } from "../middlewares/requireAuthenticated";
import z from "zod";
import {sql} from "../../db.config";


interface Variables{
    user:{
        id:string
    }
}
const envRouter=new Hono<{Variables: Variables}>();
const setEnvSchema=z.object({
    name: z.string().min(3,'Minimum required name length is 3')
})

envRouter.get("/list", getUserFromSession, async (c) => {
  const userId = c.get("user").id

  const environments = await sql`
    SELECT
      e.id,
      e.name,
      e.organization_id,
      o.name AS organization_name,
      e.created_at
    FROM environments e
    JOIN organizations o
      ON o.id = e.organization_id
    JOIN organization_members om
      ON om.organization_id = o.id
    WHERE om.user_id = ${userId}
    ORDER BY e.created_at DESC
  `

  return c.json({
    success: true,
    message: "Environments fetched successfully",
    environments,
    error: null,
  })
})

envRouter.post('/create',getUserFromSession,async(c)=>{
    const body=await c.req.json<{name:string}>();
    const validation=z.safeParse(setEnvSchema,body);
    const userId=c.get('user').id;
    if(validation.error){
        return c.json({success:false,message:'Validation Failed for the name', error:validation.error.flatten().fieldErrors});
    }
    const organization=await sql`SELECT organization_id FROM organization_members where user_id=${userId}`
    const newEnvironment=await sql`INSERT INTO environments (name, organization_id) VALUES(${body.name},${organization[0]?.organization_id}) RETURNING id`;
    if(!newEnvironment[0]?.id){
        return c.json({success:false, message:'Failed to create new Environment',error:'Failed to insert new environment'});
    }
    return c.json({success:true, message:'Environment Added Successfully', error:null});
})

export default envRouter;