import { Hono } from "hono";
import { getUserFromSession } from "../middlewares/requireAuthenticated";
import z, { success } from "zod";
import crypto from 'crypto'
import {sql} from "../../db.config";
interface Variables{
    user:{id:string}
}
interface orgCreateSchema{
    name: string
}

const orgCreationSchema=z.object({
    name:z.string().min(3,'Minimum length of org must be 3').max(50,'Maximum length of the org must be 50')
})

const orgRouter=new Hono<{Variables:Variables}>();

orgRouter.post('/create',getUserFromSession,async(c)=>{
    const userId=c.get('user').id;
    const body=await c.req.json<orgCreateSchema>();
    const validation=z.safeParse(orgCreationSchema,body);
    if(validation.error){
        return c.json({success:false, message:'Validation Error', error:validation.error.flatten().fieldErrors});
    }
    const token=crypto.randomBytes(32).toString('hex');
    const addOrg=await sql`INSERT INTO organizations (name, slug, created_by)
    VALUES (${body.name}, ${token}, ${userId})
    RETURNING id,slug`;
    if(!addOrg[0]){
        return c.json({success:false, message:'Failed to add organization',error:'Database insert error'});
    }
    await sql`INSERT INTO organization_members (user_id, organization_id, role) VALUES (${userId},${addOrg[0]?.id}, ${"admin"})`
    return c.json({success:true, message:'Added the new Organization', error:null});
})

orgRouter.post('/join',getUserFromSession,async(c)=>{
    const body=await c.req.json<{code:string}>();
    const code=body.code;
    const userId=c.get('user').id;
    const orgId=await sql`select id from organizations where slug=${code}`
    if(!orgId[0]){
        return c.json({success:false, message:'Organization not found', error:'No matching organization'})
    }
    await sql`INSERT INTO organization_members (user_id, organization_id)
    VALUES (${userId},${orgId[0]?.id})`
    return c.json({success:true, message:'Successfully joined the organization', error:null});
})
orgRouter.get("/list", getUserFromSession, async (c) => {
  const userId = c.get("user").id

  const organizations = await sql`
    SELECT 
      o.id,
      o.name,
      o.slug,
      om.role,
      om.joined_at
    FROM organizations o
    JOIN organization_members om
      ON om.organization_id = o.id
    WHERE om.user_id = ${userId}
    ORDER BY om.joined_at DESC
  `

  return c.json({
    success: true,
    message: "Organizations fetched successfully",
    organizations,
    error: null,
  })
})

export default orgRouter;