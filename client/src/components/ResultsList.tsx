import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";

interface ResultsListProps {
  names: string[];
  onCopy: () => void;
}

const ResultsList = ({ names, onCopy }: ResultsListProps) => {
  const [fadeInClasses, setFadeInClasses] = useState<string[]>([]);

  // Apply sequential fade-in animation to each name item
  useEffect(() => {
    if (names.length === 0) return;
    
    const timeouts: NodeJS.Timeout[] = [];
    setFadeInClasses([]);
    
    names.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setFadeInClasses(prev => [...prev, `fade-in-${index}`]);
      }, index * 100);
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [names]);

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-800">Generated Names</h2>
          
          <Button 
            variant="ghost" 
            onClick={onCopy}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-blue-700 transition-colors duration-200"
          >
            <ClipboardCopy className="h-5 w-5 mr-1" />
            Copy All
          </Button>
        </div>
        
        {names.map((name, index) => (
          <div 
            key={`${name}-${index}`} 
            className={`py-2 ${index < names.length - 1 ? 'border-b border-gray-100' : ''} opacity-0 ${fadeInClasses.includes(`fade-in-${index}`) ? 'animate-fadeIn opacity-100' : ''}`}
            style={{ 
              transition: "opacity 0.3s ease-in", 
              animationFillMode: "forwards" 
            }}
          >
            <p className="text-gray-800">{name}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ResultsList;
