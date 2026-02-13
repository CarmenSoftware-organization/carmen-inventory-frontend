"use client";

import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <dd className={cn("truncate text-xs font-medium", mono && "font-mono")}>
      {value || "-"}
    </dd>
  </div>
);

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <dl className="grid grid-cols-2 gap-x-8 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
    {children}
  </dl>
);

const UserProfileDetails = () => {
  const { data: profile, isLoading, isError } = useProfile();

  if (isLoading)
    return (
      <div className="space-y-3">
        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="gap-0 px-4 py-2">
            <Skeleton className="h-3 w-32" />
          </CardHeader>
          <Separator />
          <CardContent className="px-4 py-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
    <div className="space-y-3">
      <Card className="gap-0 py-0 shadow-none">
        <CardHeader className="gap-0 px-4 py-2">
          <CardTitle className="text-xs font-semibold">
            User Information
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="px-4 py-2">
          <FieldGrid>
            <Field label="Full Name" value={fullName} />
            <Field label="Email" value={profile.email} />
            <Field label="Alias" value={profile.alias_name} />
            <Field label="Telephone" value={user_info.telephone} />
            <Field label="Platform Role" value={profile.platform_role} />
            <Field label="User ID" value={profile.id} mono />
          </FieldGrid>
        </CardContent>
      </Card>

      {profile.business_unit.map((bu) => (
        <BUCard key={bu.id} bu={bu} />
      ))}
    </div>
  );
};

export default UserProfileDetails;

const BUCard = ({ bu }: { bu: BusinessUnit }) => {
  const { config } = bu;

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="gap-0 px-4 py-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xs font-semibold">
            {bu.name}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({bu.code})
            </span>
          </CardTitle>
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
      </CardHeader>
      <Separator />
      <CardContent className="px-4 py-2">
        <FieldGrid>
          <Field label="Alias" value={bu.alias_name} />
          <Field label="Department" value={bu.department.name} />
          <Field label="System Level" value={bu.system_level} />
          <Field label="HOD Departments" value={bu.hod_department.join(", ")} />
          <Field label="Description" value={config.description} />
          <Field label="Tax No." value={config.tax_no} />
          <Field label="Branch No." value={config.branch_no} />
          {config.hotel && (
            <>
              <Field label="Hotel" value={config.hotel.name} />
              <Field label="Hotel Tel" value={config.hotel.tel} />
              <Field label="Hotel Email" value={config.hotel.email} />
              <Field label="Hotel Address" value={config.hotel.address} />
            </>
          )}
          {config.company && (
            <>
              <Field label="Company" value={config.company.name} />
              <Field label="Company Tel" value={config.company.tel} />
              <Field label="Company Email" value={config.company.email} />
              <Field label="Company Address" value={config.company.address} />
            </>
          )}
        </FieldGrid>
      </CardContent>
    </Card>
  );
};
