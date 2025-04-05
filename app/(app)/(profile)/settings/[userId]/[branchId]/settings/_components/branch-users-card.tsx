import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

type BranchUser =
  Database["public"]["Tables"]["user_provider_branches"]["Row"] & {
    users: User;
  };

type Branch = {
  id: string;
  branch_name: string;
  [key: string]: any;
};

export function BranchUsersCard({
  branchUsers,
  branch,
}: {
  branchUsers: BranchUser[];
  branch: Branch;
}) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-contrast/20 text-contrast hover:bg-contrast/20">Administrador</Badge>;
      case "supervisor":
        return <Badge className="">Gerente</Badge>;
      case "cashier":
        return <Badge className="bg-contrast2/20 text-contrast2 hover:bg-contrast2/20">Cajero</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-background">
        <CardTitle>Usuarios de la tienda</CardTitle>
        <CardDescription>
          Usuarios con acceso a {branch.branch_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 bg-sidebar">
        {branchUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No hay usuarios asignados a esta tienda.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branchUsers.map((branchUser) => (
                <TableRow key={branchUser.id}>
                  <TableCell className="font-medium h-10">
                    {branchUser.users.first_name} {branchUser.users.last_name}
                  </TableCell>
                  <TableCell className="h-10">
                    {branchUser.users.email}
                  </TableCell>
                  <TableCell className="h-10">
                    {getRoleBadge(branchUser.role)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
