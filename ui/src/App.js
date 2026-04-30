import { useState, useEffect, useRef } from "react";

const EXAMPLES = [
  'db.users.find({"age": {"$gt": 21}}, {"name": 1, "age": 1})',
  'db.orders.find({"status": "active"}, {"id": 1})',
  'db.products.find({})',
];

function highlightSQL(sql) {
  const keywords = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "NOT",
    "IN", "LIKE", "ORDER BY", "LIMIT", "INSERT", "UPDATE", "DELETE"
  ];

  let result = sql;

  keywords.forEach((kw) => {
    result = result.replace(
      new RegExp(`\\b${kw}\\b`, "g"),
      `<span class="text-blue-400 font-medium">${kw}</span>`
    );
  });

  result = result.replace(
    /(<span[^>]*>FROM<\/span>) (\w+)/,
    `$1 <span class="text-yellow-400">$2</span>`
  );

  return result;
}

function getQueryType(sql) {
  if (!sql) return null;
  const upper = sql.trim().toUpperCase();
  if (upper.startsWith("SELECT")) return "SELECT";
  if (upper.startsWith("INSERT")) return "INSERT";
  if (upper.startsWith("UPDATE")) return "UPDATE";
  if (upper.startsWith("DELETE")) return "DELETE";
  return null;
}

const badgeColors = {
  SELECT: "bg-emerald-900 text-emerald-300",
  INSERT: "bg-blue-900 text-blue-300",
  UPDATE: "bg-yellow-900 text-yellow-300",
  DELETE: "bg-red-900 text-red-300",
};

export default function App() {
  const [mongoQuery, setMongoQuery] = useState(EXAMPLES[0]);
  const [sql, setSql] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleConvert();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mongoQuery]);

  const handleConvert = async () => {
    if (!mongoQuery.trim()) return;

    setError("");
    setSql("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mongoQuery }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSql(data.sql);
        setHistory((prev) => {
          const entry = { query: mongoQuery, sql: data.sql };
          const filtered = prev.filter((h) => h.query !== mongoQuery);
          return [entry, ...filtered].slice(0, 5);
        });
      }
    } catch {
      setError("Server not reachable on port 3001");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!sql) return;

    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleClear = () => {
    setMongoQuery("");
    setSql("");
    setError("");
    textareaRef.current?.focus();
  };

  const queryType = getQueryType(sql);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-semibold">MongoDB → SQL</h1>
            <p className="text-sm text-slate-400">
              Convert Mongo queries instantly
            </p>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => { setMongoQuery(ex); setSql(""); }}
                className={`px-3 py-1 rounded-full text-xs border transition 
                ${mongoQuery === ex
                    ? "bg-emerald-900 border-emerald-700 text-emerald-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
              >
                {ex.split(".")[1]?.split(".")[0]}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={mongoQuery}
            onChange={(e) => setMongoQuery(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleConvert}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium transition"
            >
              {loading ? "Converting..." : "Convert"}
            </button>

            <button
              onClick={handleClear}
              className="px-5 py-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800"
            >
              Clear
            </button>

            <span className="ml-auto text-xs text-slate-500">
              Ctrl + Enter
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-900/40 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Output */}
        {sql && (
          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">

            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-400">SQL Output</span>

              <div className="flex items-center gap-2">
                {queryType && (
                  <span className={`text-xs px-2 py-1 rounded ${badgeColors[queryType]}`}>
                    {queryType}
                  </span>
                )}

                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1 border border-slate-700 rounded hover:bg-slate-800 text-slate-400"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div
              className="bg-slate-950 rounded-lg p-4 font-mono text-sm leading-relaxed overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: highlightSQL(sql) }}
            />
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm text-slate-400 mb-3">Recent</h3>

            {history.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setMongoQuery(item.query);
                  setSql(item.sql);
                }}
                className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition"
              >
                <div className="text-xs text-slate-400 truncate">
                  {item.query}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {item.sql}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}