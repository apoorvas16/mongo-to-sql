# 🧠 MongoDB to SQL Converter

A full-stack web application that converts MongoDB queries into SQL queries in real time.

## 🚀 Features

* 🔄 Convert MongoDB queries to SQL
* ⚡ Fast and responsive UI using Vite + React
* 🌐 Backend powered by Express.js
* 🎯 Supports common MongoDB operators like `$gt`, `$lt`, `$eq`, etc.

## 🛠 Tech Stack

* Frontend: React + Vite + Tailwind CSS
* Backend: Node.js + Express
* Language: JavaScript

## 📂 Project Structure

```
mongo-to-sql/
│── src/              # Frontend (React)
│── public/           # Static assets
│── server.js         # Backend server
│── package.json
│── vite.config.js
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/your-username/mongo-to-sql.git
cd mongo-to-sql
```

### 2. Install dependencies

```
npm install
```

### 3. Run the backend

```
node server.js
```

### 4. Run the frontend

```
npm run dev
```

## 📌 Example

### MongoDB Query:

```
db.users.find({ age: { $gt: 21 } })
```

### SQL Output:

```
SELECT * FROM users WHERE age > 21;
```

## 🧪 Future Improvements

* Add support for complex nested queries
* Improve UI/UX
* Add authentication
* Deploy to cloud (Vercel + Render)

## 👨‍💻 Author

Apoorva Soni
