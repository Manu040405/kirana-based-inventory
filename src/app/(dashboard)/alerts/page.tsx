"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader2 } from "lucide-react";
import SendEmailButton from "@/components/SendEmailButton";
interface Product {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
}

export default function AlertsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  const lowStockItems = products.filter((p) => p.currentStock < 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alerts & Notification</h1>
        <SendEmailButton />
      </div>

      <div className="space-y-4">
        {/* Alerts Sections */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Low Stock Alerts</h2>
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : lowStockItems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No low stock alerts! Inventory is healthy.
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Current Stock:{" "}
                        <span className="text-destructive font-bold">
                          {item.currentStock} {item.unit}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="border-warning text-warning"
                      >
                        Reorder
                      </Badge>

                      <button
                        onClick={async () => {
                          const res = await fetch("/api/purchase-orders", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              productId: item._id,
                            }),
                          });

                          const data = await res.json();

                          if (res.ok) {
                            alert("Purchase Order Generated Successfully");
                          } else {
                            if (
                              data.error ===
                              "No supplier found for this product"
                            ) {
                              alert(
                                "Supplier not found. Please add supplier first.",
                              );

                              window.location.href = `/suppliers?product=${encodeURIComponent(item.name)}`;

                              return;
                            }

                            if (
                              data.error ===
                              "Purchase Order already exists for this product"
                            ) {
                              alert("Pending PO already exists.");
                            } else {
                              alert(data.error);
                            }
                          }
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Generate PO
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
