"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Plus, Search, Edit2, Trash2, Loader2, Save } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category?: string;
  unit: string;
  currentStock: number;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  icon: string;
  barcode?: string;
  hasExpiry?: boolean;
  expiryDate?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Edit Modal State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [saving, setSaving] = useState(false);

  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        if (isMounted) {
          setProducts(productsData);
          setCategories(categoriesData.map((c: { name: string }) => c.name));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category || "");
    setEditPrice(product.price.toString());
    setEditUnit(product.unit);
    setEditBarcode(product.barcode || "");
    setHasExpiry(product.hasExpiry || false);
    setExpiryDate(product.expiryDate ? product.expiryDate.split("T")[0] : "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    console.log({
      hasExpiry,
      expiryDate,
    });
    if (!editingProduct) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          price: Number(editPrice),
          unit: editUnit,
          barcode: editBarcode,
          hasExpiry,
          expiryDate,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map((p) => (p._id === updated._id ? updated : p)));
        setIsEditDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  // FILTER LOGIC
  const filteredProducts = products.filter((p) => {
    if (
      !p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.barcode?.includes(searchTerm)
    )
      return false;

    if (filterType === "low") return p.currentStock > 0 && p.currentStock <= 10;
    if (filterType === "out") return p.currentStock === 0;

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Product Inventory</h1>
        <Link href="/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-44">
          <Select
            options={["All", "Low Stock", "Out of Stock"]}
            value={
              filterType === "all"
                ? "All"
                : filterType === "low"
                  ? "Low Stock"
                  : "Out of Stock"
            }
            onChange={(value) => {
              if (value === "All") setFilterType("all");
              if (value === "Low Stock") setFilterType("low");
              if (value === "Out of Stock") setFilterType("out");
            }}
            placeholder="Filter"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border rounded-lg">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product._id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  {product.icon || "📦"}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Barcode: {product.barcode || "Not Assigned"}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {product.category} • {product.unit} • Stock:{" "}
                    <strong>{product.currentStock}</strong>
                    {/* AUTO STATUS BADGE */}
                    {product.currentStock === 0 ? (
                      <Badge variant="destructive" className="ml-2">
                        Out of Stock
                      </Badge>
                    ) : product.currentStock <= 10 ? (
                      <Badge className="ml-2 bg-orange-500">Low Stock</Badge>
                    ) : (
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  {product.discountPrice && product.discountPercent ? (
                    <>
                      <p className="text-xs text-gray-400 line-through">
                        ₹{product.price}
                      </p>

                      <p className="font-bold text-green-600">
                        ₹{product.discountPrice}
                      </p>

                      <p className="text-red-500 text-xs font-semibold">
                        {product.discountPercent}% OFF
                      </p>
                    </>
                  ) : (
                    <p className="font-bold">₹{product.price}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit2 className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product._id, product.name)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Product"
      >
        <div className="space-y-4">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Product Name"
          />
          <Select
            options={categories}
            value={editCategory}
            onChange={setEditCategory}
            placeholder="Category"
          />
          <Input
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            placeholder="Price"
          />
          <Input
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value)}
            placeholder="Unit"
          />
          <Input
            value={editBarcode}
            onChange={(e) => setEditBarcode(e.target.value)}
            placeholder="Barcode"
          />
          <label className="font-medium"> Has Expiry?</label>
          <select
            className="w-full border rounded-lg p-3"
            value={hasExpiry ? "yes" : "no"}
            onChange={(e) => setHasExpiry(e.target.value === "yes")}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>

          {hasExpiry && (
            <>
              <label className="font-medium">Expiry Date</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
