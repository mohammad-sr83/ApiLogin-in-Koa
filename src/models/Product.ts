import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, unique: true },
  quantitiy: { type: String },
});

export default mongoose.model("Product", ProductSchema);
