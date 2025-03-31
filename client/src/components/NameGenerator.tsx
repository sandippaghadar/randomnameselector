import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { List, Loader2, Copy, RefreshCw } from "lucide-react";
import ResultsList from "@/components/ResultsList";
import GenerationHistory from "@/components/GenerationHistory";

// Form schema for count
const formSchema = z.object({
  count: z.coerce.number().min(1).max(100).default(5),
});

type FormValues = z.infer<typeof formSchema>;


const NameGenerator = () => {
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [generationHistory, setGenerationHistory] = useState<{date: string, names: string[]}[]>(() => {
    // Load history from localStorage on initial render
    const savedHistory = localStorage.getItem('nameGenerationHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      count: 5
    }
  });

  // Generate names mutation
  const generateMutation = useMutation({
    mutationFn: async (count: number) => {
      const response = await apiRequest("POST", "/api/names/generate", { count });
      const data = await response.json();
      return data.names as string[];
    },
    onSuccess: (names) => {
      setGeneratedNames(names);
      
      // Add to history with timestamp
      const newEntry = {
        date: new Date().toLocaleString(),
        names: names
      };
      
      const updatedHistory = [newEntry, ...generationHistory.slice(0, 9)]; // Keep last 10 entries
      setGenerationHistory(updatedHistory);
      
      // Save to localStorage
      localStorage.setItem('nameGenerationHistory', JSON.stringify(updatedHistory));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate names: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (values: FormValues) => {
    // Generate the number of names specified in the form
    generateMutation.mutate(values.count);
  };

  const handleReset = () => {
    setGeneratedNames([]);
  };

  const handleClearHistory = () => {
    setGenerationHistory([]);
    localStorage.removeItem('nameGenerationHistory');
    toast({
      title: "History Cleared",
      description: "Generation history has been cleared",
      variant: "default",
    });
  };

  const handleCopy = () => {
    if (generatedNames.length > 0) {
      navigator.clipboard.writeText(generatedNames.join('\n'))
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
    <div className="space-y-6">
      <Card className="bg-white rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">Select Random Names from Your List</CardTitle>
          <CardDescription>Specify how many random names you want to select</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of names to select</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5" 
                            min={1} 
                            max={100} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-3 flex items-end space-x-2">
                  <Button
                    type="submit"
                    disabled={generateMutation.isPending}
                    className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors duration-200"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <span>Selecting...</span>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Select Random Names
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={generateMutation.isPending}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium flex items-center transition-colors duration-200"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedNames.length > 0 && (
        <ResultsList names={generatedNames} onCopy={handleCopy} />
      )}
      
      {/* Show generation history if available */}
      {generationHistory.length > 0 && (
        <GenerationHistory 
          history={generationHistory} 
          onClearHistory={handleClearHistory} 
        />
      )}
    </div>
  );
};

export default NameGenerator;