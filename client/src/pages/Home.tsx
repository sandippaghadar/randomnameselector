import NameGenerator from "@/components/NameGenerator";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-medium text-gray-800">Random Name Generator</h1>
          <p className="text-gray-600 mt-2">Generate random names with just one click</p>
        </header>
        
        {/* Main Content */}
        <NameGenerator />
        
        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-8">
          <p>© {new Date().getFullYear()} Random Name Generator</p>
        </footer>
      </div>
    </div>
  );
}
