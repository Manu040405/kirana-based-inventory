import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema(
{
  supplierName: String,
  productName: String,
  quantity: Number,
  status: {
    type: String,
    default: "Pending"
  }
},
{
  timestamps: true
}
);

export default mongoose.models.PurchaseOrder ||
mongoose.model("PurchaseOrder", PurchaseOrderSchema);