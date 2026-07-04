"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ScanLine, Loader2 } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Product {
  _id: string;
  name: string;
  unit: string;
  price: number;
  barcode?: string;
}

export default function StockInPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setInitialLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setInitialLoading(false);
      });
  }, []);

  const selectedProductObj = products.find((p) => p._id === selectedProduct);

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false,
    );

    scanner.render(
      (decodedText) => {
        setBarcode(decodedText);

        const found = products.find((p) => p.barcode === decodedText);

        if (found) {
          setSelectedProduct(found._id);
        }

        scanner.clear();
      },
      () => {},
    );
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity || !costPrice) {
      return alert("Please fill all fields");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/stock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: Number(quantity),

          // Selling Price
          price: Number(selectedProductObj?.price || 0),

          // Cost Price
          costPrice: Number(costPrice),
        }),
      });

      if (res.ok) {
        alert("Stock added successfully!");

        setQuantity("");
        setCostPrice("");
        setSelectedProduct("");
        setBarcode("");
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add stock");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold">Stock In Entry</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Batch</CardTitle>
          <CardDescription>
            Record purchase of items from supplier
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {initialLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Scan Barcode</label>

                <div className="flex gap-2">
                  <Input placeholder="Barcode" value={barcode} readOnly />

                  <Button type="button" onClick={startScanner}>
                    <ScanLine className="h-4 w-4 mr-2" />
                    Scan
                  </Button>
                </div>

                <div id="reader"></div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Product</label>

                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">-- Choose Product --</option>

                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>

                  <Input
                    type="number"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>

                  <Input disabled value={selectedProductObj?.unit || ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Cost Price per unit (₹)
                  </label>

                  <Input
                    type="number"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Current Selling Price (₹)
                  </label>

                  <Input
                    type="number"
                    disabled
                    value={selectedProductObj?.price || ""}
                  />
                </div>
              </div>

              <Button
                className="w-full mt-4"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add Stock
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
