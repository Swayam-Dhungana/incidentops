import { Hono } from "hono";
import authRouter from "./src/routes/auth";
import orgRouter from "./src/routes/organization";

const app=new Hono();

app.get('/',(c)=>{
  return c.text('503: Service Unavailable')
})

app.route('/api/v1/auth',authRouter)
app.route('/api/v1/organization',orgRouter)
export default app;