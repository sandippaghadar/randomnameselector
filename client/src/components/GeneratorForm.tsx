import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Form schema with validation
const formSchema = z.object({
  count: z.coerce
    .number()
    .min(1, { message: "Please enter at least 1" })
    .max(100, { message: "Maximum allowed is 100" }),
});

type FormValues = z.infer<typeof formSchema>;

interface GeneratorFormProps {
  onGenerate: (count: number) => void;
  onReset: () => void;
  isLoading: boolean;
}

const GeneratorForm = ({ onGenerate, onReset, isLoading }: GeneratorFormProps) => {
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

  const handleReset = () => {
    form.reset({ count: 5 });
    onReset();
  };

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-6">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mb-6">
            <FormField
              control={form.control}
              name="count"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                    How many names do you need?
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-error text-sm mt-1" />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex-1 flex justify-center items-center transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <span>Generating...</span>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  </>
                ) : (
                  "Generate Names"
                )}
              </Button>

              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors duration-200"
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

export default GeneratorForm;
