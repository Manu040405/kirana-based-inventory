import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";

export async function GET() {
  try {
    await dbConnect();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ createdAt: -1 });

    return NextResponse.json(bills);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch invoices",
      },
      {
        status: 500,
      }
    );
  }
}