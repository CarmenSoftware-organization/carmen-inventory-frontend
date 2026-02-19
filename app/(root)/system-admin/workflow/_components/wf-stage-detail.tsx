"use client";

import { useState, useMemo } from "react";
import {
  Controller,
  useWatch,
  type UseFormReturn,
  UseFieldArrayReturn,
} from "react-hook-form";
import { CheckCircle2, Lock, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { WorkflowCreateModel, User, Stage } from "@/types/workflows";

const roleOptions = [
  { label: "Create", value: "create" },
  { label: "Approve", value: "approve" },
  { label: "Purchase", value: "purchase" },
  { label: "Issue", value: "issue" },
];

const slaUnitOptions = [
  { label: "Minutes", value: "minutes" },
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
];

interface WfStageDetailProps {
  readonly form: UseFormReturn<WorkflowCreateModel>;
  readonly fieldArray: UseFieldArrayReturn<WorkflowCreateModel, "data.stages">;
  readonly index: number;
  readonly users: User[];
  readonly isDisabled: boolean;
  readonly isFirst: boolean;
  readonly isLast: boolean;
}

export function WfStageDetail({
  form,
  fieldArray,
  index,
  users,
  isDisabled,
  isFirst,
  isLast,
}: WfStageDetailProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const isMiddle = !isFirst && !isLast;
  const prefix = `data.stages.${index}` as const;

  const watchedStage = useWatch({
    control: form.control,
    name: `data.stages.${index}`,
  }) as Stage | undefined;

  const isHod = watchedStage?.is_hod ?? false;
  const assignedUsers = watchedStage?.assigned_users ?? [];

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.firstname.toLowerCase().includes(q) ||
        u.lastname.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.middlename && u.middlename.toLowerCase().includes(q)),
    );
  }, [users, userSearch]);

  const assignedIds = new Set(assignedUsers.map((u) => u.user_id));

  const toggleUser = (user: User) => {
    if (isDisabled) return;
    const current = form.getValues(`data.stages.${index}.assigned_users`) ?? [];
    if (assignedIds.has(user.user_id)) {
      form.setValue(
        `data.stages.${index}.assigned_users`,
        current.filter((u) => u.user_id !== user.user_id),
      );
    } else {
      form.setValue(`data.stages.${index}.assigned_users`, [...current, user]);
    }
  };

  const assignAll = (userList: User[]) => {
    if (isDisabled) return;
    const current = form.getValues(`data.stages.${index}.assigned_users`) ?? [];
    const currentIds = new Set(current.map((u) => u.user_id));
    const toAdd = userList.filter((u) => !currentIds.has(u.user_id));
    form.setValue(`data.stages.${index}.assigned_users`, [
      ...current,
      ...toAdd,
    ]);
  };

  const unassignAll = (userList: User[]) => {
    if (isDisabled) return;
    const removeIds = new Set(userList.map((u) => u.user_id));
    const current = form.getValues(`data.stages.${index}.assigned_users`) ?? [];
    form.setValue(
      `data.stages.${index}.assigned_users`,
      current.filter((u) => !removeIds.has(u.user_id)),
    );
  };

  const handleDeleteStage = () => {
    fieldArray.remove(index);
    setShowDeleteAlert(false);
  };

  if (isLast) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 className="size-8 text-green-600 mb-2" />
        <p className="text-xs font-medium">Completed Stage</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Final stage. No configuration needed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        {isMiddle && !isDisabled && (
          <Button
            type="button"
            variant="destructive"
            size="xs"
            onClick={() => setShowDeleteAlert(true)}
            className="text-xs"
          >
            <Trash2 className="size-2.5" />
            Delete
          </Button>
        )}
      </div>

      <Tabs defaultValue="general">
        <TabsList variant="line">
          <TabsTrigger value="general" className="text-xs">
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs">
            Assigned Users
          </TabsTrigger>
        </TabsList>

        {/* Sub-tab: General */}
        <TabsContent value="general" className="space-y-2.5 pt-2.5">
          <FieldGroup className="gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel className="text-[11px]">Stage Name</FieldLabel>
                <Input
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register(`data.stages.${index}.name`)}
                />
              </Field>

              <Field>
                <FieldLabel className="text-[11px]">Role</FieldLabel>
                <Controller
                  control={form.control}
                  name={`data.stages.${index}.role`}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger size="sm" className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-xs"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel className="text-[11px]">Description</FieldLabel>
              <Textarea
                className="text-xs min-h-12"
                disabled={isDisabled}
                placeholder="Optional"
                {...form.register(`data.stages.${index}.description`)}
              />
            </Field>

            {isFirst && (
              <Field>
                <FieldLabel className="text-[11px]">Creator Access</FieldLabel>
                <Controller
                  control={form.control}
                  name={`data.stages.${index}.creator_access`}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value ?? "only_creator"}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                      className="flex gap-3"
                    >
                      <div className="flex items-center gap-1">
                        <RadioGroupItem
                          value="only_creator"
                          id={`${prefix}-creator-only`}
                        />
                        <label
                          htmlFor={`${prefix}-creator-only`}
                          className="text-[11px]"
                        >
                          Only Creator
                        </label>
                      </div>
                      <div className="flex items-center gap-1">
                        <RadioGroupItem
                          value="all_department"
                          id={`${prefix}-all-dept`}
                        />
                        <label
                          htmlFor={`${prefix}-all-dept`}
                          className="text-[11px]"
                        >
                          All Department
                        </label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel className="text-[11px]">SLA</FieldLabel>
                <Input
                  type="number"
                  className="h-8 text-sm"
                  disabled={isDisabled}
                  {...form.register(`data.stages.${index}.sla`)}
                />
              </Field>
              <Field>
                <FieldLabel className="text-[11px]">Unit</FieldLabel>
                <Controller
                  control={form.control}
                  name={`data.stages.${index}.sla_unit`}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isDisabled}
                    >
                      <SelectTrigger size="sm" className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {slaUnitOptions.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-xs"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel className="text-[11px] mb-1.5">
                  Available Actions
                </FieldLabel>
                <div className="space-y-1">
                  <Field orientation="horizontal">
                    <Controller
                      control={form.control}
                      name={`data.stages.${index}.available_actions.submit.is_active`}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isDisabled}
                        />
                      )}
                    />
                    <FieldLabel className="text-[11px]">Submit</FieldLabel>
                  </Field>

                  {!isFirst && (
                    <>
                      <Field orientation="horizontal">
                        <Controller
                          control={form.control}
                          name={`data.stages.${index}.available_actions.approve.is_active`}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isDisabled}
                            />
                          )}
                        />
                        <FieldLabel className="text-[11px]">
                          <Badge
                            variant="success"
                            className="text-[9px] px-1 py-0"
                          >
                            Approve
                          </Badge>
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <Controller
                          control={form.control}
                          name={`data.stages.${index}.available_actions.reject.is_active`}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isDisabled}
                            />
                          )}
                        />
                        <FieldLabel className="text-[11px]">
                          <Badge
                            variant="destructive"
                            className="text-[9px] px-1 py-0"
                          >
                            Reject
                          </Badge>
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <Controller
                          control={form.control}
                          name={`data.stages.${index}.available_actions.sendback.is_active`}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isDisabled}
                            />
                          )}
                        />
                        <FieldLabel className="text-[11px]">
                          <Badge
                            variant="warning"
                            className="text-[9px] px-1 py-0"
                          >
                            Send Back
                          </Badge>
                        </FieldLabel>
                      </Field>
                    </>
                  )}
                </div>
              </div>

              <div>
                <FieldLabel className="text-[11px] mb-1.5">
                  Hide Fields
                </FieldLabel>
                <div className="space-y-1">
                  <Field orientation="horizontal">
                    <Controller
                      control={form.control}
                      name={`data.stages.${index}.hide_fields.price_per_unit`}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isDisabled}
                        />
                      )}
                    />
                    <FieldLabel className="text-[11px]">
                      Price Per Unit
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <Controller
                      control={form.control}
                      name={`data.stages.${index}.hide_fields.total_price`}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isDisabled}
                        />
                      )}
                    />
                    <FieldLabel className="text-[11px]">Total Price</FieldLabel>
                  </Field>
                </div>
              </div>
            </div>
          </FieldGroup>
        </TabsContent>

        {/* Sub-tab: Notifications */}
        <TabsContent value="notifications" className="space-y-2.5 pt-2.5">
          {watchedStage?.available_actions.submit.is_active && (
            <NotificationSection
              form={form}
              index={index}
              action="submit"
              label="Submit"
              isDisabled={isDisabled}
              showNextStep
            />
          )}

          {!isFirst && watchedStage?.available_actions.approve.is_active && (
            <NotificationSection
              form={form}
              index={index}
              action="approve"
              label="Approve"
              isDisabled={isDisabled}
              showNextStep
            />
          )}

          {!isFirst && watchedStage?.available_actions.reject.is_active && (
            <NotificationSection
              form={form}
              index={index}
              action="reject"
              label="Reject"
              isDisabled={isDisabled}
            />
          )}

          {!isFirst && watchedStage?.available_actions.sendback.is_active && (
            <NotificationSection
              form={form}
              index={index}
              action="sendback"
              label="Send Back"
              isDisabled={isDisabled}
            />
          )}

          {isMiddle && (
            <div className="space-y-1.5 rounded border p-2">
              <span className="text-[11px] font-medium">SLA Warning</span>
              <div className="space-y-1">
                <Field orientation="horizontal">
                  <Controller
                    control={form.control}
                    name={`data.stages.${index}.sla_warning_notification.recipients.requestor`}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={isDisabled}
                      />
                    )}
                  />
                  <FieldLabel className="text-[11px]">Requestor</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Controller
                    control={form.control}
                    name={`data.stages.${index}.sla_warning_notification.recipients.current_approve`}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={isDisabled}
                      />
                    )}
                  />
                  <FieldLabel className="text-[11px]">
                    Current Approver
                  </FieldLabel>
                </Field>
              </div>
            </div>
          )}

          {!watchedStage?.available_actions.submit.is_active &&
            (isFirst ||
              (!watchedStage?.available_actions.approve.is_active &&
                !watchedStage?.available_actions.reject.is_active &&
                !watchedStage?.available_actions.sendback.is_active)) &&
            !isMiddle && (
              <p className="text-[11px] text-muted-foreground py-3">
                No active actions to configure notifications for.
              </p>
            )}
        </TabsContent>

        {/* Sub-tab: Assigned Users */}
        <TabsContent value="users" className="space-y-2 pt-2.5">
          {isMiddle && (
            <Field orientation="horizontal">
              <Controller
                control={form.control}
                name={`data.stages.${index}.is_hod`}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        form.setValue(
                          `data.stages.${index}.assigned_users`,
                          [],
                        );
                      }
                    }}
                    disabled={isDisabled}
                  />
                )}
              />
              <FieldLabel className="text-[11px]">Is HOD</FieldLabel>
            </Field>
          )}

          {isHod ? (
            <div className="flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 dark:border-amber-900 dark:bg-amber-950">
              <Lock className="size-3 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                HOD mode enabled. Approval routed to Head of Department.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="h-7 pl-7 text-xs"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                {!isDisabled && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        assignAll(userSearch ? filteredUsers : users)
                      }
                      className="h-6 text-xs px-1.5"
                    >
                      {userSearch ? "Assign Filtered" : "Assign All"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        unassignAll(userSearch ? filteredUsers : users)
                      }
                      className="h-6 text-xs px-1.5"
                    >
                      {userSearch ? "Unassign Filtered" : "Unassign All"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="py-3 text-center text-[11px] text-muted-foreground">
                    No users found
                  </p>
                ) : (
                  filteredUsers.map((user) => {
                    const isAssigned = assignedIds.has(user.user_id);
                    return (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between rounded border px-1.5 py-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <Avatar className="size-5">
                            <AvatarFallback className="text-[9px]">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-[11px] font-medium leading-tight">
                              {user.firstname} {user.lastname}
                            </p>
                            <p className="text-[9px] text-muted-foreground leading-tight">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {!isDisabled && (
                          <Button
                            type="button"
                            variant={isAssigned ? "destructive" : "outline"}
                            size="xs"
                            onClick={() => toggleUser(user)}
                            className="h-6 text-xs px-1.5"
                          >
                            {isAssigned ? "Unassign" : "Assign"}
                          </Button>
                        )}
                        {isDisabled && isAssigned && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0"
                          >
                            Assigned
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Delete Stage
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete &quot;{watchedStage?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-7 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStage}
              className="h-7 text-xs"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Notification Section sub-component ---

interface NotificationSectionProps {
  readonly form: UseFormReturn<WorkflowCreateModel>;
  readonly index: number;
  readonly action: "submit" | "approve" | "reject" | "sendback";
  readonly label: string;
  readonly isDisabled: boolean;
  readonly showNextStep?: boolean;
}

function NotificationSection({
  form,
  index,
  action,
  label,
  isDisabled,
  showNextStep,
}: NotificationSectionProps) {
  return (
    <div className="space-y-1.5 rounded border p-2">
      <span className="text-[11px] font-medium">{label}</span>
      <div className="space-y-1">
        <Field orientation="horizontal">
          <Controller
            control={form.control}
            name={`data.stages.${index}.available_actions.${action}.recipients.requestor`}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
          <FieldLabel className="text-[11px]">Requestor</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Controller
            control={form.control}
            name={`data.stages.${index}.available_actions.${action}.recipients.current_approve`}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
          <FieldLabel className="text-[11px]">
            {action === "reject"
              ? "Previous Stage Approvers"
              : "Current Approver"}
          </FieldLabel>
        </Field>
        {showNextStep && (
          <Field orientation="horizontal">
            <Controller
              control={form.control}
              name={`data.stages.${index}.available_actions.${action}.recipients.next_step`}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              )}
            />
            <FieldLabel className="text-[11px]">Next Stage Approver</FieldLabel>
          </Field>
        )}
      </div>
    </div>
  );
}
