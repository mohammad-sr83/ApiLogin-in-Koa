import jwt from "jsonwebtoken";
import { Context, Next } from "koa";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

interface JwtPayload {
  id: string;
  email: string;
}

declare module "koa" {
  interface DefaultState {
    user?: JwtPayload;
  }
}

export const authMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.split(" ")[1];

  if (!token) {
    ctx.status = 401;
    ctx.body = { success: false, error: "No token, authorization denied" };
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    ctx.state.user = decoded;
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { success: false, error: "Token is not valid" };
  }
};
