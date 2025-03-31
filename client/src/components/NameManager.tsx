import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Name, type AddNameRequest } from "@shared/schema";
import NameForm from "@/components/NameForm";
import NamesTable from "@/components/NamesTable";

const NameManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all names
  const namesQuery = useQuery({
    queryKey: ['/api/names'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/names");
      const data = await response.json();
      return data.names as Name[];
    }
  });
  
  // Extract just the name strings for duplicate checking
  const existingNameStrings = useMemo(() => {
    if (!namesQuery.data) return [];
    return namesQuery.data.map(name => name.fullName);
  }, [namesQuery.data]);
  
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
        names={namesQuery.data || []} 
        isLoading={namesQuery.isLoading} 
        onRemove={handleRemoveName}
        isRemoving={removeNameMutation.isPending}
      />
    </div>
  );
};

export default NameManager;