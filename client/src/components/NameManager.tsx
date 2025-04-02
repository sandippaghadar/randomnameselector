import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Name, type AddNameRequest } from "@shared/schema";
import NameForm from "@/components/NameForm";
import NamesTable from "@/components/NamesTable";

const NameManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localNames, setLocalNames] = useState<Name[]>([]);
  
  // Get names from localStorage on initial load
  useEffect(() => {
    const savedNames = localStorage.getItem('savedNamesList');
    if (savedNames) {
      try {
        const parsedNames = JSON.parse(savedNames) as Name[];
        setLocalNames(parsedNames);
      } catch (e) {
        console.error("Error parsing names from localStorage", e);
      }
    }
  }, []);
  
  // Fetch all names from server
  const namesQuery = useQuery({
    queryKey: ['/api/names'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/names");
      const data = await response.json();
      return data.names as Name[];
    }
  });
  
  // Update localStorage and local state when query data changes
  useEffect(() => {
    if (namesQuery.data) {
      localStorage.setItem('savedNamesList', JSON.stringify(namesQuery.data));
      setLocalNames(namesQuery.data);
    }
  }, [namesQuery.data]);
  
  // Use local names if available, otherwise use names from query
  const displayNames = localNames.length > 0 ? localNames : (namesQuery.data || []);
  
  // Extract just the name strings for duplicate checking
  const existingNameStrings = useMemo(() => {
    return displayNames.map(name => name.fullName);
  }, [displayNames]);
  
  // Add name mutation
  const addNameMutation = useMutation({
    mutationFn: async (name: AddNameRequest) => {
      const response = await apiRequest("POST", "/api/names", name);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Name added successfully!",
        variant: "default",
        className: "bg-success text-white",
      });
      // Refresh names list
      queryClient.invalidateQueries({ queryKey: ['/api/names'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add name: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Remove name mutation
  const removeNameMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/names/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Name removed successfully!",
        variant: "default",
        className: "bg-success text-white",
      });
      // Refresh names list
      queryClient.invalidateQueries({ queryKey: ['/api/names'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove name: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  const handleAddName = (name: AddNameRequest) => {
    addNameMutation.mutate(name);
  };
  
  const handleRemoveName = (id: number) => {
    removeNameMutation.mutate(id);
  };
  
  return (
    <div className="space-y-6">
      <NameForm 
        onAddName={handleAddName} 
        isLoading={addNameMutation.isPending}
        existingNames={existingNameStrings}
      />
      
      <NamesTable 
        names={displayNames} 
        isLoading={namesQuery.isLoading && localNames.length === 0} 
        onRemove={handleRemoveName}
        isRemoving={removeNameMutation.isPending}
      />
    </div>
  );
};

export default NameManager;