"use client";

import { useEffect, useState } from "react";

interface Bill {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  loyaltyPointsEarned: number;
  createdAt: string;

  items: {
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
}

export default function InvoiceHistoryPage() {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    fetch("/api/invoice-history")
      .then((res) => res.json())
      .then((data) => setBills(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Invoice History</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Points</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id} className="border-t">
                <td className="p-3">{bill.invoiceNumber}</td>

                <td className="p-3">{bill.customerName}</td>

                <td className="p-3">{bill.customerPhone}</td>
                <td className="p-3">
                  {bill.items?.map((item, index) => (
                    <div key={index}>
                      {item.productName} × {item.quantity} = ₹{item.total}
                    </div>
                  ))}
                </td>

                <td className="p-3">₹{bill.totalAmount}</td>

                <td className="p-3">{bill.loyaltyPointsEarned}</td>

                <td className="p-3">
                  {new Date(bill.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
