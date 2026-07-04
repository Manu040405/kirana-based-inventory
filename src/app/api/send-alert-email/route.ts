import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email } = await req.json();

    const lowStock = await Product.find({
      currentStock: { $lt: 10 },
    });

    if (lowStock.length === 0) {
      return NextResponse.json({
        message: "No low stock items",
      });
    }

    let message = "🚨 Low Stock Alert\n\n";

    lowStock.forEach((item) => {
      const reorderQty = 10 - item.currentStock;

      message += `
Product: ${item.name}
Current Stock: ${item.currentStock} ${item.unit}
Recommended Reorder: ${reorderQty} ${item.unit}

`;
    });

    const htmlMessage = `
      <div style="font-family:Arial,sans-serif">
        <h2>🚨 Low Stock Alert</h2>

        <table
          border="1"
          cellpadding="8"
          cellspacing="0"
          style="border-collapse:collapse"
        >
          <tr>
            <th>Product</th>
            <th>Current Stock</th>
            <th>Recommended Reorder</th>
          </tr>

          ${lowStock
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.currentStock} ${item.unit}</td>
              <td>${10 - item.currentStock} ${item.unit}</td>
            </tr>
          `
            )
            .join("")}
        </table>

        <br/>

        <p>
          Generated automatically by
          Kirana Inventory Management System.
        </p>
      </div>
    `;

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
      from: `"Kirana Inventory System" <${process.env.EMAIL_USER}>`,
      to: email || "manogna.perka2005@gmail.com",
      subject: "🚨 Low Stock Alert - Kirana Store",
      text: message,
      html: htmlMessage,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send email",
      },
      {
        status: 500,
      }
    );
  }
}