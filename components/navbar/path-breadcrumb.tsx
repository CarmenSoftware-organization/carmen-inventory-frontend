"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function isIdSegment(segment: string) {
  // numeric id
  if (/^\d+$/.test(segment)) return true;
  // UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  // MongoDB ObjectId (24 hex chars)
  if (/^[0-9a-f]{24}$/i.test(segment)) return true;
  return false;
}

export default function PathBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((s) => Boolean(s) && !isIdSegment(s));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");

          const label = segment
            .replaceAll("-", " ")
            .replaceAll(/\b\w/g, (c) => c.toUpperCase());

          const isLast = index === segments.length - 1;

          return (
            <Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className={isLast ? "" : "hidden md:block"}>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
