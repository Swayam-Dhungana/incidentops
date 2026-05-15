import { Hono } from "hono";
import authRouter from "./src/routes/auth";
import orgRouter from "./src/routes/organization";
import envRouter from "./src/routes/environment";
import serviceRouter from "./src/routes/service";
import monitorRouter from "./src/routes/monitor";

const app=new Hono();

app.get('/',(c)=>{
  return c.text('503: Service Unavailable')
})

app.route('/api/v1/auth',authRouter);
app.route('/api/v1/organization',orgRouter);
app.route('/api/v1/environment',envRouter);
app.route('/api/v1/service',serviceRouter)
app.route('/api/v1/monitor',monitorRouter)
export default app;