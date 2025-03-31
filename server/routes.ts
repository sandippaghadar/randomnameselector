import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateNamesRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to generate random names
  app.post('/api/names/generate', async (req, res) => {
    try {
      // Validate request body
      const result = generateNamesRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request",
          errors: result.error.format()
        });
      }
      
      const { count } = result.data;
      
      // Generate random names
      const names = storage.generateRandomNames(count);
      
      // Return the generated names
      return res.status(200).json({ names });
    } catch (error) {
      console.error('Error generating names:', error);
      return res.status(500).json({ message: "Failed to generate names" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
