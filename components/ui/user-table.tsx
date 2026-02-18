import { cn } from "@/lib/utils";

interface UserTableRow {
  id: string;
  firstname: string;
  lastname: string;
  telephone: string;
}

interface UserTableProps {
  readonly users: UserTableRow[];
  readonly className?: string;
}

export function UserTable({ users, className }: UserTableProps) {
  if (users.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No users assigned</p>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-10 px-3 py-1.5 text-center font-medium">#</th>
            <th className="px-3 py-1.5 text-left font-medium">Name</th>
            <th className="px-3 py-1.5 text-left font-medium">Telephone</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className="border-b last:border-0">
              <td className="w-10 px-3 py-1.5 text-center text-muted-foreground">
                {index + 1}
              </td>
              <td className="px-3 py-1.5">
                {user.firstname} {user.lastname}
              </td>
              <td className="px-3 py-1.5 text-muted-foreground">
                {user.telephone}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
