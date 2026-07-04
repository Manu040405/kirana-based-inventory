import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PurchaseOrder from "@/models/PurchaseOrder";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        status: "Received",
      },
      {
        new: true,
      }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        {
          error: "Purchase Order not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      purchaseOrder: updatedOrder,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update purchase order",
      },
      {
        status: 500,
      }
    );
  }
}