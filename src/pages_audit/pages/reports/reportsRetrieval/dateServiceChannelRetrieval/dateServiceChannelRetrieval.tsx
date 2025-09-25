import { FC, useContext, useEffect, useRef, useState } from "react";
import { InitialValuesType, SubmitFnType } from "@acuteinfo/common-base";
import Dialog from "@mui/material/Dialog";
import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import { useDialogStyles } from "@acuteinfo/common-base";
import { Transition } from "@acuteinfo/common-base";
import { dateServiceChannelRetrievalMetadata } from "./metaData";
import {
  AppBar,
  Grid,
  InputAdornment,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import { TextField } from "@acuteinfo/common-base";
import { GradientButton } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { useStyles } from "pages_audit/auth/style";
import * as API from "../../api";
import { queryClient } from "@acuteinfo/common-base";
import DialogActions from "@mui/material/DialogActions";
import { Box, Divider, List, ListItem, ListItemText } from "@mui/material";
import { LoaderPaperComponent } from "@acuteinfo/common-base";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { useQueries } from "react-query";
import { GeneralAPI } from "registry/fns/functions";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { getRetrievalType } from "pages_audit/pages/operations/payslip-issue-entry/api";
export const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color1)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  refreshiconhover: {},
}));

const DateServiceChannelRetrieval: FC<{
  handleClose?: any;
  metaData: any;
  defaultData: any;
  retrievalParaValues?: any;
  retrievalType: String;
}> = ({
  handleClose,
  metaData,
  defaultData,
  retrievalParaValues,
  retrievalType,
}) => {
  const actionClasses = useStyles();
  const inputButtonRef = useRef<any>(null);
  const cancleButtonRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const [state, setState] = useState({
    selectBranchRows: authState?.user?.branchCode
      ? [authState.user.branchCode]
      : [],
    selectBranchLabelRows: authState?.user?.branchCode
      ? [authState.user.branchCode]
      : [],
    selectAcTypeRow: defaultData?.selectedRows ?? [],
    selectAcTypeLabelRow: defaultData?.selectedRowsData ?? [],
    selectBranchAll: defaultData?.selectServiceAll ?? false,
    selectAcTypeAll: false,
  });
  const {
    selectBranchRows,
    selectBranchLabelRows,
    selectAcTypeRow,
    selectAcTypeLabelRow,
    selectAcTypeAll,
    selectBranchAll,
  } = state;

  const selectAcTypeAllRef = useRef<boolean>(selectAcTypeAll);
  selectAcTypeAllRef.current = selectAcTypeAll;
  const selectBranchAllRef = useRef<boolean>(selectBranchAll);
  selectBranchAllRef.current = selectBranchAll;
  const isDetailFormRef = useRef<any>(null);
  const selectedAcTypeRowsRef = useRef<any>(null);
  const selectedAcTypeLabelRef = useRef<any>(null);
  const selectedBranchRowRef = useRef<any>(null);
  const selectedBranchLabelRef = useRef<any>(null);

  const headerClasses = useTypeStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const result: any = useQueries([
    {
      queryKey: ["getBranchList"],
      queryFn: () =>
        API.getBranchList({
          USER_NAME: authState?.user?.id,
        }),
    },
    {
      queryKey: ["get_Account_Type"],
      queryFn: () =>
        GeneralAPI.get_Account_Type({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          USER_NAME: authState?.user?.id ?? "",
          DOC_CD: docCD ?? "",
        }),
    },
    {
      queryKey: ["getRetrievalType"],
      queryFn: () =>
        getRetrievalType({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
        }),
    },
  ]);

  const [filteredData, setFilteredData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const loading = result[0].isLoading || result[0].isFetching;
  const isloading =
    result[1].isLoading ||
    result[1].isFetching ||
    result[2].isLoading ||
    result[2].isFetching;
  let data =
    retrievalType === "GLPLCLOSINGREGISTER" ? result[2]?.data : result[1]?.data;
  console.log(data, "data");

  useEffect(() => {
    if (!isloading) {
      setFilteredData(data || []);
    }
  }, [isloading]);

  useEffect(() => {
    if (!loading) {
      setState((prevState) => ({
        ...prevState,
        selectBranchRows: authState?.user?.branchCode
          ? [authState.user.branchCode]
          : [],
        selectBranchLabelRows: authState?.user?.branchCode
          ? [authState.user.branchCode]
          : [],
      }));
    }
  }, [result?.[0]?.data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["GetMiscValueone"]);
      queryClient.removeQueries(["GetMiscValuetwo"]);
      queryClient.removeQueries(["getRetrievalType"]);
    };
  }, []);
  const handleBranchRowClick = (event: any, name: string, label: string) => {
    setState((prevState) => ({
      ...prevState,
      selectBranchAll: false,
      selectBranchRows: event.ctrlKey
        ? prevState.selectBranchRows.includes(name) ||
          prevState.selectBranchLabelRows.includes(label)
          ? prevState.selectBranchRows?.filter((row) => row !== name)
          : [...prevState.selectBranchRows, name]
        : [name],
      selectBranchLabelRows: event.ctrlKey
        ? prevState.selectBranchRows.includes(name) ||
          prevState.selectBranchLabelRows.includes(label)
          ? prevState.selectBranchLabelRows?.filter((row) => row !== label)
          : [...prevState.selectBranchLabelRows, label]
        : [label],
    }));
  };
  const handleAcTypeRowClick = (event: any, name: string, label: string) => {
    setState((prevState) => ({
      ...prevState,
      selectAcTypeAll: false,
      selectAcTypeRow: event.ctrlKey
        ? prevState.selectAcTypeRow.includes(name) ||
          prevState.selectAcTypeLabelRow.includes(label)
          ? prevState.selectAcTypeRow?.filter((row) => row !== name)
          : [...prevState.selectAcTypeRow, name]
        : [name],
      selectAcTypeLabelRow: event.ctrlKey
        ? prevState.selectAcTypeRow.includes(name) ||
          prevState.selectAcTypeLabelRow.includes(label)
          ? prevState.selectAcTypeLabelRow?.filter((row) => row !== label)
          : [...prevState.selectAcTypeLabelRow, label]
        : [label],
    }));
  };

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    const filtered = data.filter((item) =>
      item.label.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);
  };

  const onSubmitHandler: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    //@ts-ignore
    endSubmit(true);
    let retrievalValues = [
      {
        id: "DBMR_BALANCE",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.DBMR_BALANCE === true
              ? "Y"
              : "N",
          columnName: "DBMR Balance",
        },
      },
      {
        id: "EXPIRY_DT",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.EXPIRY_DT === true
              ? "Y"
              : "N",
          columnName: "Expiry Date",
        },
      },
      {
        id: "SANCTION_DT",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.SANCTION_DT === true
              ? "Y"
              : "N",
          columnName: "Sanction Date",
        },
      },
      {
        id: "DRAWING_POWER",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.DRAWING_POWER === true
              ? "Y"
              : "N",
          columnName: "Drawing Power",
        },
      },
      {
        id: "OPENING_DETAIL",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.OPENING_DETAIL === true
              ? "Y"
              : "N",
          columnName: "Opening Detail",
        },
      },
      {
        id: "ADDRESS",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.ADDRESS === true
              ? "Y"
              : "N",
          columnName: "Address",
        },
      },
      {
        id: "GENDER_DETAIL",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.GENDER_DETAIL === true
              ? "Y"
              : "N",
          columnName: "Gender Detail",
        },
      },
      {
        id: "INTEREST_DETAIL",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.INTEREST_DETAIL === true
              ? "Y"
              : "N",
          columnName: "Interest Detail",
        },
      },
      {
        id: "IR_BALANCE",
        value: {
          condition: "equal",
          value:
            retrievalType !== "BALANCEREPORT"
              ? ""
              : data?.IR_BALANCE === true
              ? "Y"
              : "N",
          columnName: "IR Balance",
        },
      },
      {
        id: "SANCTIONED_LIMIT",
        value: {
          condition: "equal",
          value:
            retrievalType !== "CREDITBALANCEREPORT"
              ? ""
              : data?.SANCTIONED_LIMIT === true
              ? "Y"
              : "N",
          columnName: "Sactioned Limit",
        },
      },
      {
        id: "WITHOUT_INTEREST",
        value: {
          condition: "equal",
          value:
            retrievalType !== "CREDITBALANCEREPORT"
              ? ""
              : data?.WITHOUT_INTEREST === true
              ? "Y"
              : "N",
          columnName: "Without Int.",
        },
      },
      {
        id: "LIMIT",
        value: {
          condition: "equal",
          value: retrievalType !== "BALANCEREPORT" ? "" : data?.LIMIT,
          columnName: "Limit",
        },
      },
      {
        id: "LIMIT_GLPL",
        value: {
          condition: "equal",
          value:
            retrievalType !== "GLPLCLOSINGREGISTER" ? "" : data?.LIMIT_GLPL,
          columnName: "Summary Or Detail",
        },
      },
      {
        id: "NO_OF_DAYS",
        value: {
          condition: "equal",
          value:
            retrievalType !== "GLPLCLOSINGREGISTER" ? "" : data?.NO_OF_DAYS,
          columnName: "No. Of Days",
        },
      },
      {
        id: "A_FROM_DT",
        value: {
          condition: "equal",
          value:
            retrievalType === "ASONDATESERVICE" ||
            retrievalType === "BALANCEREPORT" ||
            retrievalType === "GLPLCLOSINGREGISTER" ||
            retrievalType === "CREDITBALANCEREPORT"
              ? ""
              : data?.FROM_DT
              ? format(new Date(data?.FROM_DT), "dd/MMM/yyyy")
              : "",
          columnName: "From Dates",
        },
      },
      {
        id: "AS_ON_DT",
        value: {
          condition: "equal",
          value:
            retrievalType === "ASONDATESERVICE" ||
            retrievalType === "BALANCEREPORT" ||
            retrievalType === "GLPLCLOSINGREGISTER" ||
            retrievalType === "CREDITBALANCEREPORT"
              ? format(new Date(data?.AS_ON_DT), "dd/MMM/yyyy")
              : "",
          columnName: "As on Date",
          label: "As on Date",
          displayValue:
            selectedBranchRowRef?.current
              ?.map((key) => key.toString())
              .join(",") || "",
        },
      },
      {
        id: "A_TO_DT",
        value: {
          condition: "equal",
          value:
            retrievalType === "ASONDATESERVICE" ||
            retrievalType === "BALANCEREPORT" ||
            retrievalType === "GLPLCLOSINGREGISTER" ||
            retrievalType === "CREDITBALANCEREPORT"
              ? ""
              : format(new Date(data?.TO_DT), "dd/MMM/yyyy"),

          columnName: "To Dates",
        },
      },
      {
        id: "A_DR_ACCT_TYPE",
        value: {
          condition: "equal",
          value: selectedAcTypeRowsRef?.current.map((key) => key.toString()),
          columnName: "Account Type",
          label: "Account Type",
          displayValue: selectedAcTypeRowsRef?.current
            .map((key) => {
              return key.toString();
            })
            .join(","),
        },
      },
      {
        id: "BRANCH_CD",
        value: {
          condition: "equal",
          value: selectedBranchRowRef?.current.map((key) => key.toString()),
          columnName: "Branch",
          label: "Branch",
          displayValue: selectedBranchRowRef?.current
            .map((key) => {
              return key.toString();
            })
            .join(","),
        },
      },
    ];

    retrievalParaValues(retrievalValues, {
      COMP_CD: authState?.companyID,
      // ...data,
      selectAcTypeAll: selectAcTypeAllRef.current,
      selectAcTypeRow: selectedAcTypeRowsRef.current,
      selectAcTypeLabelRow: selectedAcTypeLabelRef.current,

      selectBranchAll: selectBranchAllRef.current,
      selectBranchRows: selectedBranchRowRef.current,
      selectBranchLabelRows: selectedBranchLabelRef.current,
    });
  };

  return (
    <>
      <div
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            inputButtonRef?.current?.click?.();
          }
          if (e.key === "Escape") {
            cancleButtonRef?.current?.click?.();
          }
        }}
      >
        <AppBar
          position="relative"
          color="secondary"
          style={{ margin: "8px", width: "auto" }}
        >
          <Toolbar className={headerClasses.root} variant={"dense"}>
            <Typography
              className={headerClasses.title}
              color="inherit"
              variant={"h6"}
              component="div"
            >
              {t("EnterRetrievalParameters")}
            </Typography>
          </Toolbar>
        </AppBar>

        {loading ? (
          <LoaderPaperComponent />
        ) : (
          <Grid item xs={12} sm={12} md={12} style={{ margin: "8px" }}>
            <Box
              sx={{
                width: "100%",
                // maxWidth: 400,
                bgcolor: "background.paper",
                height: "200px",
                overflow: "scroll",
                border: "ridge",
                borderRadius: "3",
              }}
            >
              <nav aria-label="main mailbox folders">
                <List style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                  {result[0]?.data?.map((item) => (
                    <ListItemData
                      key={item?.value}
                      name={item?.label}
                      disabled={false}
                      // selected={
                      //   item?.label === selectedRow ||
                      //   selectedRows.includes(item?.label)
                      // }
                      selected={
                        selectBranchAll ||
                        // item?.value === selectedRows ||
                        selectBranchRows.includes(item?.value) ||
                        selectBranchLabelRows.includes(item?.label)
                      }
                      onClick={(event) =>
                        handleBranchRowClick(event, item?.value, item?.label)
                      }
                      onDoubleClick={(event) => {
                        if (
                          selectAcTypeRow.length === 0 ||
                          selectAcTypeLabelRow.length === 0
                        ) {
                          // setIsOpenSave(true);
                          enqueueSnackbar(t("Please select at least One Row"), {
                            variant: "error",
                          });
                        } else if (
                          selectBranchRows.length === 0 ||
                          selectBranchLabelRows.length === 0
                        ) {
                          // setIsOpenSave(true);
                          enqueueSnackbar(t("Please select a Branch"), {
                            variant: "error",
                          });
                        } else {
                          selectedAcTypeRowsRef.current = selectAcTypeRow;
                          selectedAcTypeLabelRef.current = selectAcTypeLabelRow;
                          selectedBranchRowRef.current = selectBranchRows;
                          selectedBranchLabelRef.current =
                            selectBranchLabelRows;
                          isDetailFormRef.current?.handleSubmit(event, "save");
                        }
                      }}
                    />
                  ))}
                </List>
              </nav>
            </Box>
          </Grid>
        )}
        <DialogActions
          className={actionClasses.verifybutton}
          style={{ padding: "0px", margin: "0px" }}
        >
          <GradientButton
            style={{
              minWidth: "87px",
              marginTop: "3.35rem",
              alignSelf: "start",
              marginLeft: "5px",
            }}
            onClick={() => {
              setState((prevState) => ({
                ...prevState,
                selectBranchAll: !prevState.selectBranchAll,
                selectBranchRows: !prevState.selectBranchAll
                  ? result[0]?.data?.map((item) => item?.value)
                  : [],
                selectBranchLabelRows: !prevState.selectBranchAll
                  ? result[0]?.data?.map((item) => item?.label)
                  : [],
              }));
            }}
          >
            {result[0].status === "success" && selectBranchAll
              ? t("DeselectAll")
              : t("SelectAll")}
          </GradientButton>
          <FormWrapper
            key={"dateServiceChannelRetrieval" + retrievalType}
            metaData={dateServiceChannelRetrievalMetadata as MetaDataType}
            initialValues={
              {
                ...defaultData,
                RETRIVALTYPE: retrievalType,
              } as InitialValuesType
            }
            onSubmitHandler={onSubmitHandler}
            hideHeader={true}
            formStyle={{
              background: "white",
              padding: "0px",
            }}
            containerstyle={{ padding: "10px", margin: "0" }}
            ref={isDetailFormRef}
          />
        </DialogActions>

        <>
          <TextField
            // {...others}
            // key={fieldKey}
            placeholder={String(t("Search"))}
            id=""
            name={"Search"}
            value={searchQuery}
            onChange={handleSearchInputChange}
            style={{ width: "96%", margin: "-13px 11px auto" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            //@ts-ignore
          />

          {isloading ? (
            <LoaderPaperComponent />
          ) : (
            <Grid item xs={12} sm={12} md={12} style={{ margin: "8px" }}>
              <Box
                sx={{
                  width: "100%",
                  // maxWidth: 400,
                  bgcolor: "background.paper",
                  height: "250px",
                  overflow: "scroll",
                  border: "ridge",
                  borderRadius: "3",
                }}
              >
                <nav aria-label="main mailbox folders">
                  <List style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                    {filteredData?.map((item) => (
                      <ListItemData
                        key={item?.value}
                        name={item?.label}
                        disabled={false}
                        // selected={
                        //   item?.label === selectedRow ||
                        //   selectedRows.includes(item?.label)
                        // }
                        selected={
                          selectAcTypeAll ||
                          // item?.value === selectedRows ||
                          selectAcTypeRow.includes(item?.value) ||
                          selectAcTypeLabelRow.includes(item?.label)
                        }
                        onClick={(event) =>
                          handleAcTypeRowClick(event, item?.value, item?.label)
                        }
                        onDoubleClick={(event) => {
                          if (
                            selectAcTypeRow.length === 0 ||
                            selectAcTypeLabelRow.length === 0
                          ) {
                            // setIsOpenSave(true);
                            enqueueSnackbar(
                              t("Please select at least One Row"),
                              {
                                variant: "error",
                              }
                            );
                          } else if (
                            selectBranchRows.length === 0 ||
                            selectBranchLabelRows.length === 0
                          ) {
                            // setIsOpenSave(true);
                            enqueueSnackbar(t("Please select a Branch"), {
                              variant: "error",
                            });
                          } else {
                            selectedAcTypeRowsRef.current = selectAcTypeRow;
                            selectedAcTypeLabelRef.current =
                              selectAcTypeLabelRow;
                            selectedBranchRowRef.current = selectBranchRows;
                            selectedBranchLabelRef.current =
                              selectBranchLabelRows;
                            isDetailFormRef.current?.handleSubmit(
                              event,
                              "save"
                            );
                          }
                        }}
                        // onDoubleClick={handleListItemDoubleClick}
                      />
                    ))}
                  </List>
                </nav>
              </Box>
            </Grid>
          )}
        </>
        <DialogActions
          className={actionClasses.verifybutton}
          style={{ marginTop: "2px", marginBottom: "2px" }}
        >
          <>
            <GradientButton
              onClick={() => {
                setState((prevState) => ({
                  ...prevState,
                  selectAcTypeAll: !prevState.selectAcTypeAll,
                  selectAcTypeRow: !prevState.selectAcTypeAll
                    ? result[1]?.data?.map((item) => item?.value)
                    : [],
                  selectAcTypeLabelRow: !prevState.selectAcTypeAll
                    ? result[1]?.data?.map((item) => item?.label)
                    : [],
                }));
              }}
            >
              {result[1].status === "success" && selectAcTypeAll
                ? t("DeselectAll")
                : t("SelectAll")}
            </GradientButton>
            <GradientButton
              onClick={(event) => {
                if (
                  selectAcTypeRow.length === 0 ||
                  selectAcTypeLabelRow.length === 0
                ) {
                  enqueueSnackbar(t("Please select at least One Row"), {
                    variant: "error",
                  });
                } else if (
                  selectBranchRows.length === 0 ||
                  selectBranchLabelRows.length === 0
                ) {
                  enqueueSnackbar(t("Please select a Branch"), {
                    variant: "error",
                  });
                } else {
                  selectedAcTypeRowsRef.current = selectAcTypeRow;
                  selectedAcTypeLabelRef.current = selectAcTypeLabelRow;
                  selectedBranchRowRef.current = selectBranchRows;
                  selectedBranchLabelRef.current = selectBranchLabelRows;
                  isDetailFormRef.current?.handleSubmit(event, "save");
                }
              }}
              ref={inputButtonRef}
            >
              {t("Ok")}
            </GradientButton>

            <GradientButton
              // disabled={result.isLoading || isLocalLoding}
              onClick={() => handleClose()}
              ref={cancleButtonRef}
            >
              {t("Close")}
            </GradientButton>
          </>
        </DialogActions>
      </div>
    </>
  );
};
export const ListItemData = ({
  name,
  disabled,
  selected,
  onClick,
  onDoubleClick,
}: {
  name: string;
  disabled: boolean;
  selected: boolean;
  onClick: any;
  onDoubleClick: any;
}) => {
  //@ts-ignore
  return (
    <div>
      <ListItem
        button
        style={{
          paddingTop: "4px",
          paddingBottom: "4px",
          paddingLeft: "10px",
          paddingRight: "10px",
          backgroundColor: selected ? "var(--theme-color1)" : "transparent",
          color: selected ? "white" : "black",
        }}
        onClick={onClick}
        disabled={false}
        selected={selected}
        onDoubleClick={onDoubleClick}
      >
        <ListItemText primary={name} />
      </ListItem>
      <Divider />
    </div>
  );
};
export const DateServiceChannelRetrievalWrapper = ({
  open,
  handleClose,
  metaData,
  defaultData,
  retrievalParaValues,
  retrievalType,
}) => {
  const classes = useDialogStyles();

  return (
    <>
      <Dialog
        open={true}
        //@ts-ignore
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            width: "100%",
            // minHeight: "36vh",
            // height: "36vh",
          },
        }}
        maxWidth="sm"
        classes={{
          scrollPaper: classes.topScrollPaper,
          paperScrollBody: classes.topPaperScrollBody,
        }}
      >
        <DateServiceChannelRetrieval
          metaData={metaData}
          handleClose={handleClose}
          defaultData={defaultData}
          retrievalParaValues={retrievalParaValues}
          retrievalType={retrievalType}
        />
      </Dialog>
    </>
  );
};
