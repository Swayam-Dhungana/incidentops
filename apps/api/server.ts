import { Hono } from "hono";
import authRouter from "./src/routes/auth";

const app=new Hono();

app.get('/',(c)=>{
  return c.text('503: Service Unavailable')
})

app.route('/api/v1/auth',authRouter)
export default app;