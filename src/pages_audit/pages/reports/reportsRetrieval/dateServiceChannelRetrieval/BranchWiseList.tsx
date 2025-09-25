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
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
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
import { useQueries, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { ListItemData, useTypeStyles } from "./dateServiceChannelRetrieval";
import { GeneralAPI } from "registry/fns/functions";

export const BranchwiseRetrive: FC<{
  handleClose: any;
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

    selectBranchAll: defaultData?.selectServiceAll ?? false,
  });
  const { selectBranchRows, selectBranchLabelRows, selectBranchAll } = state;

  const selectBranchAllRef = useRef<boolean>(selectBranchAll);
  selectBranchAllRef.current = selectBranchAll;
  const isDetailFormRef = useRef<any>(null);
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
  ]);
  const loading = result[0].isLoading || result[0].isFetching;
  const isloading = result[1].isLoading || result[1].isFetching;

  const [filteredData, setFilteredData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const data =
    retrievalType === "ACCTTYPEWISE" ||
    retrievalType === "DATERANGEWITHACCTTYPE" ||
    retrievalType === "ASONDATEWITHACCTTYPE"
      ? result[1]?.data
      : result[0]?.data;

  useEffect(() => {
    if (!loading || !isloading) {
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
  }, [data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getBranchList"]);
      queryClient.removeQueries(["get_Account_Type"]);
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

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);

    const filtered = data.filter((item) =>
      item.label.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredData(filtered);
  };

  const handleSubmit = () => {
    //@ts-ignore
    let retrievalValues = [
      {
        id: retrievalType === "ACCTTYPEWISE" ? "ACCT_TYPE" : "BRANCH_CD",
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
      {
        id: "A_FROM_DT",
        value: {
          condition: "equal",
          value: data?.FROM_DT
            ? format(new Date(data?.FROM_DT), "dd/MMM/yyyy")
            : "",
          columnName: "From Dates",
        },
      },
      {
        id: "A_TO_DT",
        value: {
          condition: "equal",
          value: data?.FROM_DT
            ? format(new Date(data?.TO_DT), "dd/MMM/yyyy")
            : "",
          columnName: "To Dates",
        },
      },
    ];

    retrievalParaValues(retrievalValues, {
      COMP_CD: authState?.companyID,
      selectBranchAll: selectBranchAllRef.current,
      selectBranchRows: selectedBranchRowRef.current,
      selectBranchLabelRows: selectedBranchLabelRef.current,
    });
  };
  const onSubmitHandler: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    try {
      //@ts-ignore

      endSubmit(true);

      let retrievalValues: Array<{
        id: string;
        value: { condition: string; value: string; columnName: string };
      }> = [
        {
          id: "A_FROM_DT",
          value: {
            condition: "equal",
            value: data?.FROM_DT
              ? format(new Date(data?.FROM_DT), "dd/MMM/yyyy")
              : "",

            columnName: "From Dates",
          },
        },
        {
          id: "A_TO_DT",
          value: {
            condition: "equal",
            value: data?.FROM_DT
              ? format(new Date(data?.TO_DT), "dd/MMM/yyyy")
              : "",

            columnName: "To Dates",
          },
        },
        {
          id:
            retrievalType === "DATERANGEWITHACCTTYPE"
              ? "ACCT_TYPE"
              : "BRANCH_CD",
          value: {
            condition: "equal",
            value:
              selectedBranchRowRef?.current?.map((key) => key.toString()) || [],
            columnName: "Branch",
            //@ts-ignore
            label: "Branch",
            displayValue:
              selectedBranchRowRef?.current
                ?.map((key) => key.toString())
                .join(",") || "",
          },
        },
      ];

      // Adjust retrieval values if retrievalType is "ASONDATEWITHBRANCH"
      if (
        retrievalType === "ASONDATEWITHBRANCH" ||
        retrievalType === "ASONDATEWITHACCTTYPE" ||
        retrievalType === "ASONDATE"
      ) {
        retrievalValues = [
          {
            id: "AS_ON_DT",
            value: {
              condition: "equal",
              value: data?.AS_ON_DT
                ? format(new Date(data?.AS_ON_DT), "dd/MMM/yyyy")
                : "",
              columnName: "As on Date",
            },
          },
          {
            id: "A_FROM_DT",
            value: {
              condition: "equal",
              value:
                retrievalType === "ASONDATEWITHACCTTYPE" ||
                retrievalType === "ASONDATEWITHBRANCH" ||
                retrievalType === "ASONDATE"
                  ? ""
                  : data?.FROM_DT
                  ? format(new Date(data?.FROM_DT), "dd/MMM/yyyy")
                  : "",
              columnName: "From Dates",
            },
          },
          {
            id: "A_TO_DT",
            value: {
              condition: "equal",
              value:
                retrievalType === "ASONDATEWITHACCTTYPE" ||
                retrievalType === "ASONDATEWITHBRANCH" ||
                retrievalType === "ASONDATE"
                  ? ""
                  : data?.TO_DT
                  ? format(new Date(data?.TO_DT), "dd/MMM/yyyy")
                  : "",
              columnName: "To Dates",
            },
          },
          retrievalType !== "ASONDATE"
            ? {
                id:
                  retrievalType === "ASONDATEWITHACCTTYPE"
                    ? "ACCT_TYPE"
                    : "BRANCH_CD",
                value: {
                  condition: "equal",
                  value:
                    selectedBranchRowRef?.current?.map((key) =>
                      key.toString()
                    ) || [],
                  columnName: "Branch",
                  //@ts-ignore
                  label: "Branch",
                  displayValue:
                    selectedBranchRowRef?.current
                      ?.map((key) => key.toString())
                      .join(",") || "",
                },
              }
            : {},
        ];
      }

      // Prepare parameters for the retrievalParaValues call
      const retrievalParams = {
        COMP_CD: authState?.companyID,
        selectBranchAll: selectBranchAllRef?.current || [],
        selectBranchRows: selectedBranchRowRef?.current || [],
        selectBranchLabelRows: selectedBranchLabelRef?.current || [],
      };

      // Send the final data for processing
      retrievalParaValues(retrievalValues, retrievalParams);
    } catch (error) {
      console.error("Error in onSubmitHandler: ", error);
      // Optionally handle the error or notify the user
    }
  };

  useEffect(() => {
    if (!isloading || loading) {
      setFilteredData(data || []);
    }
  }, [!isloading || loading]);

  return (
    <>
      <Dialog
        open={true}
        //@ts-ignore
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="sm"
      >
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
                {t("Enter Retrieval Parameters")}
              </Typography>
            </Toolbar>
          </AppBar>

          {isloading || loading ? (
            <LoaderPaperComponent />
          ) : (
            <Grid item xs={12} sm={12} md={12} style={{ margin: "8px" }}>
              {retrievalType === "DATERANGEWITHBRANCH" ||
              retrievalType === "DATERANGEWITHACCTTYPE" ||
              retrievalType === "ASONDATEWITHBRANCH" ||
              retrievalType === "ASONDATE" ||
              retrievalType === "ASONDATEWITHACCTTYPE" ? (
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
              ) : (
                ""
              )}

              {retrievalType !== "ASONDATE" ? (
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
                        {filteredData &&
                          filteredData?.map((item) => (
                            <ListItemData
                              key={item?.value}
                              name={item?.label}
                              disabled={false}
                              selected={
                                selectBranchAll ||
                                selectBranchRows.includes(item?.value) ||
                                selectBranchLabelRows.includes(item?.label)
                              }
                              onClick={(event) =>
                                handleBranchRowClick(
                                  event,
                                  item?.value,
                                  item?.label
                                )
                              }
                              onDoubleClick={(event) => {
                                if (
                                  selectBranchRows.length === 0 ||
                                  selectBranchLabelRows.length === 0
                                ) {
                                  enqueueSnackbar(t("Please select a Branch"), {
                                    variant: "error",
                                  });
                                } else {
                                  selectedBranchRowRef.current =
                                    selectBranchRows;
                                  selectedBranchLabelRef.current =
                                    selectBranchLabelRows;
                                  isDetailFormRef.current?.handleSubmit(
                                    event,
                                    "save"
                                  );
                                }
                              }}
                            />
                          ))}
                      </List>
                    </nav>
                  </Box>
                </>
              ) : (
                ""
              )}
            </Grid>
          )}
          <></>

          <Paper
            className={actionClasses.verifybutton}
            style={{
              marginTop: "2px",
              marginBottom: "2px",
              display: "flex",
              justifyContent: "end",
            }}
          >
            <>
              {retrievalType !== "ASONDATE" ? (
                <GradientButton
                  onClick={() => {
                    setState((prevState) => ({
                      ...prevState,
                      selectBranchAll: !prevState.selectBranchAll,
                      selectBranchRows: !prevState.selectBranchAll
                        ? data?.map((item) => item?.value)
                        : [],
                      selectBranchLabelRows: !prevState.selectBranchAll
                        ? data?.map((item) => item?.label)
                        : [],
                    }));
                  }}
                >
                  {selectBranchAll ? t("DeselectAll") : t("SelectAll")}
                </GradientButton>
              ) : (
                ""
              )}
              <GradientButton
                onClick={(event) => {
                  if (
                    selectBranchRows.length === 0 ||
                    selectBranchLabelRows.length === 0
                  ) {
                    // setIsOpenSave(true);
                    enqueueSnackbar(t("Please select a Branch"), {
                      variant: "error",
                    });
                  } else {
                    selectedBranchRowRef.current = selectBranchRows;
                    selectedBranchLabelRef.current = selectBranchLabelRows;
                    if (
                      retrievalType === "DATERANGEWITHBRANCH" ||
                      retrievalType === "DATERANGEWITHACCTTYPE" ||
                      retrievalType === "ASONDATEWITHACCTTYPE" ||
                      retrievalType === "ASONDATEWITHBRANCH" ||
                      retrievalType === "ASONDATE"
                    ) {
                      isDetailFormRef.current?.handleSubmit(event, "save");
                    } else {
                      handleSubmit();
                    }
                  }
                }}
                ref={inputButtonRef}
              >
                {t("Ok")}
              </GradientButton>

              <GradientButton
                onClick={() => handleClose()}
                ref={cancleButtonRef}
              >
                {t("Close")}
              </GradientButton>
            </>
          </Paper>
        </div>
      </Dialog>
    </>
  );
};
