"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessUnit } from "@/types/profile";

const Field = ({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) => (
  <div className="min-w-0">
    <dt className="text-[11px] text-muted-foreground">{label}</dt>
    <dd
      className={cn("truncate text-xs font-medium", mono && "font-mono")}
      title={value || undefined}
    >
      {value || "-"}
    </dd>
  </div>
);

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <dl className="grid grid-cols-2 gap-x-8 gap-y-1.5">{children}</dl>
);

const UserProfileDetails = () => {
  const { data: profile, isLoading, isError } = useProfile();

  if (isLoading)
    return (
      <div className="space-y-4">
        <section>
          <Skeleton className="h-3 w-32" />
          <Separator className="my-2" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`user-${i}`} className="space-y-1">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`bu-${i}`} className="space-y-1">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );

  if (isError || !profile)
    return (
      <p className="p-4 text-xs text-destructive">Failed to load profile</p>
    );

  const { user_info } = profile;
  const fullName = [
    user_info.firstname,
    user_info.middlename,
    user_info.lastname,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-4">
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold">User Information</h3>
          <Link
            href="/profile/setting"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="size-3" aria-hidden="true" />
            Edit Profile
          </Link>
        </div>
        <Separator className="my-2" />
        <FieldGrid>
          <Field label="Full Name" value={fullName} />
          <Field label="Email" value={profile.email} />
          <Field label="Alias" value={profile.alias_name} />
          <Field label="Telephone" value={user_info.telephone} />
          <Field label="Platform Role" value={profile.platform_role} />
        </FieldGrid>
      </section>

      {profile.business_unit.length > 0 &&
        profile.business_unit.map((bu) => <BUSection key={bu.id} bu={bu} />)}
      {profile.business_unit.length === 0 && (
        <p className="py-4 text-xs text-muted-foreground text-center">
          No business units assigned
        </p>
      )}
    </div>
  );
};

export default UserProfileDetails;

const BUSection = ({ bu }: { bu: BusinessUnit }) => {
  const { config } = bu;

  return (
    <section>
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold">
          {bu.name}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            ({bu.code})
          </span>
        </h3>
        {bu.is_default && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Default
          </Badge>
        )}
        {config.is_hq && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            HQ
          </Badge>
        )}
        {!bu.is_active && (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            Inactive
          </Badge>
        )}
      </div>
      <Separator className="my-2" />
      <div className="space-y-2">
        <FieldGrid>
          <Field label="Alias" value={bu.alias_name} />
          <Field label="Department" value={bu.department?.name} />
          <Field label="System Level" value={bu.system_level} />
          <Field
            label="HOD Departments"
            value={bu.hod_department?.join(", ")}
          />
          <Field label="Description" value={config.description} />
          <Field label="Tax No." value={config.tax_no} />
          <Field label="Branch No." value={config.branch_no} />
        </FieldGrid>
        {config.hotel && (
          <div className="space-y-1.5">
            <Separator />
            <h4 className="text-[11px] font-medium text-muted-foreground">
              Hotel
            </h4>
            <FieldGrid>
              <Field label="Name" value={config.hotel.name} />
              <Field label="Telephone" value={config.hotel.tel} />
              <Field label="Email" value={config.hotel.email} />
              <Field label="Address" value={config.hotel.address} />
            </FieldGrid>
          </div>
        )}
        {config.company && (
          <div className="space-y-1.5">
            <Separator />
            <h4 className="text-[11px] font-medium text-muted-foreground">
              Company
            </h4>
            <FieldGrid>
              <Field label="Name" value={config.company.name} />
              <Field label="Telephone" value={config.company.tel} />
              <Field label="Email" value={config.company.email} />
              <Field label="Address" value={config.company.address} />
            </FieldGrid>
          </div>
        )}
      </div>
    </section>
  );
};
