import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON and urlencoded parsers with large limits for high quality pictures & spreadsheets
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // Ensure 'uploads' folder exists (never write empty files or fail)
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Set up multer disk storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Clean filename from dangerous directory traversal characters, but keep Cambodian Unicode characters and safe characters intact
      const cleanName = file.originalname.replace(/[\/\?<>\\:\*\|"\^]/g, "_");
      cb(null, `${Date.now()}-${cleanName}`);
    }
  });

  // Allowed Extensions and MIME Types for robust cross-browser verification
  const allowedExtensions = [".pdf", ".xlsx", ".xls", ".csv"];
  const allowedMimeTypes = [
    "application/pdf",
    "application/x-pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/csv",
    "application/octet-stream"
  ];

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const isAllowedExt = allowedExtensions.includes(ext);
      const isAllowedMime = allowedMimeTypes.includes(file.mimetype);

      console.log(`[Upload Filter] Name: ${file.originalname}, Ext: ${ext}, MIME: ${file.mimetype}`);
      
      if (isAllowedExt || isAllowedMime) {
        cb(null, true);
      } else {
        cb(new Error("ប្រភេទឯកសារមិនត្រូវបានអនុញ្ញាតទេ! អនុញ្ញាតតែឯកសារ PDF និង Excel (.xlsx, .xls, .csv) ប៉ុណ្ណោះ។"));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // API Route: File Upload
  // Handles both /upload and /api/upload for perfect compatibility
  const uploadHandler = (req: express.Request, res: express.Response): any => {
    try {
      const file = req.file;
      console.log("[Upload Handler] File detail:", file);
      
      if (!file) {
        return res.status(400).json({ error: "No file was uploaded." });
      }

      console.log(`[Upload Handler] Checking size for ${file.originalname}: ${file.size} Bytes`);
      
      // Requirement 1: If size = 0 -> upload is broken/empty
      if (file.size === 0) {
        console.error(`[Upload Handler] REJECTED: File size is 0 bytes.`);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path); // Delete empty file immediately
        }
        return res.status(400).json({ error: "File upload failed. File is empty (0 Bytes)." });
      }

      // Return details of saved file with original name query param in URL so download uses exact original name
      const downloadUrl = `/download/${file.filename}?original=${encodeURIComponent(file.originalname)}`;
      return res.json({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: downloadUrl
      });
    } catch (err: any) {
      console.error("[Upload Handler] API Error:", err);
      return res.status(500).json({ error: err.message || "Internal server error during upload." });
    }
  };

  // Attach middleware and handle Multer error messages nicely
  const uploadMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("[Multer Middleware Error]:", err.message);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };

  app.post("/upload", uploadMiddleware, uploadHandler);
  app.post("/api/upload", uploadMiddleware, uploadHandler);

  // API Route: File Download & Preview with correct headers
  // Requirement 5: Download API with correct headers
  app.get("/download/:name", (req: express.Request, res: express.Response): any => {
    const filename = req.params.name;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }

    if (req.query.preview === "true") {
      // For preview in iframe, send inline Content-Disposition so browsers display it
      let contentType = "application/octet-stream";
      if (filename.toLowerCase().endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (filename.toLowerCase().endsWith(".xlsx")) {
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (filename.toLowerCase().endsWith(".xls")) {
        contentType = "application/vnd.ms-excel";
      } else if (filename.toLowerCase().endsWith(".csv")) {
        contentType = "text/csv";
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", "inline");
      return res.sendFile(filePath);
    } else {
      // Correct header for download using express res.download, preserving original name
      const originalName = req.query.original as string || filename;
      return res.download(filePath, originalName, (err) => {
        if (err) {
          console.error("[Download Error] Transmission failed:", err);
        }
      });
    }
  });

  // Central K/V JSON database file in uploads
  const dbPath = path.join(uploadDir, "db.json");

  // Helper to load db
  const loadDatabase = (): Record<string, any> => {
    try {
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, "utf-8");
        return JSON.parse(data);
      }
    } catch (err) {
      console.error("[JSON DB Load Error]:", err);
    }
    return {};
  };

  // Helper to save db
  const saveDatabase = (db: Record<string, any>) => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
    } catch (err) {
      console.error("[JSON DB Save Error]:", err);
    }
  };

  // API Route: Get entire database state (all keys) for initial front-end hydration
  app.get("/api/db/all", (req, res) => {
    try {
      const db = loadDatabase();
      res.json({ db });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Get state for specific key
  app.get("/api/db/:key", (req, res) => {
    try {
      const key = req.params.key;
      const db = loadDatabase();
      res.json({ value: db[key] || null });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Save state for specific key
  app.post("/api/db/:key", (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const db = loadDatabase();
      db[key] = value;
      saveDatabase(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Delete specific key from database
  app.delete("/api/db/:key", (req, res) => {
    try {
      const key = req.params.key;
      const db = loadDatabase();
      delete db[key];
      saveDatabase(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static dist folder or run Vite dev server
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode. Initializing Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode. Serving pre-built static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running internally on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup crash:", err);
});
