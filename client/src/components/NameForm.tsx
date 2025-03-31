import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { type AddNameRequest } from "@shared/schema";

// Form schema with validation
const formSchema = z.object({
  fullName: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name is too long" }),
});

type FormValues = z.infer<typeof formSchema>;

interface NameFormProps {
  onAddName: (name: AddNameRequest) => void;
  isLoading: boolean;
}

const NameForm = ({ onAddName, isLoading }: NameFormProps) => {
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onAddName(values);
    // Reset form after submission
    form.reset();
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-gray-800">Add New Name</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
      </CardContent>
    </Card>
  );
};

export default NameForm;