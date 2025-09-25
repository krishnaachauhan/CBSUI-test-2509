import {
  AppBar,
  Dialog,
  DialogActions,
  Grid,
  InputAdornment,
  List,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  InitialValuesType,
  LoaderPaperComponent,
  MetaDataType,
  SubmitFnType,
  TextField,
  Transition,
  utilFunction,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { t } from "i18next";
import { FC, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { retrivalListData } from "./api";
import { useQueries } from "react-query";
import {
  ListItemData,
  useTypeStyles,
} from "./dateServiceChannelRetrieval/dateServiceChannelRetrieval";
import { GridSearchIcon } from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { useStyles } from "pages_audit/auth/style";
import { enqueueSnackbar } from "notistack";
type RetrievalValue = {
  id: string;
  value: {
    condition: string;
    value: string;
    columnName: string;
    label: string;
    displayValue: string;
  };
};
type CustomRetrievalProps = {
  handleClose?: any;
  metaData: any;
  defaultData: any;
  retrievalData?: any;
  retrievalParaValues?: any;
};

const CustomRetrievalWithList: FC<CustomRetrievalProps> = ({
  handleClose,
  metaData,
  defaultData,
  retrievalData,
  retrievalParaValues,
}) => {
  const inputButtonRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const headerClasses = useTypeStyles();
  const actionClasses = useStyles();

  const [state, setState] = useState<any>({
    searchedValue: "",
    filteredResults: {},
    firstListData: [],
    secondListData: [],
    selectSecondListRows: [],
    selectSecondListLabelRows: [],
    selectFirstListRow: defaultData?.selectedRows ?? [],
    selectFirstListLabelRow: defaultData?.selectedRowsData ?? [],
    selectAllSecondList: false,
    selectAllFirstList: false,
  });
  const {
    selectSecondListRows,
    selectFirstListRow,
    selectFirstListLabelRow,
    selectSecondListLabelRows,
    selectAllFirstList,
    selectAllSecondList,
  } = state;
  const isDetailFormRef = useRef<any>(null);
  const selectedFirstListRowsRef = useRef<any>(null);
  const selectedFirstListLabelRef = useRef<any>(null);
  const selectedSecondListRowRef = useRef<any>(null);
  const selectedSecondListLabelRef = useRef<any>(null);
  const selectFirstListAllRef = useRef<boolean>(selectAllFirstList);
  const selectSecondListAllRef = useRef<boolean>(selectAllSecondList);
  const onSubmitHandler: SubmitFnType = (
    data,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);

    const colomnKeyLabel = utilFunction.getMetadataLabelFromColumnName(
      metaData,
      Object.keys(data)
    );

    const retrievalValues = Object.entries(data)
      .sort()
      .map(([fieldName, value]) => {
        let displayValue = displayData[fieldName]?.toString() ?? "";

        if (fieldName === "FROM_DT" || fieldName === "TO_DT") {
          displayValue = format(new Date(value ?? new Date()), "dd/MM/yyyy");
        }

        const returnData: RetrievalValue = {
          id: fieldName,
          value: {
            condition: "equal",
            value:
              fieldName === "FROM_DT" || fieldName === "TO_DT"
                ? format(new Date(value ?? new Date()), "dd/MM/yyyy")
                : value?.toString() ?? "",
            columnName: fieldName,
            label: colomnKeyLabel[fieldName] ?? fieldName,
            displayValue: Boolean(displayValue)
              ? displayValue
              : value?.toString() ?? "",
          },
        };

        return returnData;
      });

    const dynamicRetrievalParams = metaData?.listDetails
      ? metaData?.listDetails
          ?.filter(
            (item): item is typeof item & { accecorName: string } =>
              !!item.accecorName
          )
          .map((item) => {
            const selectedData = item?.positionTop
              ? selectedFirstListRowsRef?.current
              : selectedSecondListRowRef?.current;
            return {
              id: item.accecorName,
              value: {
                condition: "equal",
                value: selectedData.map((v) => v.toString()),
                columnName: item.accecorName,
                label: item.displayLabel || item.accecorName,
                displayValue: selectedData?.map((v) => v.toString()).join(", "),
              },
            };
          })
      : [];

    const retrivalParas = [...retrievalValues, ...dynamicRetrievalParams];

    retrievalParaValues(retrivalParas, {
      COMP_CD: authState?.companyID,
    });
  };

  const dynamicQueries: any = useQueries(
    metaData?.listDetails?.map((item: any) => ({
      queryKey: ["getDynamicData", item.apiUrl],
      queryFn: () =>
        retrivalListData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          API_URL: item.apiUrl,
          DISPLAY_VALUE: item.displayValue,
          DATA_VALUE: item.dataValue,
          USER_NAME: authState?.user?.id,
          WORKING_DATE: authState?.workingDate ?? "",
          USERROLE: authState?.role ?? "",
          BASE_BRANCH_CD: authState?.user?.branchCode ?? "",
          BASE_COMP_CD: authState?.user?.baseBranchCode,
          ...(item?.otherReqPara ?? {}),
        }),
    })) || []
  );

  const isLoading = dynamicQueries.some((q) => q.isLoading);

  useEffect(() => {
    const results: any = {};

    metaData?.listDetails?.forEach((item, index) => {
      const query = dynamicQueries[index];
      const data = query?.data ?? [];

      if (!item.positionTop) {
        results[item.apiUrl] = data.filter((listItem) =>
          listItem[item.displayValue]
            ?.toLowerCase()
            .includes(state.searchedValue.toLowerCase())
        );
        setState((prev) => ({ ...prev, secondListData: data }));
      } else {
        results[item.apiUrl] = data;
        setState((prev) => ({ ...prev, firstListData: data }));
      }
    });

    setState((prev) => ({ ...prev, filteredResults: results }));
  }, [state.searchedValue, dynamicQueries]);

  const renderList = (positionTop: boolean) =>
    metaData?.listDetails
      ?.filter((item) => item.positionTop === positionTop)
      .map((item, index) => {
        const queryIndex = metaData.listDetails.findIndex(
          (q) => q.apiUrl === item.apiUrl
        );
        const queryData = state?.filteredResults[item.apiUrl] || [];

        return (
          <Grid item xs={12} sm={12} md={12}>
            <Box
              sx={{
                width: "100%",
                // maxWidth: 400,
                bgcolor: "background.paper",
                height: "200px",
                overflow: "scroll",
                boxShadow: "none",
                border: "ridge",
                borderRadius: "3",
              }}
            >
              <List style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                {queryData.map((item) => (
                  <ListItemData
                    key={item?.value}
                    name={item?.label}
                    disabled={false}
                    selected={
                      positionTop
                        ? selectAllFirstList ||
                          selectFirstListRow.includes(item?.value)
                        : selectAllSecondList ||
                          selectSecondListRows.includes(item?.value)
                    }
                    onClick={(event) =>
                      handleRowClick(
                        event,
                        item?.value,
                        item?.label,
                        positionTop ? "F" : "S"
                      )
                    }
                    onDoubleClick={(event) => {
                      if (
                        selectFirstListRow.length === 0 &&
                        metaData?.listDetails?.length > 1
                      ) {
                        enqueueSnackbar(t("Please select at least One Row"), {
                          variant: "error",
                        });
                      } else if (selectSecondListRows.length === 0) {
                        enqueueSnackbar(t("Please select at least One Row"), {
                          variant: "error",
                        });
                      } else {
                        selectedFirstListRowsRef.current = selectFirstListRow;

                        selectedFirstListLabelRef.current =
                          selectFirstListLabelRow;
                        selectedSecondListRowRef.current = selectSecondListRows;
                        selectedSecondListLabelRef.current =
                          selectSecondListLabelRows;

                        isDetailFormRef.current?.handleSubmit(event, "save");
                      }
                    }}
                  />
                ))}
              </List>
            </Box>
          </Grid>
        );
      });
  const handleRowClick = (
    event: any,
    name: string,
    label: string,
    flag: string
  ) => {
    if (flag === "F") {
      setState((prevState) => ({
        ...prevState,
        selectAllFirstList: false,
        selectFirstListRow: event.ctrlKey
          ? prevState.selectFirstListRow.includes(name) ||
            prevState.selectFirstListLabelRow.includes(label)
            ? prevState.selectFirstListRow?.filter((row) => row !== name)
            : [...prevState.selectFirstListRow, name]
          : [name],
        selectFirstListLabelRow: event.ctrlKey
          ? prevState.selectFirstListRow.includes(name) ||
            prevState.selectFirstListLabelRow.includes(label)
            ? prevState.selectFirstListLabelRow?.filter((row) => row !== label)
            : [...prevState.selectFirstListLabelRow, label]
          : [label],
      }));
    }
    if (flag === "S") {
      setState((prevState) => ({
        ...prevState,
        selectAllSecondList: false,
        selectSecondListRows: event.ctrlKey
          ? prevState.selectSecondListRows.includes(name) ||
            prevState.selectSecondListLabelRows.includes(label)
            ? prevState.selectSecondListRows?.filter((row) => row !== name)
            : [...prevState.selectSecondListRows, name]
          : [name],
        selectSecondListLabelRows: event.ctrlKey
          ? prevState.selectSecondListRows.includes(name) ||
            prevState.selectSecondListLabelRows.includes(label)
            ? prevState.selectSecondListLabelRows?.filter(
                (row) => row !== label
              )
            : [...prevState.selectSecondListLabelRows, label]
          : [label],
      }));
    }
  };

  return (
    <Dialog open={true} maxWidth="sm" PaperProps={{ style: { width: "100%" } }}>
      <AppBar
        position="relative"
        color="secondary"
        style={{ margin: "8px", width: "auto" }}
      >
        <Toolbar className={headerClasses.root} variant={"dense"}>
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
          >
            {t("Enter Retrieval Parameters")}
          </Typography>
        </Toolbar>
      </AppBar>

      {isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <>
          {renderList(true)}
          <Grid display={"flex"}>
            {metaData?.listDetails && metaData?.listDetails.length > 1 ? (
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
                    selectAllFirstList: !prevState.selectAllFirstList,
                    selectFirstListRow: !prevState.selectAllFirstList
                      ? state?.firstListData?.map((item) => item?.value)
                      : [],
                    selectFirstListLabelRow: !prevState.selectAllFirstList
                      ? state?.firstListData?.map((item) => item?.label)
                      : [],
                  }));
                }}
              >
                {selectAllFirstList ? t("DeselectAll") : t("SelectAll")}
              </GradientButton>
            ) : null}
            <FormWrapper
              key={"dynamicRetrieval"}
              metaData={metaData as MetaDataType}
              hideHeader={true}
              initialValues={metaData as InitialValuesType}
              onSubmitHandler={onSubmitHandler}
              formStyle={{ background: "white", margin: "0px" }}
              ref={isDetailFormRef}
            />
          </Grid>
          {metaData?.listDetails?.length > 0 ? (
            <TextField
              placeholder={String(t("Search"))}
              style={{
                marginTop: "-20px",
                marginBottom: "8px",
                marginInline: "10px",
              }}
              name={"Search"}
              value={state?.searchedValue}
              onChange={(e) =>
                setState((prev) => ({ ...prev, searchedValue: e.target.value }))
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <GridSearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          ) : null}

          {renderList(false)}
          <DialogActions
            className={actionClasses.verifybutton}
            sx={{ mt: 1, mb: 1 }}
          >
            {metaData?.listDetails ? (
              <GradientButton
                onClick={() => {
                  setState((prevState) => ({
                    ...prevState,
                    selectAllSecondList: !prevState.selectAllSecondList,
                    selectSecondListRows: !prevState.selectAllSecondList
                      ? state?.secondListData?.map((item) => item?.value)
                      : [],
                    selectSecondListLabelRows: !prevState.selectAllSecondList
                      ? state?.secondListData?.map((item) => item?.label)
                      : [],
                  }));
                }}
              >
                {selectAllSecondList ? t("DeselectAll") : t("SelectAll")}
              </GradientButton>
            ) : null}
            <GradientButton
              onClick={(event) => {
                if (
                  selectFirstListRow.length === 0 &&
                  metaData?.listDetails?.length > 1
                ) {
                  enqueueSnackbar(t("Please select at least One Row"), {
                    variant: "error",
                  });
                } else if (selectSecondListRows.length === 0) {
                  enqueueSnackbar(t("Please select at least One Row"), {
                    variant: "error",
                  });
                } else {
                  selectedFirstListRowsRef.current = selectFirstListRow;

                  selectedFirstListLabelRef.current = selectFirstListLabelRow;
                  selectedSecondListRowRef.current = selectSecondListRows;
                  selectedSecondListLabelRef.current =
                    selectSecondListLabelRows;

                  isDetailFormRef.current?.handleSubmit(event, "save");
                }
              }}
              ref={inputButtonRef}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton onClick={handleClose}>{t("Close")}</GradientButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export const CustomRetrieval: FC<CustomRetrievalProps> = ({
  handleClose,
  metaData,
  defaultData,
  retrievalData,
  retrievalParaValues,
}) => {
  return (
    <ClearCacheProvider>
      <CustomRetrievalWithList
        handleClose={handleClose}
        metaData={metaData}
        defaultData={defaultData}
        retrievalData={retrievalData}
        retrievalParaValues={retrievalParaValues}
      />
    </ClearCacheProvider>
  );
};
