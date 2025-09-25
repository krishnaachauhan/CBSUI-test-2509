import "./style.css";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  calculateTotalBalance,
  findMaxNestingLevel,
  sortGroupData,
} from "./utils";
import { StickyTableHead } from "./styledComponents/StickyTableHead";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  getCurrencySymbol,
  usePropertiesConfigContext,
} from "@acuteinfo/common-base";

function formatCurrency(
  amount,
  symbol,
  currencyFormat = "en-IN",
  decimalCount = 2,
  symbolPosi = "start"
) {
  const formattedAmount = new Intl.NumberFormat(currencyFormat, {
    minimumFractionDigits: decimalCount,
  }).format(amount);
  if (symbolPosi === "end") {
    return `${formattedAmount} ${symbol}`;
  } else {
    return `${symbol} ${formattedAmount}`;
  }
}

const GroupedTable = ({ sectionTitle, groups, columns, showNoOfAcc }: any) => {
  const [groupTotal, setGroupTotal] = useState<number>(0);
  const [expand, setExpanded] = useState(true);
  const { currencyFormat, dynamicAmountSymbol } = usePropertiesConfigContext();
  const maxNesting = useMemo(() => findMaxNestingLevel(groups), [groups]);

  const handleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    setGroupTotal(
      groups.reduce(
        (acc: number, group: any) => acc + calculateTotalBalance(group),
        0
      )
    );
  }, [groups]);

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        className="section-title"
        onClick={handleExpand}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {sectionTitle} {expand ? <ExpandLess /> : <ExpandMore />}
        </span>
        {groupTotal ? (
          <span>
            {formatCurrency(
              groupTotal,
              getCurrencySymbol(dynamicAmountSymbol),
              currencyFormat
            )}
          </span>
        ) : null}
      </Typography>
      <div
        style={{
          position: "relative",
          height: expand ? "auto" : "0",
          width: "100%",
          overflow: "hidden",
          background: "#fff",
          marginTop: expand ? "0.25rem" : 0,
        }}
      >
        <TableContainer>
          <Table sx={{ width: "100%" }} aria-label="grouped table" size="small">
            <StickyTableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.accessor}
                    align={col?.alignment ?? "left"}
                    width={col?.width ?? "auto"}
                  >
                    {col.columnName}
                  </TableCell>
                ))}
                {Array.from({ length: maxNesting }, (_, idx) => (
                  <TableCell key={idx} align="right">
                    G{idx + 1} Total
                  </TableCell>
                ))}
              </TableRow>
            </StickyTableHead>
            <TableBody
              sx={{
                "&>.MuiTableRow-root .MuiTableCell-body": {
                  fontWeight: 500,
                },
              }}
            >
              {groups.map((group: any, idx: number) => (
                <GroupRow
                  key={group.grp_cd ?? idx}
                  group={group}
                  level={0}
                  showNoOfAcc={showNoOfAcc}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

const PaddingSpacer = ({ level }: { level: number }) => (
  <span style={{ paddingLeft: `${level * 10}px` }}></span>
);

const GroupRow = React.memo(({ group, showNoOfAcc, level = 0 }: any) => {
  const { currencyFormat, dynamicAmountSymbol } = usePropertiesConfigContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const totalBalance = useMemo(() => calculateTotalBalance(group), [group]);
  const sortedData = useMemo(
    () => (group?.data ? sortGroupData(group.data) : []),
    [group]
  );
  return (
    <>
      <TableRow>
        <TableCell></TableCell>
        <TableCell
          sx={{
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <strong
            className="group-name"
            style={{
              color: "var(--theme-color1)",
              opacity:
                level === 1
                  ? 0.875
                  : level === 2
                  ? 0.75
                  : level === 3
                  ? 0.6
                  : level === 4
                  ? 0.5
                  : level === 5
                  ? 0.45
                  : 1,
            }}
          >
            <PaddingSpacer level={level} />
            {group.groupName}
            {Boolean(group.data) ? (
              isExpanded ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              )
            ) : null}
          </strong>
        </TableCell>
        <TableCell></TableCell>
        {showNoOfAcc ? <TableCell></TableCell> : null}
        {Array.from({ length: level + 1 }, (_, idx) => {
          return (
            <>
              {level === idx ? (
                <TableCell sx={{ fontSize: "0.9rem" }} align="right">
                  <strong>
                    {formatCurrency(
                      totalBalance,
                      getCurrencySymbol(dynamicAmountSymbol),
                      currencyFormat
                    )}
                  </strong>
                </TableCell>
              ) : (
                <TableCell></TableCell>
              )}
            </>
          );
        })}
      </TableRow>
      {isExpanded &&
        sortedData?.map((data: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>{data.accno}</TableCell>
            <TableCell>
              <PaddingSpacer level={level + 1} />
              {data.head}
            </TableCell>

            {/* show column conditionally */}
            {showNoOfAcc ? (
              <TableCell align="right">{data?.noofac ?? ""}</TableCell>
            ) : null}

            <TableCell align="right">
              {formatCurrency(
                data.balance,
                getCurrencySymbol(dynamicAmountSymbol),
                currencyFormat
              )}
            </TableCell>
          </TableRow>
        ))}
      {group.groups?.map((subgroup: any, idx: number) => (
        <GroupRow
          key={subgroup.grp_cd ?? idx}
          group={subgroup}
          level={level + 1}
          showNoOfAcc={showNoOfAcc}
        />
      ))}
    </>
  );
});

const GroupedTableWrapper: React.FC<any> = ({ data, columns, showNoOfAcc }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {data.map((section, idx: number) => (
        <GroupedTable
          key={idx}
          sectionTitle={section.sectionName}
          groups={section.groups}
          columns={columns}
          showNoOfAcc={showNoOfAcc}
        />
      ))}
    </Box>
  );
};

export default React.memo(GroupedTableWrapper);
