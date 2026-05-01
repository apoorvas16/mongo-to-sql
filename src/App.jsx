import { useState } from "react"

export default function App() {
  const [mongoQuery, setMongoQuery] = useState("")
  const [sqlQuery, setSqlQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleConvert = async () => {
    if (!mongoQuery.trim()) {
      setSqlQuery("Please enter a Mongo query")
      return
    }

    setLoading(true)
    setSqlQuery("") // clear previous output

    try {
      const res = await fetch("http://localhost:3001/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mongoQuery }),
      })

      const data = await res.json()

      if (res.ok) {
        setSqlQuery(data.sql)
      } else {
        setSqlQuery(data.error || "Conversion failed")
      }

    } catch (error) {
      setSqlQuery("Server not reachable")
    }

    setLoading(false)
  }

  const handleCopy = () => {
    if (!sqlQuery) return
    navigator.clipboard.writeText(sqlQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white px-6 py-12 relative overflow-hidden">

      {/* glow */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] -translate-x-1/2" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 relative z-10">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Mongo → SQL Converter
        </h1>
        <p className="text-neutral-400 mt-3 text-lg">
          Convert MongoDB queries into SQL instantly
        </p>
      </div>

      {/* Layout */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">

        {/* Mongo Input */}
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl hover:border-blue-500/40 transition">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Mongo Query</h2>

            <button
              onClick={() =>
                setMongoQuery('db.users.find({ age: { $gt: 25 } })')
              }
              className="text-xs text-blue-400 hover:underline"
            >
              Try example
            </button>
          </div>

          <textarea
            value={mongoQuery}
            onChange={(e) => setMongoQuery(e.target.value)}
            placeholder={`db.users.find({ age: { $gt: 25 } })`}
            className="w-full h-64 bg-black/80 border border-neutral-800 rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* SQL Output */}
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl hover:border-green-500/40 transition">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">SQL Output</h2>

            <button
              onClick={handleCopy}
              className="text-xs text-neutral-400 hover:text-white transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="w-full h-64 bg-black/80 border border-neutral-800 rounded-xl p-4 text-sm font-mono overflow-auto">
            {loading ? (
              <span className="text-blue-400 animate-pulse">Converting...</span>
            ) : sqlQuery ? (
              <span
                className={
                  sqlQuery.toLowerCase().includes("error")
                    ? "text-red-400"
                    : "text-green-400"
                }
              >
                {sqlQuery}
              </span>
            ) : (
              <span className="text-neutral-500">
                Your SQL query will appear here...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="max-w-6xl mx-auto mt-10 flex justify-center relative z-10">
        <button
          onClick={handleConvert}
          disabled={loading || !mongoQuery.trim()}
          className="relative bg-blue-600 hover:bg-blue-500 active:scale-95 transition px-10 py-3 rounded-xl font-medium shadow-lg shadow-blue-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Converting..." : "Convert Query"}
        </button>
      </div>
    </div>
  )
}