import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import dbConnect from "@/lib/db";

import Product from "@/models/Product";
import Customer from "@/models/Customer";
import Bill from "@/models/Bill";
import Transaction from "@/models/Transaction";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
    } = await req.json();

    if (
      !customerName ||
      !customerPhone ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let totalAmount = 0;

    const billItems: {
      productName: string;
      quantity: number;
      price: number;
      total: number;
    }[] = [];

    for (const item of items) {
      const product = await Product.findById(
        item.productId
      );

      if (!product) {
        continue;
      }

      if (
        product.currentStock <
        Number(item.quantity)
      ) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}`,
          },
          {
            status: 400,
          }
        );
      }

      const itemTotal =
        Number(product.price) *
        Number(item.quantity);

      totalAmount += itemTotal;

      // Reduce stock
      product.currentStock -= Number(
        item.quantity
      );

      // Update status
      if (product.currentStock > 10) {
        product.status = "Active";
      } else if (product.currentStock > 0) {
        product.status = "Low Stock";
      } else {
        product.status = "Out of Stock";
      }

      await product.save();

      // Create OUT transaction
      await Transaction.create({
        product: product._id,
        type: "OUT",
        quantity: Number(item.quantity),
        price: Number(product.price),
        total: itemTotal,
      });

      billItems.push({
        productName: product.name,
        quantity: Number(item.quantity),
        price: Number(product.price),
        total: itemTotal,
      });
    }

    const loyaltyPoints =
      Math.floor(totalAmount / 100);

    let customer = await Customer.findOne({
      phone: customerPhone,
    });

    if (!customer) {
      customer = await Customer.create({
        name: customerName,
        phone: customerPhone,
        loyaltyPoints,
        totalSpent: totalAmount,
      });
    } else {
      customer.loyaltyPoints += loyaltyPoints;
      customer.totalSpent += totalAmount;

      await customer.save();
    }

    const invoiceNumber =
      "INV" + Date.now();

    const bill = await Bill.create({
      invoiceNumber,
      customerName,
      customerPhone,
      customerEmail,
      items: billItems,
      totalAmount,
      loyaltyPointsEarned: loyaltyPoints,
    });

    // Send Invoice Email
    if (customerEmail) {
      const transporter =
        nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

      let invoiceHtml = `
        <h2>Invoice ${invoiceNumber}</h2>

        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>

        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
      `;

      billItems.forEach((item) => {
        invoiceHtml += `
          <tr>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.total}</td>
          </tr>
        `;
      });

      invoiceHtml += `
        </table>

        <br/>

        <h3>Total Amount: ₹${totalAmount}</h3>

        <h3>Loyalty Points Earned: ${loyaltyPoints}</h3>

        <p>Thank you for shopping with us.</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Invoice ${invoiceNumber}`,
        html: invoiceHtml,
      });
    }

    return NextResponse.json({
      success: true,
      invoiceNumber,
      totalAmount,
      loyaltyPoints,
      bill,
    });
  } catch (error) {
    console.error("Billing Error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate invoice",
      },
      {
        status: 500,
      }
    );
  }
}