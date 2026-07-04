"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) =>
        setCategories(
          data
            .filter((c: any) => c.name !== "Uncategorized")
            .map((c: any) => c.name),
        ),
      )
      .catch(console.error);
  }, []);

  // Form State
  const [productName, setProductName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [loading, setLoading] = useState(false);

  // Dialog State
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [barcode, setBarcode] = useState("");
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
        scanner.clear();
      },
      (error) => {
        console.log(error);
      },
    );
  };
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        setCategories([...categories, newCategoryName]);
        setSelectedCategory(newCategoryName);
        setNewCategoryName("");
        setIsCategoryDialogOpen(false);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    }
    setSavingCategory(false);
  };

  const handleSaveProduct = async () => {
    if (!productName || !unit || !price) {
      return alert(
        "Please fill at least Product Name, Unit, and Selling Price.",
      );
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName,
          category: selectedCategory,
          unit,
          price: Number(price),
          barcode,
          // minStock can be added to model later if needed, but not in current model schema
        }),
      });

      if (res.ok) {
        alert("Product Added Successfully!");
        router.push("/products");
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground text-sm">
            Create a new item in your inventory catalogue.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-none shadow-sm ring-1 ring-border/50">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Enter the basic information about the product.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name</label>
            <Input
              placeholder="e.g. Amul Milk 500ml"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Barcode</label>

            <div className="flex gap-2">
              <Input
                placeholder="Enter Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />

              <Button type="button" onClick={startScanner}>
                Scan
              </Button>
            </div>

            <div id="reader"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                options={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                onCreateNew={() => setIsCategoryDialogOpen(true)}
                placeholder="Select Category"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <Input
                placeholder="e.g. pkt, kg, ltr"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selling Price (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Stock Level</label>
              <Input
                type="number"
                placeholder="e.g. 5"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-base font-semibold">Has Expiry?</label>

            <select
              value={hasExpiry ? "yes" : "no"}
              onChange={(e) => setHasExpiry(e.target.value === "yes")}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {hasExpiry && (
            <div className="space-y-2">
              <label className="block text-base font-semibold">
                Expiry Date
              </label>

              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Link href="/products">
              <Button variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button
              className="rounded-xl min-w-[120px]"
              onClick={handleSaveProduct}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Product
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        title="Create New Category"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              placeholder="e.g. Frozen Foods"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Create Category</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
