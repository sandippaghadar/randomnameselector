import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, List } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { type AddNameRequest } from "@shared/schema";

// Form schema with validation
const namesSchema = z.object({
  namesList: z.string().min(1, { message: "At least one name is required" }),
});

type NamesFormValues = z.infer<typeof namesSchema>;

interface NameFormProps {
  onAddName: (name: AddNameRequest) => void;
  isLoading: boolean;
  existingNames: string[];
}

const NameForm = ({ onAddName, isLoading, existingNames }: NameFormProps) => {
  // Initialize form
  const form = useForm<NamesFormValues>({
    resolver: zodResolver(namesSchema),
    defaultValues: {
      namesList: "",
    },
  });

  const handleSubmit = (values: NamesFormValues) => {
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
    form.reset();
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-gray-800">Add Names</CardTitle>
        <CardDescription>Enter multiple names, one per line</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="namesList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Names List
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter names here, one per line"
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
                  Add Names
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NameForm;