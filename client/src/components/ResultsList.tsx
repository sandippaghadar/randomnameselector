import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultsListProps {
  names: string[];
  onCopy: () => void;
}

const ResultsList = ({ names, onCopy }: ResultsListProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium text-gray-800">Generated Names</CardTitle>
        <Button 
          variant="ghost" 
          onClick={onCopy}
          className="h-8 w-8 p-0 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full"
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy to clipboard</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {names.map((name, index) => (
              <li 
                key={index} 
                className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsList;