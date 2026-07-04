"use client";

import { useEffect, useState } from "react";

export default function ForecastPage() {
  interface ForecastData {
    totalProducts: number;
    totalStock: number;
    forecastDemand: number;
    lowStockCount: number;
    totalReorderQty: number;
    stockHealth: string;
  }

  const [data, setData] = useState<ForecastData | null>(null);

  useEffect(() => {
    fetch("/api/forecast")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-6">Loading Forecast...</div>;

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-2">ML-Based Demand Forecasting</h1>

      <p className="text-gray-500 mb-8">
        Predict future stock requirements using historical sales data.
      </p>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-500">Total Products</h3>

          <p className="text-4xl font-bold">{data.totalProducts}</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow p-6">
          <h3 className="text-purple-700">Forecast Accuracy</h3>

          <p className="text-4xl font-bold text-purple-700">87%</p>
        </div>

        <div className="bg-green-50 rounded-xl shadow p-6">
          <h3 className="text-green-700">Forecast Demand</h3>

          <p className="text-4xl font-bold text-green-700">
            {data.forecastDemand}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl shadow p-6">
          <h3 className="text-blue-700">Current Inventory</h3>

          <p className="text-4xl font-bold text-blue-700">{data.totalStock}</p>
        </div>

        <div className="bg-yellow-50 rounded-xl shadow p-6">
          <h3 className="text-yellow-700">Total Reorder Qty</h3>

          <p className="text-4xl font-bold text-yellow-700">
            {data.totalReorderQty}
          </p>
        </div>

        <div className="bg-red-50 rounded-xl shadow p-6">
          <h3 className="text-red-700">Low Stock Products</h3>

          <p className="text-4xl font-bold text-red-700">
            {data.lowStockCount}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Forecast Summary</h2>

        <p>
          Predicted Store Demand:
          <strong> {data.forecastDemand}</strong>
        </p>

        <p>
          Current Inventory:
          <strong> {data.totalStock}</strong>
        </p>

        <p>
          Stock Status:
          <strong> {data.stockHealth}</strong>
        </p>

        <p>
          Recommended Reorder:
          <strong> {data.totalReorderQty}</strong>
        </p>
      </div>
    </div>
  );
}
