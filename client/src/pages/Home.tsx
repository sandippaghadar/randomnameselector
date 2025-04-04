import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NameGenerator from "@/components/NameGenerator";
import NameManager from "@/components/NameManager";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("manage");
  
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-medium text-gray-800">Name Management System</h1>
          <p className="text-gray-600 mt-2">Add, manage, and generate random names</p>
        </header>
        
        {/* Main Content */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="manage">Manage Names</TabsTrigger>
            <TabsTrigger value="generate">Generate Names</TabsTrigger>
          </TabsList>
          <TabsContent value="manage">
            <NameManager />
          </TabsContent>
          <TabsContent value="generate">
            <NameGenerator />
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-12">
          <p>© {new Date().getFullYear()} Name Management System</p>
        </footer>
      </div>
    </div>
  );
}
