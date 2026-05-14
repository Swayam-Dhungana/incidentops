import { Hono } from "hono";
import { getUserFromSession } from "../middlewares/requireAuthenticated";
import z from "zod";
import sql from "../../db.config";


interface Variables{
    user:{
        id:string
    }
}
const serviceSchema=z.object({
    name: z.string().min(3,'Minimum name length is 3').max(50,'The name length is too long'),
    description: z.string().min(20,'Atleast 20 character is required for description')
})
const serviceRouter=new Hono<{Variables: Variables}>();

    serviceRouter.post('/create',getUserFromSession,async(c)=>{
    const body=await c.req.json<{name:string,description:string}>();
    const validation=z.safeParse(serviceSchema,body);
    const userId=c.get('user').id;
    if(validation.error){
        return c.json({success:false,message:'Validation Failed for the service', error:validation.error.flatten().fieldErrors});
    }
    const environment=await sql`SELECT e.id FROM environments as e
    join organization_members as om
    on e.organization_id=om.organization_id
    where om.user_id=${userId}`;
    const addedService=await sql`INSERT INTO services (environment_id, name, description, service_status) VALUES (${environment[0]?.id}, ${body.name},${body.description},${'operational'}) returning id`
    if(!addedService[0]?.id){
        return c.json({success:false, message:'Failed to add the service', error: 'Failed to add the service'});
    }
    return c.json({success:true, message:'Service Added Successfully', error:null});
})

export default serviceRouter;