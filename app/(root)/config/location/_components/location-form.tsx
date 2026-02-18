"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transfer, type TransferItem } from "@/components/ui/transfer";
import { TreeProductLookup } from "@/components/ui/tree-product-lookup";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import {
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from "@/hooks/use-location";
import { useAllUsers } from "@/hooks/use-all-users";
import { useAllProducts } from "@/hooks/use-all-products";
import { transferHandler } from "@/utils/transfer-handler";
import type {
  Location,
  UserLocation,
  ProductLocation,
  PhysicalCountType,
} from "@/types/location";
import type { FormMode } from "@/types/form";
import {
  INVENTORY_TYPE,
  INVENTORY_TYPE_OPTIONS,
  PHYSICAL_COUNT_TYPE_OPTIONS,
} from "@/constant/location";

const transferPayloadSchema = z.object({
  add: z.array(z.object({ id: z.string() })),
  remove: z.array(z.object({ id: z.string() })),
});

const locationSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  location_type: z.nativeEnum(INVENTORY_TYPE, {
    error: "Location type is required",
  }),
  physical_count_type: z.enum(["yes", "no"], {
    error: "Physical count type is required",
  }),
  description: z.string(),
  is_active: z.boolean(),
  users: transferPayloadSchema,
  products: transferPayloadSchema,
});

type LocationFormValues = z.infer<typeof locationSchema>;

const emptyTransfer = { add: [], remove: [] };

interface LocationFormProps {
  readonly location?: Location;
}

