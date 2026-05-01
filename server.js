import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Operator mappings
const operatorMap = {
  $gt: ">",
  $gte: ">=",
  $lt: "<",
  $lte: "<=",
  $ne: "!=",
  $eq: "=",
};

// Parse Mongo filter → SQL WHERE
function parseFilter(filter) {
  const conditions = [];

  for (const [field, value] of Object.entries(filter)) {
    if (field === "$or") {
      const orParts = value.map((f) => `(${parseFilter(f)})`);
      conditions.push(orParts.join(" OR "));
    } else if (field === "$and") {
      const andParts = value.map((f) => `(${parseFilter(f)})`);
      conditions.push(andParts.join(" AND "));
    } else if (typeof value === "object" && value !== null) {
      for (const [op, operand] of Object.entries(value)) {
        const sqlOp = operatorMap[op];
        if (sqlOp) {
          const val =
            typeof operand === "string" ? `'${operand}'` : operand;
          conditions.push(`${field} ${sqlOp} ${val}`);
        }
      }
    } else {
      const val = typeof value === "string" ? `'${value}'` : value;
      conditions.push(`${field} = ${val}`);
    }
  }

  return conditions.join(" AND ");
}

// 🔥 Safe parser for Mongo-style queries
function parseArgs(argsStr) {
  if (!argsStr) return [];

  try {
    // Allows Mongo-style objects (unquoted keys, $operators)
    return Function(`return [${argsStr}]`)();
  } catch (err) {
    throw new Error("Invalid MongoDB query format");
  }
}

// Main converter
function mongoToSQL(query) {
  const match = query.match(/db\.(\w+)\.(\w+)\(([\s\S]*)\)/);

  if (!match) throw new Error("Invalid MongoDB query format");

  const collection = match[1];
  const operation = match[2];
  const argsStr = match[3].trim();

  const args = parseArgs(argsStr);

  // ---------- FIND ----------
  if (operation === "find") {
    const filter = args[0] || {};
    const projection = args[1] || null;

    let columns = "*";
    if (projection) {
      const included = Object.entries(projection)
        .filter(([_, v]) => v === 1)
        .map(([k]) => k);

      if (included.length > 0) columns = included.join(", ");
    }

    const where =
      Object.keys(filter).length > 0
        ? ` WHERE ${parseFilter(filter)}`
        : "";

    return `SELECT ${columns} FROM ${collection}${where};`;
  }

  // ---------- FIND ONE ----------
  if (operation === "findOne") {
    const filter = args[0] || {};

    const where =
      Object.keys(filter).length > 0
        ? ` WHERE ${parseFilter(filter)}`
        : "";

    return `SELECT * FROM ${collection}${where} LIMIT 1;`;
  }

  // ---------- INSERT ----------
  if (operation === "insertOne") {
    const doc = args[0] || {};

    const keys = Object.keys(doc).join(", ");
    const vals = Object.values(doc)
      .map((v) => (typeof v === "string" ? `'${v}'` : v))
      .join(", ");

    return `INSERT INTO ${collection} (${keys}) VALUES (${vals});`;
  }

  // ---------- UPDATE ----------
  if (operation === "updateOne" || operation === "updateMany") {
    const filter = args[0] || {};
    const update = args[1] || {};

    if (!update.$set) {
      throw new Error("Only $set is supported in update");
    }

    const setClause = Object.entries(update.$set)
      .map(
        ([k, v]) => `${k} = ${typeof v === "string" ? `'${v}'` : v}`
      )
      .join(", ");

    const where =
      Object.keys(filter).length > 0
        ? ` WHERE ${parseFilter(filter)}`
        : "";

    const limit = operation === "updateOne" ? " LIMIT 1" : "";

    return `UPDATE ${collection} SET ${setClause}${where}${limit};`;
  }

  // ---------- DELETE ----------
  if (operation === "deleteOne" || operation === "deleteMany") {
    const filter = args[0] || {};

    const where =
      Object.keys(filter).length > 0
        ? ` WHERE ${parseFilter(filter)}`
        : "";

    const limit = operation === "deleteOne" ? " LIMIT 1" : "";

    return `DELETE FROM ${collection}${where}${limit};`;
  }

  // ---------- COUNT ----------
  if (operation === "countDocuments") {
    const filter = args[0] || {};

    const where =
      Object.keys(filter).length > 0
        ? ` WHERE ${parseFilter(filter)}`
        : "";

    return `SELECT COUNT(*) FROM ${collection}${where};`;
  }

  throw new Error(`Unsupported operation: ${operation}`);
}

// ---------- ROUTE ----------
app.post("/convert", (req, res) => {
  const { query } = req.body;

  try {
    const sql = mongoToSQL(query.trim());
    res.json({ sql });
  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ---------- SERVER ----------
app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});