import { users, type User, type InsertUser, type Name, type AddNameRequest } from "@shared/schema";

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

  constructor() {
    this.users = new Map();
    this.names = new Map();
    this.currentId = 1;
    this.nameId = 1;
    
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
  
  generateRandomNames(count: number): string[] {
    // Get all names from our list
    const allNames = this.getAllNames();
    
    // If we don't have enough names, return what we have
    if (allNames.length <= count) {
      return allNames.map(name => name.fullName);
    }
    
    // Create a set of all recently used names (from past 6 generations)
    const recentlyUsedNames = new Set<string>();
    this.recentlySelected.forEach(set => {
      set.forEach(name => recentlyUsedNames.add(name));
    });
    
    // Filter out names that have been used recently (if possible)
    let eligibleNames = allNames.filter(name => !recentlyUsedNames.has(name.fullName));
    
    // If we don't have enough eligible names after filtering, use all names
    if (eligibleNames.length < count) {
      eligibleNames = allNames;
    }
    
    // Randomly select 'count' names from our eligible list without duplicates
    const result: string[] = [];
    const namesCopy = [...eligibleNames]; // Create a copy to avoid modifying the original
    
    for (let i = 0; i < count && namesCopy.length > 0; i++) {
      // Pick a random index
      const randomIndex = Math.floor(Math.random() * namesCopy.length);
      // Add the name at that index to results
      result.push(namesCopy[randomIndex].fullName);
      // Remove that name from the copy to avoid duplicates in this selection
      namesCopy.splice(randomIndex, 1);
    }
    
    // Add this selection to our history of recently selected names
    const currentSelection = new Set(result);
    this.recentlySelected.unshift(currentSelection);
    
    // Keep only the last MAX_HISTORY selections
    if (this.recentlySelected.length > this.MAX_HISTORY) {
      this.recentlySelected.pop();
    }
    
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
