"use client";

import React, { useState } from "react";

export default function TestPage() {
  const [functionName, setFunctionName] = useState("listChannelVideos");
  const [params, setParams] = useState('{"channelIdentifier": "@MrBeast"}');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableFunctions = ["getCurrentDate", "getChannelInfo", "listChannelVideos", "getVideoDetails"];

  async function handleTest() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let paramsObj = {};
      try {
        paramsObj = JSON.parse(params);
      } catch (e) {
        throw new Error("Parámetros inválidos: Deben ser un objeto JSON válido");
      }

      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          functionName,
          params: paramsObj,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error desconocido");
      }

      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Prueba de Funciones API</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Función:</label>
        <select
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {availableFunctions.map((func) => (
            <option key={func} value={func}>
              {func}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Parámetros (JSON):</label>
        <textarea
          value={params}
          onChange={(e) => setParams(e.target.value)}
          className="w-full p-2 border rounded font-mono text-sm"
          rows={5}
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? "Procesando..." : "Ejecutar Función"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
          <pre className="bg-gray-50 p-4 rounded border overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
