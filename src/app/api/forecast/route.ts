import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find();

    const mlResponse = await fetch(
  "https://kirana-based-inventory-production.up.railway.app/forecast"
);

    const mlData = await mlResponse.json();

    const totalStock = products.reduce(
  (sum, product) => sum + product.currentStock,
  0
);

const lowStockProducts = products.filter(
  (product) => product.currentStock < 10
);

const totalReorderQty = lowStockProducts.reduce(
  (sum, product) =>
    sum + (10 - product.currentStock),
  0
);

    return NextResponse.json({
  totalProducts: products.length,
  totalStock,
  forecastDemand: mlData.forecast,

  lowStockCount: lowStockProducts.length,

  totalReorderQty,

  stockHealth:
    lowStockProducts.length > 0
      ? "Attention Required"
      : "Healthy",
});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Forecast failed",
      },
      {
        status: 500,
      }
    );
  }
}