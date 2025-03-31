import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HistoryEntry {
  date: string;
  names: string[];
}

interface GenerationHistoryProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

const GenerationHistory = ({ history, onClearHistory }: GenerationHistoryProps) => {
  const { toast } = useToast();

  if (history.length === 0) {
    return null;
  }

  const handleCopyNames = (names: string[]) => {
    if (names.length > 0) {
      navigator.clipboard.writeText(names.join('\n'))
        .then(() => {
          toast({
            title: "Copied!",
            description: "Names copied to clipboard",
            variant: "default",
            className: "bg-success text-white",
          });
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: "Failed to copy to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-medium text-gray-800">Generation History</CardTitle>
          <CardDescription>Previously generated names</CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={onClearHistory}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {history.map((entry, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-sm font-medium text-left">
                <div className="flex justify-between w-full">
                  <span>Generation #{history.length - index}</span>
                  <span className="text-gray-500 font-normal mr-4">{entry.date}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="border rounded-md overflow-hidden">
                  <div className="p-2 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm text-gray-600">{entry.names.length} names</span>
                    <Button
                      variant="ghost"
                      onClick={() => handleCopyNames(entry.names)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy to clipboard</span>
                    </Button>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {entry.names.map((name, nameIndex) => (
                      <li
                        key={nameIndex}
                        className="px-4 py-2 hover:bg-gray-50 transition-colors duration-150 text-sm"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default GenerationHistory;