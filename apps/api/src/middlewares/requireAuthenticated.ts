import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import crypto from 'crypto'
import {sql} from "../../db.config";
export const getUserFromSession=createMiddleware(async(c,next)=>{
    const session_token=getCookie(c,'session_token');
    if(!session_token){
        return c.json({success:false, message:'Authentication Failed', error:'Middleware redirected the request'})
    }
    const session_hash=crypto.createHash('sha256').update(session_token).digest('hex');
    const userId=await sql`select user_id from sessions where session_auth_hash=${session_hash}`;
    if(!userId){
        return c.json({success:false, message:'Authentication Failed', error:'Middleware redirected the request'})
    }
    c.set('user',{id:userId[0]?.user_id});
    await next();
})