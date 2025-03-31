import { type Name } from "@shared/schema";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Loader2 } from "lucide-react";

interface NamesTableProps {
  names: Name[];
  isLoading: boolean;
  onRemove: (id: number) => void;
  isRemoving: boolean;
}

const NamesTable = ({ names, isLoading, onRemove, isRemoving }: NamesTableProps) => {
  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-gray-800">Names List</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading names...</span>
          </div>
        ) : names.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No names added yet. Add your first name using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 font-medium">ID</TableHead>
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="w-16 text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {names.map((name) => (
                  <TableRow key={name.id}>
                    <TableCell className="text-gray-500">{name.id}</TableCell>
                    <TableCell>{name.fullName}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(name.id)}
                        disabled={isRemoving}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NamesTable;