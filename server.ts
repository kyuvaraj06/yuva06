import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { seedDatabase } from "./server/db.js";

// Import router endpoints
import authRouter from "./server/routes/auth.js";
import productsRouter from "./server/routes/products.js";
import ordersRouter from "./server/routes/orders.js";
import paymentsRouter from "./server/routes/payments.js";
import adminRouter from "./server/routes/admin.js";

async function startServer() {
  // Ensure the database files are seeded on start
  seedDatabase();

  const app = express();
  const PORT = 3000;

  // Essential API middlewares
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Basic request logging to assist diagnostics
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Mount API endpoints
  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/admin", adminRouter);

  // Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Hot module replacement or static file server deployment flow
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting master server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Let Vite act as the catch-all asset responder
    app.use(vite.middlewares);
  } else {
    console.log("Starting master server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`========================================`);
    console.log(`🚀 Tamil Agro Mart fullstack server active`);
    console.log(`🔗 Local preview: http://localhost:${PORT}`);
    console.log(`========================================`);
  });
}

startServer().catch((err) => {
  console.error("FATAL: Failed to boot Tamil Agro Mart server:", err);
});
