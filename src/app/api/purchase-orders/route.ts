import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";

import Product from "@/models/Product";
import Supplier from "@/models/Supplier";
import PurchaseOrder from "@/models/PurchaseOrder";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { productId } = await req.json();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    console.log("Product Name:", product.name);

const supplier = await Supplier.findOne({
  suppliedProducts: { $in: [product.name] }
});

console.log("Supplier Found:", supplier);
    if (!supplier) {
      return NextResponse.json(
        { error: "No supplier found for this product" },
        { status: 404 }
      );
    }

    const recommendedQuantity =
      product.currentStock < 10
        ? 50 - product.currentStock
        : 0;
    const existingPO = await PurchaseOrder.findOne({
  productName: product.name,
  supplierName: supplier.name,
  status: "Pending",
});

if (existingPO) {
  return NextResponse.json(
    {
      error: "Purchase Order already exists for this product",
    },
    { status: 400 }
  );
}
    const purchaseOrder = await PurchaseOrder.create({
      supplierName: supplier.name,
      productName: product.name,
      quantity: recommendedQuantity,
      status: "Pending"
    });
    console.log("Sending email to:", supplier.email);
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: supplier.email,
  subject: "Purchase Order Request",
  html: `
    <h2>Purchase Order</h2>

    <p>Dear ${supplier.name},</p>

    <p>Please supply the following item:</p>

    <ul>
      <li><strong>Product:</strong> ${product.name}</li>
      <li><strong>Quantity:</strong> ${recommendedQuantity}</li>
    </ul>

    <p>Status: Pending</p>

    <br/>

    <p>Regards,</p>
    <p>Kirana Inventory System</p>
  `,
});
console.log("Email sent successfully");
    return NextResponse.json({
      success: true,
      purchaseOrder
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate purchase order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const orders = await PurchaseOrder.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}