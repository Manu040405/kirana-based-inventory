"use client";

import { useEffect, useState } from "react";

interface PurchaseOrder {
  _id: string;
  supplierName: string;
  productName: string;
  quantity: number;
  status: string;
  createdAt?: string;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/purchase-orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markReceived = async (id: string) => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "PUT",
      });

      if (res.ok) {
        alert("Purchase Order Received");
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <p className="text-muted-foreground">
          Automatically generated purchase orders for low stock products.
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No purchase orders found.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Supplier</th>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Quantity</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
                <th className="p-4 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{order.supplierName}</td>

                  <td className="p-4">{order.productName}</td>

                  <td className="p-4 font-medium">{order.quantity}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Email Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-4">
                    {order.status === "Pending" ? (
                      <button
                        onClick={() => markReceived(order._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                      >
                        Mark Received
                      </button>
                    ) : order.status === "Email Failed" ? (
                      <span className="text-red-600 font-medium">
                        Email Failed
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        Completed
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
