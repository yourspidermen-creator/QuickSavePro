import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy route to bypass CORS
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ message: "URL is required" });
    }

    const fetchWithRetry = async (url: string, retries = 2): Promise<Response> => {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
          }
        });
        if (!response.ok && retries > 0 && response.status >= 500) {
          console.log(`Retrying... attempts left: ${retries}`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          return fetchWithRetry(url, retries - 1);
        }
        return response;
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          return fetchWithRetry(url, retries - 1);
        }
        throw error;
      }
    };

    try {
      const apiUrl = `https://quicksaveapi.onrender.com/api/download?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetchWithRetry(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "API request failed";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        return res.status(response.status).json({ message: errorMessage });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
