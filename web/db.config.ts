import postgres from "postgres";
const dbUrl=process.env.DATABASE_URL!;
const sql = postgres(dbUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30
});

export default sql;