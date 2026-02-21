import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
      <h2 className="text-lg font-semibold">Page Not Found</h2>
      <p className="text-sm text-muted-foreground">
        This page doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link href="/dashboard" className="text-sm text-primary underline">
        Return to Dashboard
      </Link>
    </div>
  );
}
