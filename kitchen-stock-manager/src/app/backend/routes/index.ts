import { Elysia } from "elysia";
import { cartRoutes } from "./cart.route";
import { authRoutes } from "./auth.route";

export const routes = new Elysia({ prefix: "/api" })
  .use(cartRoutes)
  .use(authRoutes);
