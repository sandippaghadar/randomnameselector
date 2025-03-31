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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Loader2, Copy, RefreshCw } from "lucide-react";
import ResultsList from "@/components/ResultsList";

// Form schema with validation
const formSchema = z.object({
  count: z.coerce
    .number()
    .min(1, { message: "Count must be at least 1" })
    .max(100, { message: "Count cannot exceed 100" }),
});

type FormValues = z.infer<typeof formSchema>;

const GeneratorForm = ({ onGenerate, onReset, isLoading }: {
  onGenerate: (count: number) => void;
  onReset: () => void;
  isLoading: boolean;
}) => {
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      count: 5,
    },
  });

  const handleSubmit = (values: FormValues) => {
    onGenerate(values.count);
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-gray-800">Generate Random Names</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Number of Names
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter count (1-100)"
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-error text-sm" />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <span>Generating...</span>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Generate
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium flex items-center transition-colors duration-200"
              >
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const NameGenerator = () => {
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const { toast } = useToast();

  // Generate names mutation
  const generateMutation = useMutation({
    mutationFn: async (count: number) => {
      const response = await apiRequest("POST", "/api/names/generate", { count });
      const data = await response.json();
      return data.names as string[];
    },
    onSuccess: (names) => {
      setGeneratedNames(names);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate names: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (count: number) => {
    generateMutation.mutate(count);
  };

  const handleReset = () => {
    setGeneratedNames([]);
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
      <GeneratorForm
        onGenerate={handleGenerate}
        onReset={handleReset}
        isLoading={generateMutation.isPending}
      />

      {generatedNames.length > 0 && (
        <ResultsList names={generatedNames} onCopy={handleCopy} />
      )}
    </div>
  );
};

export default NameGenerator;