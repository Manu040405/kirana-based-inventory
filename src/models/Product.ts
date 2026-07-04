import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  unit: { type: String, required: true },
  currentStock: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  price: { type: Number, required: true },
  icon: { type: String, default: "📦" },
  status: {
    type: String,
    enum: ["Active", "Low Stock", "Out of Stock"],
    default: "Active",
  },
  hasExpiry: { type: Boolean, default: false },
  barcode: {
    type: String,
    unique: true,
    default: "",
  },
  expiryDate: { type: Date },
  discountPrice: { type: Number },
  discountPercent: { type: Number, default: 0 },
}, { timestamps: true });

delete mongoose.models.Product;

export default mongoose.model("Product", ProductSchema);