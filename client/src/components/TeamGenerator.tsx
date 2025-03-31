import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, RefreshCw, UsersRound } from "lucide-react";
import { Name } from "@shared/schema";

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
  const { toast } = useToast();

  // Fetch all names
  const { data: namesData, isLoading: isLoadingNames } = useQuery({
    queryKey: ['/api/names'],
    refetchOnWindowFocus: false,
  });
  
  const names = namesData?.names || [];

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamCount: 2,
    },
  });

  const handleSubmit = (values: FormValues) => {
    if (names.length === 0) {
      toast({
        title: "Error",
        description: "Please add some names before generating teams",
        variant: "destructive",
      });
      return;
    }

    if (names.length < values.teamCount) {
      toast({
        title: "Error",
        description: `Need at least ${values.teamCount} names to create ${values.teamCount} teams`,
        variant: "destructive",
      });
      return;
    }

    // Shuffle names
    generateTeams(values.teamCount);
  };

  // Function to shuffle array
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate teams function
  const generateTeams = (teamCount: number) => {
    const shuffledNames = shuffleArray(names);
    const teamSize = Math.floor(shuffledNames.length / teamCount);
    const remainder = shuffledNames.length % teamCount;
    
    let currentIndex = 0;
    const newTeams: Team[] = [];
    
    // Create teams
    for (let i = 0; i < teamCount; i++) {
      // Calculate size for this team (distribute remainder)
      const thisTeamSize = teamSize + (i < remainder ? 1 : 0);
      
      // Add team with members
      newTeams.push({
        name: `Team ${i + 1}`,
        members: shuffledNames.slice(currentIndex, currentIndex + thisTeamSize)
      });
      
      currentIndex += thisTeamSize;
    }
    
    setTeams(newTeams);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-gray-800">Team Generator</CardTitle>
          <CardDescription>Create balanced teams from your list of names</CardDescription>
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
                        placeholder="Enter team count (2-10)"
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
                  disabled={isLoadingNames}
                  className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors duration-200"
                >
                  {isLoadingNames ? (
                    <>
                      <span>Loading...</span>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      <UsersRound className="mr-2 h-5 w-5" />
                      Generate Teams
                    </>
                  )}
                </Button>

                {teams.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => generateTeams(form.getValues().teamCount)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium flex items-center transition-colors duration-200"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Reshuffle
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team, index) => (
            <Card key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <CardHeader className="bg-gray-50 pb-2">
                <CardTitle className="text-lg font-medium">{team.name}</CardTitle>
                <CardDescription>{team.members.length} members</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="divide-y divide-gray-200">
                  {team.members.map((member, mIndex) => (
                    <li
                      key={mIndex}
                      className="px-2 py-2 hover:bg-gray-50 transition-colors duration-150 text-sm"
                    >
                      {member.fullName}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamGenerator;