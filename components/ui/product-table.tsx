import { cn } from "@/lib/utils";

interface ProductTableRow {
  id: string;
  code: string | null;
  name: string | null;
}

interface ProductTableProps {
  readonly products: ProductTableRow[];
  readonly className?: string;
}

export function ProductTable({ products, className }: ProductTableProps) {
  const validProducts = products.filter((p) => p.code && p.name);

  if (validProducts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No products assigned</p>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-10 px-3 py-1.5 text-center font-medium">#</th>
            <th className="px-3 py-1.5 text-left font-medium">Code</th>
            <th className="px-3 py-1.5 text-left font-medium">Name</th>
          </tr>
        </thead>
        <tbody>
          {validProducts.map((product, index) => (
            <tr key={product.id} className="border-b last:border-0">
              <td className="w-10 px-3 py-1.5 text-center text-muted-foreground">
                {index + 1}
              </td>
              <td className="px-3 py-1.5 font-medium">{product.code}</td>
              <td className="px-3 py-1.5">{product.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
