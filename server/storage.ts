import { users, type User, type InsertUser, type Name, type AddNameRequest } from "@shared/schema";
import fs from "fs";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getFirstNames(): string[];
  getLastNames(): string[];
  generateRandomNames(count: number): string[];

  // Name management methods
  getAllNames(): Name[];
  addName(name: AddNameRequest): Name;
  removeName(id: number): boolean;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private firstNames: string[];
  private lastNames: string[];
  private names: Map<number, Name>;
  currentId: number;
  private nameId: number;
  // Keep track of recently selected names to avoid repeats
  private recentlySelected: Set<string>[] = [];
  private MAX_HISTORY = 6; // Don't repeat names in last 6 generations
  private historyFile = "history.json";

  constructor() {
    this.users = new Map();
    this.names = new Map();
    this.currentId = 1;
    this.nameId = 1;

    this.loadRecentlySelected();

    // List of common first names
    this.firstNames = [
      "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
      "William", "Elizabeth", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah",
      "Thomas", "Karen", "Charles", "Nancy", "Christopher", "Lisa", "Daniel", "Margaret",
      "Matthew", "Betty", "Anthony", "Sandra", "Mark", "Ashley", "Donald", "Kimberly",
      "Steven", "Emily", "Paul", "Donna", "Andrew", "Michelle", "Joshua", "Carol",
      "Kenneth", "Amanda", "Kevin", "Dorothy", "Brian", "Melissa", "George", "Deborah",
      "Edward", "Stephanie", "Ronald", "Rebecca", "Timothy", "Sharon", "Jason", "Laura",
      "Jeffrey", "Cynthia", "Ryan", "Kathleen", "Jacob", "Amy", "Gary", "Shirley"
    ];

    // List of common last names
    this.lastNames = [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
      "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
      "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
      "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
      "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
      "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
      "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
      "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy"
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  getFirstNames(): string[] {
    return this.firstNames;
  }

  getLastNames(): string[] {
    return this.lastNames;
  }

  private saveRecentlySelected() {
    fs.writeFileSync(this.historyFile, JSON.stringify(this.recentlySelected.map(set => Array.from(set))));
  }

  private loadRecentlySelected() {
    if (fs.existsSync(this.historyFile)) {
      const data = fs.readFileSync(this.historyFile, "utf-8");
      this.recentlySelected = JSON.parse(data).map((set: string[]) => new Set(set));
    }
  }

  generateRandomNames(count: number): string[] {
    const allNames = this.getAllNames();

    if (allNames.length <= count) return allNames.map(name => name.fullName);

    // Gather recently used names
    const recentlyUsedNames = new Set<string>();
    this.recentlySelected.forEach(set => Array.from(set).forEach(name => recentlyUsedNames.add(name)));

    // Filter out names used in the last 6 rounds
    let eligibleNames = allNames.filter(name => !recentlyUsedNames.has(name.fullName));
    if (eligibleNames.length < count) eligibleNames = allNames; // Fallback if too many are excluded

    // Select random names
    const result: string[] = [];
    const namesCopy = [...eligibleNames];

    for (let i = 0; i < count && namesCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * namesCopy.length);
      result.push(namesCopy[randomIndex].fullName);
      namesCopy.splice(randomIndex, 1);
    }

    // Store the selection in history
    this.recentlySelected.unshift(new Set(result));

    // Maintain history size
    if (this.recentlySelected.length > this.MAX_HISTORY) {
      this.recentlySelected.pop();
    }

    // Save updated history to file
    this.saveRecentlySelected();

    return result;
  }



  // Name management methods implementation
  getAllNames(): Name[] {
    return Array.from(this.names.values());
  }

  addName(nameRequest: AddNameRequest): Name {
    const id = this.nameId++;
    const newName: Name = {
      id,
      fullName: nameRequest.fullName
    };

    this.names.set(id, newName);
    return newName;
  }

  removeName(id: number): boolean {
    return this.names.delete(id);
  }
}

export const storage = new MemStorage();