export function LocationForm({ location }: LocationFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>(location ? "view" : "add");
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const [showDelete, setShowDelete] = useState(false);
  const isPending = createLocation.isPending || updateLocation.isPending;
  const isDisabled = isView || isPending;

  // Fetch all users for Transfer
  const { data: allUsers = [], isLoading: isLoadingUsers } = useAllUsers();

  // Fetch all products for TreeProductLookup
  const { data: allProducts = [], isLoading: isLoadingProducts } =
    useAllProducts();

  // Users source: all users (no filter for location)
  const userSource: TransferItem[] = useMemo(
    () =>
      allUsers.map((user) => ({
        key: user.user_id,
        title: `${user.firstname} ${user.lastname}`,
      })),
    [allUsers],
  );

  // Initial keys from existing location data
  const initialUserKeys = useMemo(
    () => location?.user_location.map((u) => u.id) ?? [],
    [location],
  );
  const initialProductIds = useMemo(
    () => new Set(location?.product_location.map((p) => p.id) ?? []),
    [location],
  );

  // Target keys state
  const [userTargetKeys, setUserTargetKeys] =
    useState<string[]>(initialUserKeys);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    () => new Set(initialProductIds),
  );

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema) as Resolver<LocationFormValues>,
    defaultValues: location
      ? {
          code: location.code,
          name: location.name,
          location_type: location.location_type,
          physical_count_type: location.physical_count_type,
          description: location.description,
          is_active: location.is_active,
          users: { ...emptyTransfer },
          products: { ...emptyTransfer },
        }
      : {
          code: "",
          name: "",
          location_type: "" as unknown as INVENTORY_TYPE,
          physical_count_type: "" as unknown as PhysicalCountType,
          description: "",
          is_active: true,
          users: { ...emptyTransfer },
          products: { ...emptyTransfer },
        },
  });

  // Users Transfer onChange
  const handleUsersChange = (
    nextTargetKeys: string[],
    direction: "left" | "right",
    moveKeys: string[],
  ) => {
    setUserTargetKeys(nextTargetKeys);
    transferHandler(form, "users", moveKeys, direction);
  };

  // Products TreeProductLookup onChange (snapshot diff)
  const handleProductSelectionChange = useCallback(
    (productIds: string[]) => {
      const newIds = new Set(productIds);
      setSelectedProductIds(newIds);

      const toAdd = productIds
        .filter((id) => !initialProductIds.has(id))
        .map((id) => ({ id }));
      const toRemove = Array.from(initialProductIds)
        .filter((id) => !newIds.has(id))
        .map((id) => ({ id }));

      form.setValue("products", { add: toAdd, remove: toRemove });
    },
    [form, initialProductIds],
  );

  const onSubmit = (values: LocationFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      location_type: values.location_type,
      physical_count_type: values.physical_count_type,
      description: values.description ?? "",
      is_active: values.is_active,
      users: values.users,
      products: values.products,
    };

    if (isEdit && location) {
      updateLocation.mutate(
        { id: location.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Location updated successfully");
            router.push("/config/location");
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } else if (isAdd) {
      createLocation.mutate(payload, {
        onSuccess: () => {
          toast.success("Location created successfully");
          router.push("/config/location");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleCancel = () => {
    if (isEdit && location) {
      form.reset({
        code: location.code,
        name: location.name,
        location_type: location.location_type,
        physical_count_type: location.physical_count_type,
        description: location.description,
        is_active: location.is_active,
        users: { ...emptyTransfer },
        products: { ...emptyTransfer },
      });
      setUserTargetKeys(initialUserKeys);
      setSelectedProductIds(new Set(initialProductIds));
      setMode("view");
    } else {
      router.push("/config/location");
    }
  };

  const title = isAdd
    ? "Add Store Location"
    : isEdit
      ? "Edit Store Location"
      : "Store Location";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/config/location")}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isView ? (
            <Button size="sm" onClick={() => setMode("edit")}>
              <Pencil />
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                form="location-form"
                disabled={isPending}
              >
                {isPending
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save"
                    : "Create"}
              </Button>
            </>
          )}
          {isEdit && location && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isPending || deleteLocation.isPending}
            >
              <Trash2 />
              Delete
            </Button>
          )}
        </div>
      </div>

      <form
        id="location-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-4"
      >
        <FieldGroup className="gap-3">
          <Field data-invalid={!!form.formState.errors.code}>
            <FieldLabel htmlFor="location-code" className="text-xs">
              Code
            </FieldLabel>
            <Input
              id="location-code"
              placeholder="e.g. M123D"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("code")}
            />
            <FieldError>{form.formState.errors.code?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="location-name" className="text-xs">
              Name
            </FieldLabel>
            <Input
              id="location-name"
              placeholder="e.g. BAR เหล้า"
              className="h-8 text-sm"
              disabled={isDisabled}
              {...form.register("name")}
            />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.location_type}>
            <FieldLabel className="text-xs">Location Type</FieldLabel>
            <Controller
              control={form.control}
              name="location_type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isDisabled}
                >
                  <SelectTrigger className="h-8 w-full text-sm">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVENTORY_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>
              {form.formState.errors.location_type?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.physical_count_type}>
            <FieldLabel className="text-xs">Physical Count</FieldLabel>
            <Controller
              control={form.control}
              name="physical_count_type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isDisabled}
                >
                  <SelectTrigger className="h-8 w-full text-sm">
                    <SelectValue placeholder="Select physical count type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHYSICAL_COUNT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>
              {form.formState.errors.physical_count_type?.message}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="location-description" className="text-xs">
              Description
            </FieldLabel>
            <Textarea
              id="location-description"
              placeholder="Optional"
              className="text-sm"
              disabled={isDisabled}
              {...form.register("description")}
            />
          </Field>

          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="location-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel htmlFor="location-is-active" className="text-xs">
              Active
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>

      {location?.delivery_point && (
        <div className="max-w-2xl space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Delivery Point
          </h3>
          <p className="text-xs">{location.delivery_point.name}</p>
        </div>
      )}

      {isView ? (
        location && (
          <div className="max-w-2xl space-y-4 pt-4">
            <Tabs defaultValue="users">
              <TabsList variant="line">
                <TabsTrigger value="users" className="text-xs">
                  Location Users ({location.user_location.length})
                </TabsTrigger>
                <TabsTrigger value="products" className="text-xs">
                  Products ({location.product_location.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="users">
                <UserLocationSection users={location.user_location} />
              </TabsContent>
              <TabsContent value="products">
                <ProductLocationSection
                  products={location.product_location}
                />
              </TabsContent>
            </Tabs>
          </div>
        )
      ) : (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">
              Location Users
            </h3>
            <Transfer
              dataSource={userSource}
              targetKeys={userTargetKeys}
              onChange={handleUsersChange}
              disabled={isDisabled}
              loading={isLoadingUsers}
              titles={["Available Users", "Location Users"]}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">
              Products
            </h3>
            <TreeProductLookup
              products={allProducts}
              selectedProductIds={selectedProductIds}
              onSelectionChange={handleProductSelectionChange}
              disabled={isDisabled}
              loading={isLoadingProducts}
            />
          </div>
        </div>
      )}

      {location && (
        <DeleteDialog
          open={showDelete}
          onOpenChange={(open) =>
            !open && !deleteLocation.isPending && setShowDelete(false)
          }
          title="Delete Store Location"
          description={`Are you sure you want to delete location "${location.name}"? This action cannot be undone.`}
          isPending={deleteLocation.isPending}
          onConfirm={() => {
            deleteLocation.mutate(location.id, {
              onSuccess: () => {
                toast.success("Location deleted successfully");
                router.push("/config/location");
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        />
      )}
    </div>
  );
}

function UserLocationSection({ users }: { users: UserLocation[] }) {
  return (
    <div>
      {users.length === 0 ? (
        <p className="text-xs text-muted-foreground">No users assigned</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-1.5 text-left font-medium">Name</th>
                <th className="px-3 py-1.5 text-left font-medium">
                  Telephone
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
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
      )}
    </div>
  );
}

function ProductLocationSection({
  products,
}: {
  products: ProductLocation[];
}) {
  const validProducts = products.filter((p) => p.code && p.name);

  return (
    <div>
      {validProducts.length === 0 ? (
        <p className="text-xs text-muted-foreground">No products assigned</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-1.5 text-left font-medium">Code</th>
                <th className="px-3 py-1.5 text-left font-medium">Name</th>
              </tr>
            </thead>
            <tbody>
              {validProducts.map((product) => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="px-3 py-1.5 font-medium">{product.code}</td>
                  <td className="px-3 py-1.5">{product.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
