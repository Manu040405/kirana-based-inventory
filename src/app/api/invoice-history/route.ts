import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";

export async function GET() {
  try {
    await dbConnect();

    const bills = await Bill.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}