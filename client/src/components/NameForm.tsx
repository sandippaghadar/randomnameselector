import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, List } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type AddNameRequest } from "@shared/schema";

// Form schema with validation
const singleNameSchema = z.object({
  fullName: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name is too long" }),
});

const multipleNamesSchema = z.object({
  namesList: z.string().min(1, { message: "At least one name is required" }),
});

type SingleNameFormValues = z.infer<typeof singleNameSchema>;
type MultipleNamesFormValues = z.infer<typeof multipleNamesSchema>;

interface NameFormProps {
  onAddName: (name: AddNameRequest) => void;
  isLoading: boolean;
  existingNames: string[];
}

const NameForm = ({ onAddName, isLoading, existingNames }: NameFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("single");
  
  // Initialize single name form
  const singleForm = useForm<SingleNameFormValues>({
    resolver: zodResolver(singleNameSchema),
    defaultValues: {
      fullName: "",
    },
  });

  // Initialize multiple names form
  const multipleForm = useForm<MultipleNamesFormValues>({
    resolver: zodResolver(multipleNamesSchema),
    defaultValues: {
      namesList: "",
    },
  });

  const handleSingleSubmit = (values: SingleNameFormValues) => {
    // Check if name already exists
    if (existingNames.includes(values.fullName.trim())) {
      singleForm.setError("fullName", { 
        type: "manual", 
        message: "This name already exists in the list" 
      });
      return;
    }
    
    onAddName(values);
    // Reset form after submission
    singleForm.reset();
  };

  const handleMultipleSubmit = (values: MultipleNamesFormValues) => {
    const namesList = values.namesList
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    // Process each name one by one
    namesList.forEach(name => {
      // Skip names that already exist in the list
      if (!existingNames.includes(name)) {
        onAddName({ fullName: name });
      }
    });
    
    // Reset form after submission
    multipleForm.reset();
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-gray-800">Add New Name</CardTitle>
        <CardDescription>Add a single name or paste multiple names at once</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="single">Single Name</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Names</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(handleSingleSubmit)} className="space-y-4">
                <FormField
                  control={singleForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter full name"
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-error text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <span>Adding...</span>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Add Name
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="multiple">
            <Form {...multipleForm}>
              <form onSubmit={multipleForm.handleSubmit(handleMultipleSubmit)} className="space-y-4">
                <FormField
                  control={multipleForm.control}
                  name="namesList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Names List (one per line)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste multiple names here, one per line"
                          {...field}
                          rows={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-error text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <span>Adding...</span>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      <List className="mr-2 h-5 w-5" />
                      Add Multiple Names
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NameForm;