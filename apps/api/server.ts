import { Hono } from "hono";
import authRouter from "./src/routes/auth";
import orgRouter from "./src/routes/organization";
import envRouter from "./src/routes/environment";
import serviceRouter from "./src/routes/service";
import monitorRouter from "./src/routes/monitor";
import { cors } from "hono/cors"
import {sql} from "./db.config";

const app=new Hono();

app.use(
  "/*",
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
)
app.get('/',(c)=>{
  return c.text('503: Service Unavailable')
})

app.get("/db-test", async (c) => {
  const result = await sql`select 1 as ok`
  return c.json(result)
})

app.route('/api/v1/auth',authRouter);
app.route('/api/v1/organization',orgRouter);
app.route('/api/v1/environment',envRouter);
app.route('/api/v1/service',serviceRouter)
app.route('/api/v1/monitor',monitorRouter)
export default app;