import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Typography, AppBar } from "@mui/material";
import { GradientButton } from "@acuteinfo/common-base";
import { t } from "i18next";

type StickyHeadTableProps = {
  rowData: any;
  columnData: any;
  actions?: any; // ✅ optional
  tableStyle?: any; // ✅ optional
  buttonStyle?: any; // ✅ optional
  controlsAtBottom?: Boolean; // ✅ optional
  isVisibleSelectAllBtn?: Boolean; // ✅ optional
  onChangeValue?: any; // ✅ optional
  titleName?: any; // ✅ optional
  isHideHeader?: any; // ✅ optional
  defaultData?: any; // ✅ optional
  isHideColumnHeader?: any; // ✅ optional
};

export default function StickyHeadTable({
  rowData,
  columnData,
  actions,
  tableStyle,
  buttonStyle,
  controlsAtBottom = true,
  isVisibleSelectAllBtn = true,
  onChangeValue,
  titleName,
  isHideHeader = false,
  defaultData,
  isHideColumnHeader,
}: StickyHeadTableProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [rowsData, setRowsData] = React.useState<any[]>([]);
  const [filterText, setFilterText] = React.useState("");

  const filteredRows = React.useMemo(() => {
    if (!filterText.trim()) return rowsData;
    const lowerFilter = filterText.toLowerCase();
    return rowsData.filter((row) =>
      columnData.some((column) => {
        const cellValue = row[column.id];
        return String(cellValue).toLowerCase().includes(lowerFilter);
      })
    );
  }, [filterText, rowsData, columnData]);

  const applyDefaultSelections = React.useCallback(
    (rows: any[], defaults: any[]) => {
      const newSet = new Set<string>();

      if (!Array.isArray(defaults) || !defaults.length) return newSet;

      const criteriaMap = new Map(
        defaults.map((item) => [item.id, item.value.value.trim()])
      );

      const matchedKeys = new Set<string>();

      rows.forEach((row) => {
        for (let [key, value] of criteriaMap.entries()) {
          if (!matchedKeys.has(key) && row[key]?.trim() === value) {
            newSet.add(row.UNIQUE_NO);
            matchedKeys.add(key);
            break;
          }
        }
      });

      return newSet;
    },
    []
  );

  React.useEffect(() => {
    if (Array.isArray(rowData)) {
      const updateData = rowData.map((item) => ({
        ...item,
        UNIQUE_NO:
          item.UNIQUE_NO ||
          `id-${item.id || Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
      }));

      if (Array.isArray(defaultData) && defaultData.length > 0) {
        const defaultsSet = applyDefaultSelections(updateData, defaultData);
        setSelectedIds(defaultsSet);
      }

      setRowsData(updateData);
    }
  }, [rowData, defaultData, applyDefaultSelections]);

  React.useEffect(() => {
    onChangeValue(
      rowsData,
      filteredRows,
      filteredRows.filter((row) => selectedIds.has(row.UNIQUE_NO))
    );
  }, [selectedIds, filteredRows]);

  const handleRowClick = (
    id: string,
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => {
    setSelectedIds((prev) => {
      const newSet: any = new Set(prev);
      const isCtrlPressed = event.ctrlKey || event.metaKey;

      isCtrlPressed
        ? newSet.has(id)
          ? newSet.delete(id)
          : newSet.add(id)
        : newSet.clear() || newSet.add(id);

      return newSet;
    });
  };

  const buttonCompo = (
    <Box
      textAlign="center"
      // p={2}
      display={actions ? "inherit" : "none"}
      sx={{ ...buttonStyle }}
    >
      {isVisibleSelectAllBtn && (
        <GradientButton
          key={"selectAll"}
          sx={{ minWidth: "60px" }}
          onClick={() => {
            const allIds = new Set(filteredRows.map((row) => row.UNIQUE_NO));
            const allSelected = filteredRows.every((row) =>
              selectedIds.has(row.UNIQUE_NO)
            );

            setSelectedIds(allSelected ? new Set() : allIds);
          }}
        >
          {filteredRows.every((row) => selectedIds.has(row.UNIQUE_NO))
            ? t("DeselectAll")
            : t("SelectAll")}
        </GradientButton>
      )}

      {actions?.map((action, i) => (
        <GradientButton
          key={i}
          sx={{ minWidth: "60px" }}
          onClick={(e) =>
            typeof action.callback === "function" &&
            action.callback(
              e,
              rowsData,
              rowsData.filter((row) => selectedIds.has(row.UNIQUE_NO))
            )
          }
        >
          {t(`${action.buttonName}`)}
        </GradientButton>
      ))}
    </Box>
  );

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", ...tableStyle }}>
      {!isHideHeader && (
        <AppBar
          position="static"
          color="secondary"
          style={{
            background: "var(--theme-color5)",
          }}
        >
          <Box
            p={1}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography
              sx={{ whiteSpace: "nowrap", mr: 3 }}
              color="inherit"
              variant="h6"
              component="div"
            >
              {t(`${titleName ? titleName : ""}`)}
            </Typography>

            <Box
              textAlign="center"
              // p={1}
              display={"flex"}
              justifyContent={"flex-end"}
            >
              <Box display="flex" justifyContent="flex-end">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    width: "250px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </Box>
              {!controlsAtBottom && buttonCompo}
            </Box>
          </Box>
        </AppBar>
      )}

      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead sx={{ display: isHideColumnHeader ? "none" : "" }}>
            <TableRow>
              {columnData?.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    padding: "8px !important",
                    background: "var(--theme-color4)",
                  }}
                >
                  {t(`${column.label ? column.label : ""}`)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => {
              const isSelected = selectedIds.has(row.UNIQUE_NO);
              return (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={row.UNIQUE_NO}
                  selected={isSelected}
                  onClick={(e) => handleRowClick(row.UNIQUE_NO, e)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "var(--theme-color3) !important"
                      : "inherit",
                    "& .MuiTableCell-root": {
                      padding: "7px",
                      color: isSelected
                        ? "var(--theme-color2) !important"
                        : "inherit",
                    },
                  }}
                >
                  {columnData.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === "number"
                          ? column.format(value)
                          : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {controlsAtBottom && (
        <Box
          p={1}
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Typography variant="subtitle2" fontSize={"15px"} component="div">
            {`${t("Totalnumberofselectedrows")} = ${t(`${selectedIds.size}`)}`}
          </Typography>
          {buttonCompo}
        </Box>
      )}
      {!controlsAtBottom && (
        <Box p={1} alignItems={"center"}>
          <Typography variant="subtitle2" fontSize={"15px"} component="div">
            {`${t("Totalnumberofselectedrows")} = ${t(`${selectedIds.size}`)}`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
