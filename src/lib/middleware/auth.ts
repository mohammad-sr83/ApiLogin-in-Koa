import jwt from "jsonwebtoken";
import { Context, Next } from "koa";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

declare module "koa" {
  interface DefaultContext {
    user?: any;
  }
}

export const authMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.split(" ")[1];

  if (!token) {
    ctx.status = 401;
    ctx.body = { message: "No token, authorization denied" };
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    ctx.user = decoded; 
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { message: "Token is not valid" };
  }
};
