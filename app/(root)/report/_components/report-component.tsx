"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  DataGrid,
  DataGridContainer,
} from "@/components/ui/data-grid/data-grid";
import { DataGridTable } from "@/components/ui/data-grid/data-grid-table";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import SearchInput from "@/components/search-input";
import DisplayTemplate from "@/components/display-template";
import { useReportTable } from "./use-report-table";
// TODO: ลบ mock import เมื่อ API พร้อม — เปลี่ยนไปใช้ useReport hook แทน
import { mockReports, REPORT_FILTERS } from "./report-mock";
import type { ReportType } from "@/types/report";

// TODO: ลบ ReportTypeFilter เมื่อ API พร้อม — เปลี่ยนไปใช้ StatusFilter แทน
function ReportTypeFilter({
  value,
  onChange,
}: {
  readonly value: ReportType[];
  readonly onChange: (value: ReportType[]) => void;
}) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      multiple
      autoHighlight
      items={REPORT_FILTERS}
      value={value}
      onValueChange={onChange}
    >
      <ComboboxChips ref={anchor} className="min-h-8 min-w-[10rem] max-w-xs text-xs">
        <ComboboxValue>
          {(values: string[]) => (
            <React.Fragment>
              {values.map((v) => (
                <ComboboxChip key={v} className="text-[11px]">
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={values.length === 0 ? "All Types" : ""} />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No types found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function ReportComponent() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReportType[]>([]);

  // TODO: ลบ client-side filter เมื่อ API พร้อม — ใช้ params จาก useDataGridState ส่งให้ useReport แทน
  const filteredReports = useMemo(() => {
    let result = mockReports;
    if (typeFilter.length > 0) {
      const filterSet = new Set(typeFilter);
      result = result.filter((r) => filterSet.has(r.type));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q));
    }
    return result;
  }, [search, typeFilter]);

  const table = useReportTable({ reports: filteredReports });

  return (
    <DisplayTemplate
      title="Report"
      description="Manage reports."
      toolbar={
        <>
          <SearchInput defaultValue={search} onSearch={setSearch} />
          <ReportTypeFilter value={typeFilter} onChange={setTypeFilter} />
        </>
      }
    >
      <DataGrid
        table={table}
        recordCount={filteredReports.length}
        isLoading={false}
        tableLayout={{ dense: true }}
        tableClassNames={{ base: "text-xs" }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
      </DataGrid>
    </DisplayTemplate>
  );
}
