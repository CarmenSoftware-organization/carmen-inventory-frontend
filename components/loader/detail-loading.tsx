"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function DetailLoading() {
  return (
    <div className="container mx-auto">
      <Card className="p-4">
        <div className="flex flex-row gap-2 justify-between border-b pb-2">
          <div className="flex gap-6 items-start">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-6 w-16 ml-2" />
            </div>
          </div>
          <div className="flex flex-row gap-2 justify-end">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2 space-y-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
      <div className="border-b flex gap-2 p-1">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-18 rounded-md" />
      </div>
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
