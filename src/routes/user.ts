import Router from "@koa/router";
import { Context } from "koa";
import { z } from "zod";
import User from "../models/User";

const router = new Router({ prefix: "/users" });

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().optional()
});

router.post("/", async (ctx: Context) => {
  const parseResult = createUserSchema.safeParse(ctx.request.body);
  if (!parseResult.success) {
    ctx.status = 400;
    ctx.body = { errors: parseResult.error.format() };
    return;
  }
  const { name, email, age } = parseResult.data;
  const user = new User({ name, email, age });
  await user.save();

  ctx.status = 201;
  ctx.body = { data: user };
});

router.get("/", async (ctx: Context) => {
  const users = await User.find();
  ctx.body = { data: users };
});

export default router;
