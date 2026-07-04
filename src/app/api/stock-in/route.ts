import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Transaction from "@/models/Transaction";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const data = await req.json();

    const {
      productId,
      quantity,
      price,
      costPrice,
    } = data;

    console.log("Received Data:", {
      productId,
      quantity,
      price,
      costPrice,
    });

    if (
      !productId ||
      !quantity ||
      !price ||
      costPrice === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update Stock
    product.currentStock += Number(quantity);

    // Update Selling Price
    product.price = Number(price);

    // Update Cost Price
    product.costPrice = Number(costPrice);

    // Update Status
    if (product.currentStock > 10) {
      product.status = "Active";
    } else if (product.currentStock > 0) {
      product.status = "Low Stock";
    } else {
      product.status = "Out of Stock";
    }

    console.log("Before Save:", {
      name: product.name,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.currentStock,
    });

    await product.save();

    console.log("After Save:", product);

    // Create Transaction
    const transaction = await Transaction.create({
      product: productId,
      type: "IN",
      quantity: Number(quantity),
      price: Number(price),
      costPrice: Number(costPrice),
      total: Number(quantity) * Number(price),
    });

    return NextResponse.json(
      {
        success: true,
        product,
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Stock In Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}