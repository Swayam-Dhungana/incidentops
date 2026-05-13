import { Hono } from "hono";
import z from "zod";
import * as bcrypt from 'bcrypt';
const authRouter=new Hono();


// here i understood the concept of runtime vs compile time type safety the interface can provide safety for the compile time but for runtime a user can enter trash stuff so to prevent that i will need to add a runtime safety too for which we can use zod.
interface SignupSchema{
    name: string,
    email:string,
    password:string
}
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
    
    return c.text('Your account has been initiated');
})

authRouter.post('/login',(c)=>{
    return c.text('You are now logged in!');
})

export default authRouter