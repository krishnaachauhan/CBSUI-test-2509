import {
  AppBar,
  Chip,
  Dialog,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import {
  CustomAmountField,
  CustomTextField,
} from "../DailyTransaction/TRN001/components";
import { useContext, useEffect, useRef, useState } from "react";
import { GradientButton, usePopupContext } from "@acuteinfo/common-base";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { validateCheckEmiSchedule } from "./api";
import { useMutation } from "react-query";
import i18n from "components/multiLanguage/languagesConfiguration";
import { AuthContext } from "pages_audit/auth";

const useTypeStyles: any = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
}));
interface RowData {
  unqID?: string;
  EMI_RS: string;
  FROM_INST: string;
  TO_INST: string;
  NO_OF_INST: string;
  TOT_INST?: string;
  INST_NO?: string;
  newRowAdded?: boolean;
}

export const CustomGridTable = ({
  totalInstallment,
  initialData,
  close,
  onCloseWithData,
}) => {
  const [rows, setRows] = useState<RowData[]>(initialData);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [selectedFlag, setSelectedFlag] = useState(null);
  const selectedIndexRef = useRef<any>(null);
  const selectedFlagRef = useRef<any>(null);

  const { authState } = useContext(AuthContext);

  const { MessageBox, CloseMessageBox } = usePopupContext();
  const headerClasses = useTypeStyles();

  const calculateTotalInstallments = (rows) => {
    return rows.reduce((sum, row) => {
      const noOfInst = isNaN(parseInt(row.NO_OF_INST, 10))
        ? 0
        : parseInt(row.NO_OF_INST, 10);
      return sum + noOfInst;
    }, 0);
  };
  const totalInstallments = calculateTotalInstallments(rows);

  let remainingInstlmnt = Math.max(
    0,
    //@ts-ignore
    Number(rows[0]?.INSTALLMENT_NO) - Number(totalInstallments)
  );

  const valuesCheckMutation = useMutation(validateCheckEmiSchedule, {
    onError: async (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      await MessageBox({
        messageTitle: "Error",
        message: errorMsg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      const index = selectedIndexRef.current;
      const flag = selectedFlagRef.current;

      if (data[0]?.O_STATUS !== "0") {
        const btnName = await MessageBox({
          message: data[0]?.O_MESSAGE,
          messageTitle: data[0]?.O_MSG_TITLE,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
        if (btnName === "Ok") {
          if (data && data[0]?.O_STATUS === "999") {
            if (flag === "FROM_INST") {
              //@ts-ignore
              Number(rows[index].FROM_INST) < rows[0].INSTALLMENT_NO ||
              Number(rows[index - 1].FROM_INST) > Number(rows[index].FROM_INST)
                ? (rows[index].FROM_INST = rows[index - 1].TO_INST + 1)
                : (rows[index].FROM_INST = "");
            } else if (flag === "TO_INST") {
              rows[index].TO_INST = "";
              rows[index].NO_OF_INST = "";
            } else if (flag === "NO_OF_INST") {
              rows[index].NO_OF_INST = "";
            }
          }
        }
      }
    },
  });
  const handleBlur = async (index, flag) => {
    setSelectedIndex(index);
    setSelectedFlag(flag);
    selectedIndexRef.current = index;
    selectedFlagRef.current = flag;

    const updatedRows = [...rows];
    const noOfInst = Number(rows[0]?.NO_OF_INST);
    const toInstNo = Number(updatedRows[index]?.TO_INST);
    const fromInst = Number(updatedRows[index]?.FROM_INST);

    if (index > 0 && fromInst) {
      //@ts-ignore
      updatedRows[index - 1].TO_INST = fromInst - 1;
      const prevRow = updatedRows[index - 1];
      const prevFromInst = Number(prevRow?.FROM_INST);
      const prevToInst = Number(prevRow?.TO_INST);

      if (prevFromInst && prevToInst) {
        updatedRows[index - 1].NO_OF_INST = `${prevToInst - prevFromInst + 1}`;
      }
    }
    const isLastRow = index === rows.length - 1;

    const isNoOfInstDefined = !!noOfInst;
    const isToInstDefined = !!toInstNo;

    const isNoOfInstGreaterThanOrEqualToToInst = toInstNo < totalInstallment;

    const isNewRowNotAdded =
      updatedRows[index].newRowAdded === true ||
      updatedRows[index].newRowAdded === undefined;
    valuesCheckMutation.mutate({
      A_FLAG: flag,
      //@ts-ignore
      A_INST_NO: updatedRows[0]?.INSTALLMENT_NO,
      A_FROM_INST: updatedRows[index]?.FROM_INST,
      A_TO_INST: `${updatedRows[index].TO_INST}`,
      A_EMI_RS: rows[0]?.EMI_RS,
      A_PREV_FROM_INST: index === 0 ? "" : updatedRows[index - 1]?.FROM_INST,
      A_GD_DATE: authState?.workingDate ?? "",
      A_SCREEN_REF: "RPT/1199",
      A_LANG: i18n.resolvedLanguage,
      A_USER: authState?.user?.id ?? "",
      A_USER_LEVEL: authState?.role ?? "",
    });

    if (
      isLastRow &&
      // isNoOfInstDefined &&
      isToInstDefined &&
      isNoOfInstGreaterThanOrEqualToToInst &&
      isNewRowNotAdded
    ) {
      updatedRows.forEach((row) => (row.newRowAdded = false));

      updatedRows.push({
        unqID: Math.random().toString(36).substr(2, 9),
        FROM_INST: "",
        TO_INST: "",
        NO_OF_INST: "",
        EMI_RS: "",
        newRowAdded: true,
      });
    }
    let calculatedNoOfInst: any = toInstNo - fromInst + 1;
    if (calculatedNoOfInst < 0) {
      calculatedNoOfInst = "";
    }

    updatedRows[index].NO_OF_INST = `${calculatedNoOfInst}`;
    setRows(updatedRows);
  };
  const handleAddRow = () => {
    const updatedRows = [...rows];
    updatedRows.push({
      unqID: Math.random().toString(36).substr(2, 9),
      FROM_INST: "",
      TO_INST: "",
      NO_OF_INST: "",
      EMI_RS: "",
      newRowAdded: true,
    });
    setRows(updatedRows);
  };
  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "EMI_RS" || field === "NO_OF_INST") {
      updatedRows[index].newRowAdded = false;
    }

    setRows(updatedRows);
  };
  const handleCloseWithData = () => {
    onCloseWithData(rows);
    close();
  };
  const handleDeleteRow = (index: number) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };
  return (
    <>
      <AppBar position="relative" color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            {t("loanRepaymentSchedule")}
          </Typography>
          <Chip
            style={{ color: "white", marginLeft: "8px" }}
            variant="outlined"
            color="primary"
            size="small"
            label={`Remaining Installment : ${
              Boolean(remainingInstlmnt) ? remainingInstlmnt.toFixed(2) : 0.0
            }`}
          />
          {
            //@ts-ignore
            remainingInstlmnt !== 0 &&
            //@ts-ignore
            remainingInstlmnt < rows[0]?.INSTALLMENT_NO ? (
              <GradientButton
                onClick={handleAddRow}
                color={"primary"}
                style={{ width: "10%", margin: "5px" }}
              >
                {t("addRow")}
              </GradientButton>
            ) : (
              ""
            )
          }
          <GradientButton
            onClick={handleCloseWithData}
            color={"primary"}
            style={{ width: "10%", margin: "5px" }}
          >
            {t("Close")}
          </GradientButton>
        </Toolbar>
      </AppBar>
      {Boolean(valuesCheckMutation?.isLoading) ? (
        <LinearProgress color="secondary" />
      ) : null}
      <TableContainer component={Paper} sx={{ p: 2 }}>
        <Table aria-label="simple table" padding={"none"}>
          <TableHead>
            <TableRow id="topHead">
              <TableCell id="head">{t("SrNo")}</TableCell>
              <TableCell id="head">{t("FromInst")}</TableCell>
              <TableCell id="head">{t("ToInst")}</TableCell>
              <TableCell id="head">{t("NoofInstallment")}</TableCell>
              <TableCell id="head">{t("InstallmentAmount")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row: any, index) => (
              <TableRow key={"emiCalculatorRow" + row?.unqID}>
                <TableCell
                  style={{ width: "300px", verticalAlign: "baseline" }}
                >
                  <CustomTextField
                    value={index + 1}
                    onBlur={() => {}}
                    disabled={true}
                    type="number"
                    onChange={() => {}}
                  />
                </TableCell>
                <TableCell
                  style={{ width: "300px", verticalAlign: "baseline" }}
                >
                  <CustomTextField
                    value={row?.FROM_INST}
                    disabled={valuesCheckMutation.isLoading || index === 0}
                    onBlur={() => handleBlur(index, "FROM_INST")}
                    type="number"
                    onChange={(e) =>
                      handleChange(index, "FROM_INST", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell
                  style={{ width: "300px", verticalAlign: "baseline" }}
                >
                  <CustomTextField
                    value={row?.TO_INST}
                    disabled={valuesCheckMutation.isLoading}
                    onBlur={() => handleBlur(index, "TO_INST")}
                    type="number"
                    onChange={(e) =>
                      handleChange(index, "TO_INST", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell
                  style={{ width: "300px", verticalAlign: "baseline" }}
                >
                  <CustomTextField
                    value={row?.NO_OF_INST}
                    onBlur={() => handleBlur(index, "NO_OF_INST")}
                    disabled={true}
                    type="number"
                    onChange={() => {}}
                  />
                </TableCell>
                <TableCell
                  style={{ width: "300px", verticalAlign: "baseline" }}
                >
                  <CustomAmountField
                    value={row?.EMI_RS}
                    maxAmount={10000000000}
                    onBlur={() => handleBlur(index, "EMI_RS")}
                    onChange={(e) =>
                      handleChange(index, "EMI_RS", e.target.value)
                    }
                    disabled={valuesCheckMutation.isLoading}
                  />
                </TableCell>
                <TableCell
                  sx={{ minWidth: 120 }}
                  style={{ verticalAlign: "baseline" }}
                >
                  <GradientButton
                    onClick={() => handleDeleteRow(index)}
                    disabled={index === 0}
                    style={{
                      transform: "translateY(11px)",
                    }}
                  >
                    {t("Remove")}
                  </GradientButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
