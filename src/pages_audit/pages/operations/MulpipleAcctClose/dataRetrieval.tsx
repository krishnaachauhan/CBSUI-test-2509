import {
  Alert,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
  queryClient,
  SubmitFnType,
  TextField,
  usePopupContext,
} from "@acuteinfo/common-base";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Box,
  Grid,
  InputAdornment,
  List,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { getdocCD } from "components/utilFunction/function";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import { useStyles } from "pages_audit/auth/style";
import {
  ListItemData,
  useTypeStyles,
} from "pages_audit/pages/reports/reportsRetrieval/dateServiceChannelRetrieval/dateServiceChannelRetrieval";
import { FC, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { GeneralAPI } from "registry/fns/functions";
import { MultipleAcctCloseParameterMetadata } from "./multipleAcctCloseMetadata";

export const DataRetrieval: FC<{
  isOpenRetrieve: any;
  setOpenRetrieve: any;
  setGridReqData: any;
}> = ({ isOpenRetrieve, setOpenRetrieve, setGridReqData }) => {
  const actionClasses = useStyles();
  const inputButtonRef = useRef<any>(null);
  const cancleButtonRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const [state, setState] = useState({
    selectAcctTypeRows: [],
    selectAcctTypeLabelRows: [],
    selectAcctTypeAll: false,
  });
  const { selectAcctTypeRows, selectAcctTypeLabelRows, selectAcctTypeAll } =
    state;

  const selectAcctTypeAllRef = useRef<boolean>(selectAcctTypeAll);
  selectAcctTypeAllRef.current = selectAcctTypeAll;
  const isDetailFormRef = useRef<any>(null);
  const selectedAcctTypeRowRef = useRef<any>(null);
  const selectedAcctTypeLabelRef = useRef<any>(null);

  const headerClasses = useTypeStyles();
  const { t } = useTranslation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox } = usePopupContext();
  const [filteredData, setFilteredData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["get_Account_Type", authState?.user?.branchCode ?? ""],
    () =>
      GeneralAPI?.get_Account_Type({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        USER_NAME: authState?.user?.id ?? "",
        DOC_CD: docCD ?? "",
      }),
    {
      onSuccess: (fetchedData) => {
        setFilteredData(fetchedData);
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient?.removeQueries(["get_Account_Type"]);
    };
  }, []);
  const handleAcctTypeRowClick = (event: any, name: string, label: string) => {
    setState((prevState: any) => ({
      ...prevState,
      selectAcctTypeAll: false,
      selectAcctTypeRows: event?.ctrlKey
        ? prevState?.selectAcctTypeRows?.includes(name) ||
          prevState?.selectAcctTypeLabelRows?.includes(label)
          ? prevState?.selectAcctTypeRows?.filter((row) => row !== name)
          : [...prevState?.selectAcctTypeRows, name]
        : [name],
      selectAcctTypeLabelRows: event?.ctrlKey
        ? prevState?.selectAcctTypeRows?.includes(name) ||
          prevState?.selectAcctTypeLabelRows?.includes(label)
          ? prevState?.selectAcctTypeLabelRows?.filter((row) => row !== label)
          : [...prevState?.selectAcctTypeLabelRows, label]
        : [label],
    }));
  };

  const handleSearchInputChange = (event) => {
    const value = event?.target?.value;
    setSearchQuery(value);

    const filtered = data?.filter((item) =>
      item?.label?.toLowerCase()?.includes(value?.toLowerCase())
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
    const stringData =
      selectedAcctTypeRowRef?.current
        ?.map((key) => key?.toString())
        ?.join(",") || "";

    setGridReqData({
      ASON_DT: data?.ASON_DT
        ? format(new Date(data?.ASON_DT), "dd/MMM/yyyy")
        : "",
      USERROLE: authState?.role ?? "",
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      ACCT_TYPE: stringData ?? "",
    });
    setOpenRetrieve(false);
    setState((prevState) => ({
      ...prevState,
      selectAcctTypeRows: [],
      selectAcctTypeLabelRows: [],
      selectAcctTypeAll: false,
    }));
    endSubmit(true);
  };

  return (
    <>
      <Dialog
        open={isOpenRetrieve}
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
          {isError && (
            <Alert
              severity="error"
              errorMsg={error?.error_msg || t("Somethingwenttowrong")}
              errorDetail={error?.error_detail || ""}
              color="error"
            />
          )}
          <AppBar
            position="relative"
            color="secondary"
            style={{ margin: "8px", width: "auto" }}
          >
            <Toolbar className={headerClasses?.root} variant={"dense"}>
              <Typography
                className={headerClasses?.title}
                color="inherit"
                variant={"h6"}
                component="div"
              >
                {t("enterRetrivalPara")}
              </Typography>
            </Toolbar>
          </AppBar>

          {isLoading || isFetching ? (
            <LoaderPaperComponent />
          ) : (
            <Grid item xs={12} sm={12} md={12} style={{ margin: "8px" }}>
              <FormWrapper
                key={"MultipleAcctCloseParameterMetadata"}
                metaData={MultipleAcctCloseParameterMetadata as MetaDataType}
                initialValues={{ ASON_DT: authState?.workingDate }}
                onSubmitHandler={onSubmitHandler}
                hideHeader={true}
                formStyle={{
                  background: "white",
                  padding: "0px",
                }}
                ref={isDetailFormRef}
              />

              <>
                <TextField
                  placeholder={t("Search")}
                  name={"Search"}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  style={{ width: "100%", margin: "5px auto" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box
                  sx={{
                    width: "100%",
                    bgcolor: "background.paper",
                    height: "40vh",
                    overflow: "scroll",
                    border: "ridge",
                    borderRadius: "3",
                  }}
                >
                  <nav aria-label="main mailbox folders">
                    <List>
                      {filteredData &&
                        filteredData?.map((item: any) => (
                          <ListItemData
                            key={item?.value}
                            name={item?.label}
                            disabled={false}
                            selected={
                              selectAcctTypeAll ||
                              // @ts-ignore
                              selectAcctTypeRows?.includes(item?.value) ||
                              // @ts-ignore
                              selectAcctTypeLabelRows?.includes(item?.label)
                            }
                            onClick={(event) =>
                              handleAcctTypeRowClick(
                                event,
                                item?.value,
                                item?.label
                              )
                            }
                            onDoubleClick={(event) => {
                              selectedAcctTypeRowRef.current =
                                selectAcctTypeRows;
                              selectedAcctTypeLabelRef.current =
                                selectAcctTypeLabelRows;
                              isDetailFormRef?.current?.handleSubmit(
                                event,
                                "save"
                              );
                            }}
                          />
                        ))}
                    </List>
                  </nav>
                </Box>
              </>
            </Grid>
          )}

          <Paper
            className={actionClasses?.verifybutton}
            sx={{
              display: "flex",
              justifyContent: "end",
              gap: "20px",
            }}
          >
            <>
              <GradientButton
                onClick={() => {
                  setState((prevState) => ({
                    ...prevState,
                    selectAcctTypeAll: !prevState?.selectAcctTypeAll,
                    selectAcctTypeRows: !prevState?.selectAcctTypeAll
                      ? data?.map((item) => item?.value)
                      : [],
                    selectAcctTypeLabelRows: !prevState?.selectAcctTypeAll
                      ? data?.map((item) => item?.label)
                      : [],
                  }));
                }}
              >
                {selectAcctTypeAll ? t("DeselectAll") : t("SelectAll")}
              </GradientButton>
              <GradientButton
                onClick={async (event) => {
                  if (
                    selectAcctTypeRows?.length === 0 ||
                    selectAcctTypeLabelRows?.length === 0
                  ) {
                    await MessageBox({
                      messageTitle: "ValidationFailed",
                      message: "PleaseSelectRow",
                      icon: "ERROR",
                    });
                  } else {
                    selectedAcctTypeRowRef.current = selectAcctTypeRows;
                    selectedAcctTypeLabelRef.current = selectAcctTypeLabelRows;
                    isDetailFormRef?.current?.handleSubmit(event, "save");
                  }
                }}
                ref={inputButtonRef}
              >
                {t("Ok")}
              </GradientButton>
              <GradientButton
                onClick={() => setOpenRetrieve(false)}
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
