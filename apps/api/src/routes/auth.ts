import { Hono } from "hono";
import z from "zod";
import * as bcrypt from 'bcrypt';
import sql from "../../db.config";
const authRouter=new Hono();


// here i understood the concept of runtime vs compile time type safety the interface can provide safety for the compile time but for runtime a user can enter trash stuff so to prevent that i will need to add a runtime safety too for which we can use zod.
interface SignupSchema{
    name: string,
    email:string,
    password:string
}

interface LoginSchema{
    email: string,
    password: string
}

const loginSchema=z.object({
    email: z.email({pattern: z. regexes.email}),
    password: z.string().min(8,'The minimum number of password is 8').max(50,'The maximum number of length is 50')
})
const signupschema=z.object({
    name: z.string().min(3,'Minimum length of name must be 3').max(50, 'The length of name is too long'),
    email: z.email({pattern: z.regexes.email}),
    password: z.string().min(8,'The minimum number of password is 8').max(50,'The maximum number of length is 50')
})

authRouter.post('/signup',async(c)=>{
    const body=await c.req.json<SignupSchema>()
    const validation=z.safeParse(signupschema,body);
    if(!validation.success){
        return c.json({success: false, message:'Validation Failed',errors:validation.error.flatten().fieldErrors},400);
    }
    const password=body.password;
    const hashedPassword= await bcrypt.hash(password,10);
    const name=body.name;
    const email=body.email;
    try{
         await sql`
        INSERT INTO users (fullname, email, password_hash) 
        VALUES (${name}, ${email}, ${hashedPassword})
        RETURNING *
    `;
    }catch(e){
        console.log(e);        
        return c.text('Failed to create account');
    }
    return c.text('Your account has been initiated');
})

authRouter.post('/login',async(c)=>{
    const body= await c.req.json<LoginSchema>()
    const validation=await z.safeParse(loginSchema,body)
    const email= body.email;
    const password=body.password;
    // To mimplement we need to assign the session id after the user logins into the server
    // The type is to be the jwt one. Verify that the user is in session table with user_id mapped for each session
})

export default authRouter