import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateNamesRequestSchema, addNameSchema, removeNameSchema } from "@shared/schema";

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

  // API endpoint to get all names
  app.get('/api/names', (req, res) => {
    try {
      const names = storage.getAllNames();
      return res.status(200).json({ names });
    } catch (error) {
      console.error('Error getting names:', error);
      return res.status(500).json({ message: "Failed to get names" });
    }
  });

  // API endpoint to add a new name
  app.post('/api/names', (req, res) => {
    try {
      // Validate request body
      const result = addNameSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request",
          errors: result.error.format()
        });
      }
      
      // Add the name
      const name = storage.addName(result.data);
      
      // Return the added name
      return res.status(201).json(name);
    } catch (error) {
      console.error('Error adding name:', error);
      return res.status(500).json({ message: "Failed to add name" });
    }
  });

  // API endpoint to remove a name
  app.delete('/api/names/:id', (req, res) => {
    try {
      // Validate id parameter
      const result = removeNameSchema.safeParse({ id: parseInt(req.params.id, 10) });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request",
          errors: result.error.format()
        });
      }
      
      // Remove the name
      const success = storage.removeName(result.data.id);
      
      if (!success) {
        return res.status(404).json({ message: "Name not found" });
      }
      
      // Return success
      return res.status(200).json({ message: "Name removed successfully" });
    } catch (error) {
      console.error('Error removing name:', error);
      return res.status(500).json({ message: "Failed to remove name" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
