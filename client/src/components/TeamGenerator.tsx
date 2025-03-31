import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Name } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Users, Loader2, RefreshCw } from "lucide-react";

// Form schema with validation
const formSchema = z.object({
  teamCount: z.coerce
    .number()
    .min(2, { message: "Must have at least 2 teams" })
    .max(10, { message: "Cannot exceed 10 teams" }),
});

type FormValues = z.infer<typeof formSchema>;

type Team = {
  name: string;
  members: Name[];
};

const TeamGenerator = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all names
  const namesQuery = useQuery({
    queryKey: ['/api/names'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/names");
      const data = await response.json();
      return data.names as Name[];
    }
  });

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamCount: 2,
    },
  });

  const generateTeams = (names: Name[], teamCount: number) => {
    // Make a copy of the names array to avoid modifying the original
    const namesCopy = [...names];
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = namesCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [namesCopy[i], namesCopy[j]] = [namesCopy[j], namesCopy[i]];
    }

    // Create teams
    const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
      name: `Team ${i + 1}`,
      members: [],
    }));

    // Distribute names evenly among teams
    namesCopy.forEach((name, index) => {
      const teamIndex = index % teamCount;
      teams[teamIndex].members.push(name);
    });

    return teams;
  };

  const handleSubmit = (values: FormValues) => {
    if (!namesQuery.data || namesQuery.data.length < values.teamCount) {
      form.setError("teamCount", { 
        type: "manual", 
        message: "Not enough names to create that many teams" 
      });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const generatedTeams = generateTeams(namesQuery.data, values.teamCount);
      setTeams(generatedTeams);
      setIsGenerating(false);
    }, 500); // Small delay for visual feedback
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">Team Generator</CardTitle>
          <CardDescription>Randomly assign names to teams</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="teamCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Number of Teams
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter number of teams"
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
                  disabled={isGenerating || namesQuery.isLoading || namesQuery.data?.length === 0}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors duration-200"
                >
                  {isGenerating ? (
                    <>
                      <span>Generating Teams...</span>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-5 w-5" />
                      Generate Teams
                    </>
                  )}
                </Button>

                {teams.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.handleSubmit(handleSubmit)()}
                    disabled={isGenerating}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium flex items-center transition-colors duration-200"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Shuffle Again
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Display Teams */}
      {teams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <Card key={index} className="bg-white rounded-lg shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-800">{team.name}</CardTitle>
                <CardDescription>{team.members.length} members</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-medium">Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.fullName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No names message */}
      {(!namesQuery.data || namesQuery.data.length === 0) && !namesQuery.isLoading && (
        <Card className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">
            Add names to the system before generating teams. Go to the "Manage Names" tab to add names.
          </p>
        </Card>
      )}

      {/* Loading state */}
      {namesQuery.isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading names...</span>
        </div>
      )}
    </div>
  );
};

export default TeamGenerator;