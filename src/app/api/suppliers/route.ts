import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Supplier from "@/models/Supplier";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const supplier = await Supplier.create(body);

    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 },
    );
  }
}

export async function GET() {
  await dbConnect();

  const suppliers = await Supplier.find();

  return NextResponse.json(suppliers);
}
