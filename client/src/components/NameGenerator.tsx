import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import GeneratorForm from "./GeneratorForm";
import ResultsList from "./ResultsList";
import { useToast } from "@/hooks/use-toast";
import { type GenerateNamesResponse } from "@shared/schema";

const NameGenerator = () => {
  const [names, setNames] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Mutation for generating names
  const namesMutation = useMutation({
    mutationFn: async (count: number) => {
      const response = await apiRequest("POST", "/api/names/generate", { count });
      const data = await response.json() as GenerateNamesResponse;
      return data.names;
    },
    onSuccess: (data) => {
      setNames(data);
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
    namesMutation.mutate(count);
  };

  const handleReset = () => {
    setNames([]);
  };

  const handleCopy = () => {
    if (names.length === 0) return;
    
    const nameText = names.join('\n');
    navigator.clipboard.writeText(nameText).then(
      () => {
        toast({
          title: "Success",
          description: "Names copied to clipboard!",
          variant: "default",
          className: "bg-success text-white",
        });
      },
      (err) => {
        toast({
          title: "Error",
          description: "Failed to copy names to clipboard",
          variant: "destructive",
        });
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <>
      <GeneratorForm 
        onGenerate={handleGenerate} 
        onReset={handleReset} 
        isLoading={namesMutation.isPending} 
      />
      
      {names.length > 0 && (
        <ResultsList 
          names={names} 
          onCopy={handleCopy} 
        />
      )}
    </>
  );
};

export default NameGenerator;
