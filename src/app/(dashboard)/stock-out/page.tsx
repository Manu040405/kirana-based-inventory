"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Html5QrcodeScanner } from "html5-qrcode";
import { TrendingDown, Loader2, ScanLine } from "lucide-react"
interface Product {
    _id: string;
    name: string;
    unit: string;
    price: number;
    currentStock: number;
     barcode?: string;
}

export default function StockOutPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [barcode, setBarcode] = useState("");
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setInitialLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch products:", err);
                setInitialLoading(false);
            });
    }, []);

    const selectedProductObj = products.find(p => p._id === selectedProduct);
    const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
        "reader",
        {
            fps: 10,
            qrbox: 250,
        },
        false
    );

    scanner.render(
        (decodedText) => {
            setBarcode(decodedText);

            const found = products.find(
                (p: any) => p.barcode === decodedText
            );

            if (found) {
                setSelectedProduct(found._id);
            }

            scanner.clear();
        },
        () => {}
    );
};
    const handleSubmit = async () => {
        if (!selectedProduct || !quantity) return alert("Please fill all fields");

        setLoading(true);
        try {
            const res = await fetch('/api/stock-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct,
                    quantity
                })
            });

            if (res.ok) {
                alert("Sale recorded successfully!");
                setQuantity("");
                setSelectedProduct("");

                // Update local stock to reflect change in dropdown
                setProducts(prev => prev.map(p =>
                    p._id === selectedProduct
                        ? { ...p, currentStock: p.currentStock - Number(quantity) }
                        : p
                ));
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to record sale");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">Stock Out Entry</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Record Sale</CardTitle>
                    <CardDescription>Record items sold to customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {initialLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Scan Barcode
                                </label>

                            <div className="flex gap-2">
                                <Input placeholder="Barcode"value={barcode}readOnly/>

                                    <Button type="button" onClick={startScanner}>
                                    <ScanLine className="h-4 w-4 mr-2" />
                                        Scan
                                    </Button>
                            </div>

                            <div id="reader"></div>
                            </div>
                                <label className="text-sm font-medium">Select Product</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">-- Choose Product --</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id} disabled={p.currentStock <= 0}>
                                            {p.name} ({p.currentStock} {p.unit} left)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Quantity Sold</label>
                                <Input type="number" placeholder="Enter quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
                                {selectedProductObj && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Max available: {selectedProductObj.currentStock} {selectedProductObj.unit}
                                    </p>
                                )}
                            </div>

                            <Button className="w-full size-lg bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingDown className="mr-2 h-4 w-4" />}
                                Confirm Sale
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
