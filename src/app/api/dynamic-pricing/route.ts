import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({
      hasExpiry: true,
      expiryDate: { $ne: null },
    });

    console.log("Products Found:", products.length);

    const today = new Date();

    for (const product of products) {
      if (!product.expiryDate) {
  continue;
}

const expiryDate = new Date(product.expiryDate as Date);

const daysLeft = Math.ceil(
  (expiryDate.getTime() - today.getTime()) /
  (1000 * 60 * 60 * 24)
);

      let discount = 0;

      if (daysLeft <= 1) {
        discount = 50;
      } else if (daysLeft <= 3) {
        discount = 30;
      } else if (daysLeft <= 7) {
        discount = 15;
      } else {
        discount = 0;
      }

      const discountPrice =
        discount > 0
          ? product.price - (product.price * discount) / 100
          : product.price;

      const updated = await Product.findByIdAndUpdate(
        product._id,
        {
          $set: {
            discountPercent: discount,
            discountPrice: discountPrice,
          },
        },
        {
          new: true,
        }
      );

      console.log("Updated:", updated?.name);
      console.log(
        "Days Left:",
        daysLeft,
        "Price:",
        product.price,
        "Discount:",
        discount,
        "New Price:",
        discountPrice
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dynamic pricing updated successfully",
    });
  } catch (error) {
    console.error("Dynamic Pricing Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}