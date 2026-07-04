"use client";

import { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface BillItem {
  productId: string;
  quantity: number;
}

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [items, setItems] = useState<BillItem[]>([
    {
      productId: "",
      quantity: 1,
    },
  ]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const calculateTotal = () => {
    let total = 0;

    items.forEach((item) => {
      const product = products.find((p) => p._id === item.productId);

      if (product) {
        total += product.price * item.quantity;
      }
    });

    return total;
  };

  const generateInvoice = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      alert("Enter customer details");
      return;
    }

    const validItems = items.filter(
      (item) => item.productId && item.quantity > 0,
    );

    if (validItems.length === 0) {
      alert("Add at least one product");
      return;
    }

    const res = await fetch("/api/billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        items: validItems,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(
        `Invoice Generated Successfully

Invoice No: ${data.invoiceNumber}

Invoice emailed to:
${customerEmail}`,
      );

      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");

      setItems([
        {
          productId: "",
          quantity: 1,
        },
      ]);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Billing & Loyalty</h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <input
          type="text"
          placeholder="Customer Name"
          className="w-full border p-3 rounded"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Customer Email"
          className="w-full border p-3 rounded"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Customer Phone"
          className="w-full border p-3 rounded"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />

        <h2 className="font-semibold text-lg">Products</h2>

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-3">
            <select
              className="border p-3 rounded"
              value={item.productId}
              onChange={(e) => {
                const updated = [...items];

                updated[index].productId = e.target.value;

                setItems(updated);
              }}
            >
              <option value="">Select Product</option>

              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - ₹{product.price}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              className="border p-3 rounded"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => {
                const updated = [...items];

                updated[index].quantity = Number(e.target.value);

                setItems(updated);
              }}
            />

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="bg-red-500 text-white rounded px-4"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Product
        </button>

        <div className="bg-green-50 border rounded p-4">
          <h3 className="font-semibold">Grand Total</h3>

          <p className="text-2xl font-bold text-green-600">
            ₹{calculateTotal()}
          </p>

          <p className="text-sm text-gray-600">
            Loyalty Points Earned: {Math.floor(calculateTotal() / 100)}
          </p>
        </div>

        <button
          onClick={generateInvoice}
          className="w-full bg-black text-white p-3 rounded"
        >
          Generate Invoice
        </button>
      </div>
    </div>
  );
}
