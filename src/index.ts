import dotenv from "dotenv";
dotenv.config();
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { connectDB } from "./database/db";
import { jsonErrorHandler } from "./lib/middleware/errorHandler";
import userRoutes from "./routes/user";
import loginRouter from "./routes/login";
import productRouter from "./routes/product"
import uploadfileRouter from "./routes/upload"
import koaBody from "koa-body";
import path from "path";


const app = new Koa();

app.use(jsonErrorHandler);
app.use(bodyParser());
app.use(
  koaBody({
    multipart: true, 
    formidable: {
      uploadDir: path.join(__dirname, "uploads"), 
      keepExtensions: true,
    },
  })
);



app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());
app.use(loginRouter.routes());
app.use(loginRouter.allowedMethods());
app.use(productRouter.routes());
app.use(productRouter.allowedMethods());
app.use(uploadfileRouter.routes());
app.use(uploadfileRouter.allowedMethods());
(async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})();
