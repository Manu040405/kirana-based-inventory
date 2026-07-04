import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  suppliedProducts: [String]
});

export default mongoose.models.Supplier ||
mongoose.model("Supplier", SupplierSchema);