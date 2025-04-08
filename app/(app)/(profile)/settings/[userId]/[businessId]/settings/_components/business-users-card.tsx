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
import type { Database } from "@/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

type BusinessUser =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    users: User;
  };

type Business = Database["public"]["Tables"]["provider_business"]["Row"];

export function BusinessUsersCard({
  businessUsers,
  business,
}: {
  businessUsers: BusinessUser[];
  business: Business;
}) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-contrast/20 text-contrast hover:bg-contrast/20">
            Administrador
          </Badge>
        );
      case "manager":
        return <Badge className="">Gerente</Badge>;
      case "staff":
        return (
          <Badge className="bg-contrast2/20 text-contrast2 hover:bg-contrast2/20">
            Personal
          </Badge>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-background">
        <CardTitle>Usuarios del negocio</CardTitle>
        <CardDescription>
          Usuarios con acceso a {business.business_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 bg-sidebar">
        {businessUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No hay usuarios asignados a este negocio.
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
              {businessUsers.map((businessUser) => (
                <TableRow key={businessUser.id}>
                  <TableCell className="font-medium h-10">
                    {businessUser.users.first_name}{" "}
                    {businessUser.users.last_name}
                  </TableCell>
                  <TableCell className="h-10">
                    {businessUser.users.email}
                  </TableCell>
                  <TableCell className="h-10">
                    {getRoleBadge(businessUser.role)}
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
