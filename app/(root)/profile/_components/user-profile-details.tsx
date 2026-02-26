"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BusinessUnit } from "@/types/profile";
import LoaderProfile from "@/components/loader/loader-profile";

const FieldSectionCell = ({
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

  if (isLoading) return <LoaderProfile />;

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
          <h3 className="text-sm font-semibold border-b pb-2">User Information</h3>
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
          <FieldSectionCell label="Full Name" value={fullName} />
          <FieldSectionCell label="Email" value={profile.email} />
          <FieldSectionCell label="Alias" value={profile.alias_name} />
          <FieldSectionCell label="Telephone" value={user_info.telephone} />
          <FieldSectionCell
            label="Platform Role"
            value={profile.platform_role}
          />
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
        <h3 className="text-sm font-semibold border-b pb-2">
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
          <FieldSectionCell label="Alias" value={bu.alias_name} />
          <FieldSectionCell label="Department" value={bu.department?.name} />
          <FieldSectionCell label="System Level" value={bu.system_level} />
          <FieldSectionCell
            label="HOD Departments"
            value={bu.hod_department?.join(", ")}
          />
          <FieldSectionCell label="Description" value={config.description} />
          <FieldSectionCell label="Tax No." value={config.tax_no} />
          <FieldSectionCell label="Branch No." value={config.branch_no} />
        </FieldGrid>
        {config.hotel && (
          <div className="space-y-1.5">
            <Separator />
            <h4 className="text-[11px] font-medium text-muted-foreground">
              Hotel
            </h4>
            <FieldGrid>
              <FieldSectionCell label="Name" value={config.hotel.name} />
              <FieldSectionCell label="Telephone" value={config.hotel.tel} />
              <FieldSectionCell label="Email" value={config.hotel.email} />
              <FieldSectionCell label="Address" value={config.hotel.address} />
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
              <FieldSectionCell label="Name" value={config.company.name} />
              <FieldSectionCell label="Telephone" value={config.company.tel} />
              <FieldSectionCell label="Email" value={config.company.email} />
              <FieldSectionCell
                label="Address"
                value={config.company.address}
              />
            </FieldGrid>
          </div>
        )}
      </div>
    </section>
  );
};
