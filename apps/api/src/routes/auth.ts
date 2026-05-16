import { Hono } from "hono";
import z from "zod";
import * as bcrypt from 'bcrypt';
import sql from "../../db.config";
import crypto from 'crypto';
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { getUserFromSession } from "../middlewares/requireAuthenticated";

interface Variables{
    user:{
        id: string
    }
}
const authRouter=new Hono<{Variables:Variables}>();
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
    const validation=z.safeParse(loginSchema,body)
    if(validation.error){
        return c.json({success: false, message: 'Validation Failed', error: validation.error.flatten().fieldErrors},400)
    }
    const email= body.email;
    const password=body.password;
        const user=await sql`Select id, email, password_hash from users where email=${email}`;
        if(!user[0]){
        return c.json({success:false, message:'Your Email or Password is incorrect', error:'Email or password not found'})
        }
    const isValidPassword=await bcrypt.compare(password,user[0].password_hash);
    if(!isValidPassword){
        return c.json({success:false, message:'Your Email or Password is incorrect', error:'Email or password not found'})
    }
    const session_token=crypto.randomBytes(32).toString('hex');
    const session_hash=crypto.createHash('sha256').update(session_token).digest('hex');
    const update_session=await sql`INSERT INTO sessions (user_id, session_auth_hash, expires_at)
     VALUES (${user[0].id},${session_hash},CURRENT_TIMESTAMP + INTERVAL '1 week')
    RETURNING id
    `
    if(!update_session){
        return c.json({success:false, message:'Failed to create valid session', error:'Failed to update the session'})
    }
    setCookie(c,'session_token',session_token ,{
        path: '/',
        secure: false,
        httpOnly: true,
        maxAge: 10000,
        expires: new Date(Date.now()+34560000),
        sameSite: 'lax',

    })
    return c.json({success:true, message:'Login Successful', error: null});
})

authRouter.post('/logout',async(c)=>{
    const session_cookie=getCookie(c,'session_token');
    if(!session_cookie){
        return c.json({success:false,message:'Already Logged out', error:null});
    }
    const session_hash=crypto.createHash('sha256').update(session_cookie).digest('hex')
    const deletedRow=await sql`DELETE FROM sessions WHERE session_auth_hash=${session_hash}`
    if(!deletedRow){
        return c.json({success:false, message:'Unable to logout', error:'Failed to delete the session'});
    }
    deleteCookie(c,'session_token',{
        path:'/',
        secure:true,
        domain:'localhost'
    })
    return c.json({success:true, message:'Logout Successfull', error:null});
})

authRouter.get("/me", getUserFromSession, async (c) => {
  const userId = c.get("user").id
  const user = await sql`
    SELECT id, fullname, email, avatar_url
    FROM users
    WHERE id = ${userId}
  `
  if (!user[0]) {
    return c.json({
      success: false,
      message: "User not found",
      error: "Invalid session",
    }, 404)
  }
  return c.json({
    success: true,
    message: "User fetched successfully",
    user: user[0],
    error: null,
  })
})

export default authRouter