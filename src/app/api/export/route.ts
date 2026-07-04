import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET() {
  try {
    await dbConnect();

    const transactions = await Transaction.find({})
      .populate("product");

    let csv =
      "Date,Product,Type,Quantity,Cost Price,Selling Price,Profit Per Unit,Total Profit,Total Amount\n";

    transactions.forEach((t) => {
      const date = new Date(t.createdAt)
        .toISOString()
        .split("T")[0];

      const product = t.product as {
        name?: string;
        costPrice?: number;
        price?: number;
        discountPrice?: number;
      };

      const productName =
        product?.name || "Deleted Product";

      const costPrice =
        product?.costPrice || 0;

      const sellingPrice =
        product?.discountPrice ||
        product?.price ||
        0;

      const profitPerUnit =
        sellingPrice - costPrice;

      const totalProfit =
        profitPerUnit * t.quantity;

      csv +=
        `${date},` +
        `${productName},` +
        `${t.type},` +
        `${t.quantity},` +
        `${costPrice},` +
        `${sellingPrice},` +
        `${profitPerUnit},` +
        `${totalProfit},` +
        `${t.total}\n`;
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="inventory_report.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}