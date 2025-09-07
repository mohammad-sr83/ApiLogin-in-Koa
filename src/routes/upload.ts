import Router from "@koa/router";
import { authMiddleware } from "../lib/middleware/auth";
import { FileModel } from "../models/File";

const router = new Router({ prefix: "/api" });


router.post("/upload", authMiddleware, async (ctx: any) => {
  const files = ctx.request.files;

  const file = files.file; 

  const userId = ctx.state.user._id;

  const savedFile = await FileModel.create({
    filename: file.newFilename,    
    originalname: file.originalFilename, 
    mimetype: file.mimetype,
    size: file.size,
    path: file.filepath,
    url: `/uploads/${file.newFilename}`,
    userId,
  });

  ctx.status = 201;
  ctx.body = { message: "ok", file: savedFile };
});

router.get("/my-files", authMiddleware, async (ctx:any) => {
  const userId = ctx.state.user._id;
  const files = await FileModel.find({ userId });
  ctx.body = { files };
});

export default router