import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema as required by the template
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for name management
export const nameSchema = z.object({
  id: z.number(),
  fullName: z.string().min(1, "Name is required"),
});

export type Name = z.infer<typeof nameSchema>;

// Schema for adding a new name
export const addNameSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
});

export type AddNameRequest = z.infer<typeof addNameSchema>;

// Schema for removing a name
export const removeNameSchema = z.object({
  id: z.number(),
});

export type RemoveNameRequest = z.infer<typeof removeNameSchema>;

// Schema for getting all names response
export const getAllNamesResponseSchema = z.object({
  names: z.array(nameSchema),
});

export type GetAllNamesResponse = z.infer<typeof getAllNamesResponseSchema>;

// Schema for name generation request
export const generateNamesRequestSchema = z.object({
  count: z.number().min(1).max(100),
});

export type GenerateNamesRequest = z.infer<typeof generateNamesRequestSchema>;

// Schema for name generation response
export const generateNamesResponseSchema = z.object({
  names: z.array(z.string()),
});

export type GenerateNamesResponse = z.infer<typeof generateNamesResponseSchema>;
