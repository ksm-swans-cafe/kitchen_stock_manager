import { Elysia } from "elysia";
import { routes } from "./routes";

new Elysia()
  .use(routes)
  .listen(3000);

console.log("🚀 Elysia server running on http://localhost:3000");
