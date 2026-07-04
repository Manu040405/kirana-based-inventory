"use client";

import { useState } from "react";

export default function SuppliersPage() {
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    suppliedProducts: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productName = new URLSearchParams(window.location.search).get(
        "product",
      );

      console.log("Product Name from URL:", productName);

      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...supplier,
          suppliedProducts: supplier.suppliedProducts
            .split(",")
            .map((p) => p.trim()),
        }),
      });

      if (!res.ok) {
        alert("Failed to add supplier");
        return;
      }

      if (productName) {
        const productRes = await fetch("/api/products");
        const products = await productRes.json();

        console.log("Products:", products);

        const product = products.find(
          (p: { _id: string; name: string }) => p.name === productName,
        );

        console.log("Matched Product:", product);

        if (!product) {
          alert(`Product '${productName}' not found`);
          return;
        }

        const poRes = await fetch("/api/purchase-orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product._id,
          }),
        });

        const poData = await poRes.json();

        console.log("PO Response:", poData);

        if (!poRes.ok) {
          alert(poData.error || "PO creation failed");
          return;
        }

        alert("Supplier Added & Purchase Order Created");

        window.location.href = "/purchase-orders";
      } else {
        alert("Supplier Added Successfully");
      }

      setSupplier({
        name: "",
        email: "",
        phone: "",
        suppliedProducts: "",
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Supplier Management</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          type="text"
          placeholder="Supplier Name"
          className="w-full border p-3 rounded"
          value={supplier.name}
          onChange={(e) =>
            setSupplier({
              ...supplier,
              name: e.target.value,
            })
          }
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={supplier.email}
          onChange={(e) =>
            setSupplier({
              ...supplier,
              email: e.target.value,
            })
          }
          required
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full border p-3 rounded"
          value={supplier.phone}
          onChange={(e) =>
            setSupplier({
              ...supplier,
              phone: e.target.value,
            })
          }
          required
        />

        <input
          type="text"
          placeholder="Products Supplied (comma separated)"
          className="w-full border p-3 rounded"
          value={supplier.suppliedProducts}
          onChange={(e) =>
            setSupplier({
              ...supplier,
              suppliedProducts: e.target.value,
            })
          }
          required
        />

        <button type="submit" className="bg-black text-white px-6 py-3 rounded">
          Add Supplier
        </button>
      </form>
    </div>
  );
}
