import Router from "@koa/router";
import { Context } from "koa";
import { ProductShoma } from "../lib/Type/Shoma";
import Product from "../models/Product";
import { authMiddleware } from "../lib/middleware/auth";

const router = new Router({ prefix: "/api/product" });

router.get("/list",authMiddleware, async (ctx: Context) => {
  const { skip, limit } = ctx.query;
  if (!skip || !limit)
    return (
      (ctx.status = 400), (ctx.body = { message: "skip and limit not valid" })
    );
  const pageProduct = await Product.find()
    .skip(Number(skip))
    .limit(Number(limit));
  if (!pageProduct)
    return (ctx.status = 400), (ctx.body = { message: "product not valid" });

  ctx.status = 201;
  ctx.body = { data: { data: pageProduct, massege: "your products" } };
});

router.patch("/edit/:id", async (ctx: Context) => {
  const { id } = ctx.params;
  const parseResult = await ProductShoma.safeParse(ctx.request.body);
  if (!parseResult.success) {
    ctx.status = 400;
    return (ctx.body = { errors: parseResult.error.format() });
  }
  const updateProduct = parseResult.data;
  if (!id) {
    ctx.status = 400;
    ctx.body = { message: "Product id is required" };
    return;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateProduct, {
      new: true,      
      runValidators: true 
    });

    if (!updatedProduct) {
      ctx.status = 404;
      ctx.body = { message: "Product not found" };
      return;
    }

    ctx.status = 200;
    ctx.body = { 
      data: updatedProduct,
      message: "Product updated successfully"
    };
  } catch (err: any) {
    ctx.status = 500;
    ctx.body = { message: err.message };
  }
});

router.post("/create", async (ctx: Context) => {
  const parseResult = await ProductShoma.safeParse(ctx.request.body);
  if (!parseResult.success) {
    ctx.status = 400;
    return (ctx.body = { errors: parseResult.error.format() });
  }
  const { name, price, quantitiy } = parseResult.data;

  const existingProduct = await Product.findOne({ name });
  if (existingProduct)
    return (ctx.status = 400), (ctx.body = { message: "product not valid" });
  const product = new Product({ name, price, quantitiy });

  await product.save();
  ctx.status = 201;
  ctx.body = { data: { data: product, massege: "your product" } };
});

router.delete("/delete/:id", async (ctx: Context) => {
  const { id } = ctx.params;
  if (!id) {
    ctx.status = 400;
    ctx.body = { message: "id is required" };
    return;
  }
  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    ctx.status = 404;
    ctx.body = { message: "Product not found" };
    return;
  }

  ctx.status = 200;
  ctx.body = {
    data: deletedProduct,
    message: "Product deleted successfully",
  };
});

export default router;
