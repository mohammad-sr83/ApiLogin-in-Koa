import Router from "@koa/router";
import { Context } from "koa";
import { z } from "zod";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = new Router({ prefix: "/api" });
const JWT_SECRET = process.env.JWT_SECRET??''

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string(),
  age: z.coerce.number().optional(),
  password: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});


router.post("/singup", async (ctx: Context) => {
  const parseResult = await createUserSchema.safeParse(ctx.request.body);
  if (!parseResult.success) {
    ctx.status = 400;
   ;
    return ctx.body = { errors: parseResult.error.format() };
  }
  const { name, email, age, password } = parseResult.data;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return (ctx.status = 400), (ctx.body = { message: "Email exists" });
  const hashedpass = await bcrypt.hash(password, 10);
  const user = new User({ name, email, age, password: hashedpass });
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  const acsesstoken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

  user.refreshToken = refreshToken
  await user.save();
  ctx.status = 201;
  ctx.body = { data: { token: acsesstoken, massege: "your token" } };
});

router.post("/login", async (ctx: Context) => {
  const parseResult = await loginSchema.safeParse(ctx.request.body);
  if (!parseResult.success) {
    ctx.status = 400;
    ctx.body = { errors: parseResult.error.format() };
    return;
  }
  const {email, password } = parseResult.data;
  const user =await User.findOne({email})
  if (!user) {
    ctx.status = 400;
    ctx.body = { errors: "email is not valid" };
    return;
  }
  const chekpassword=await bcrypt.compare(password,user.password)
  if (!chekpassword) {
    ctx.status = 400;
    ctx.body = { errors: "password is not valid" };
    return;
  }
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
  const acsesstoken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

  user.refreshToken = refreshToken
  await user.save();

  ctx.status = 201;
  ctx.body = { message: "Login successful", acsesstoken };
});

router.post("/refresh-token", async (ctx: Context) => {
  const refresh =refreshSchema.safeParse(ctx.request.body)
  if (!refresh.success) {
    ctx.status = 400;
    ctx.body = { error: "Refresh token is required" };
    return;
  }
    const { refreshToken } = ctx.request.body as any;
  try {
    const payload: any = jwt.verify(refreshToken, JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      ctx.status = 401;
      ctx.body = { error: "Invalid refresh token" };
      return;
    }

    const newAccessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    const newRefreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    user.refreshToken = newRefreshToken;
    await user.save();

    ctx.status = 200;
    ctx.body = { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: "Invalid or expired token" };
  }
});

export default router;
