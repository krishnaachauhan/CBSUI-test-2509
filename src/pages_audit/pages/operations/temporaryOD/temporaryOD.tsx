import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AppBar,
  Container,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  tempODGridTodayMetaData,
  tempODGridHistoryMetaData,
} from "./temporaryGridMetaData";
import { temporaryODentryMetadata } from "./tempODentryMetadata";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "react-query";
import { cloneDeep } from "lodash";
import { format } from "date-fns";
import * as API from "./api";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { useTranslation } from "react-i18next";

import {
  ActionTypes,
  Alert,
  MasterDetailsMetaData,
  usePopupContext,
  GridMetaDataType,
  MasterDetailsForm,
  GridWrapper,
  utilFunction,
  GradientButton,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import AccDetails from "../DailyTransaction/TRNHeaderTabs/AccountDetails";
import { getCarousalCards } from "../DailyTransaction/TRNCommon/api";
import { getdocCD } from "components/utilFunction/function";
import { useStyles } from "../style";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
import { useCommonFunctions } from "../fix-deposit/function";
const TemporaryODMain = () => {
  const [isData, setIsData] = useState({
    isVisible: false,
    value: "tab1",
    closeAlert: true,
  });
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { showMessageBox } = useCommonFunctions();
  const myRef = useRef<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const style = useStyles();
  const actions: ActionTypes[] = [
    {
      actionName: "add",
      actionLabel: "Add",
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
      shouldExclude: () => {
        return true;
      },
    },
  ];

  const temporaryODDetail: any = useMutation(
    "lienGridDetail",
    API.temporaryODdetails,
    {
      onError: () => {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const cardData: any = useMutation("getCarousalCards", getCarousalCards, {
    onError: () => {
      setIsData((old) => ({ ...old, closeAlert: true }));
    },
  });

  const crudTempOD: any = useMutation("crudTemoraryOD", API.crudTemoraryOD, {
    onSuccess: (data, variables) => {
      if (Boolean(variables?._isNewRow)) {
        setIsData((old) => ({ ...old, isVisible: false }));
        cardData.data = [];
        myRef?.current?.handleFormReset();
        enqueueSnackbar(t("insertSuccessfully"), { variant: "success" });
      } else if (!Boolean(variables?.isNewRow)) {
        enqueueSnackbar(t("ForceExpSuccessfully"), { variant: "success" });
        temporaryODDetail.mutate({
          COMP_CD: authState?.companyID,
          BRANCH_CD: variables?.BRANCH_CD,
          ACCT_TYPE: variables?.ACCT_TYPE,
          ACCT_CD: variables?.ACCT_CD,
          FLAG: "H",
          ASON_DT: authState?.workingDate,
        });
      }
    },
    onError: () => {
      setIsData((old) => ({ ...old, closeAlert: true }));
    },
  });
  const validateTempOD: any = useMutation(
    "validateTempOD",
    API.validateTempOD,
    {
      onSuccess: () => {},
      onError: () => {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const onSubmitHandler = async ({ data, displayData, endSubmit }) => {
    try {
      const transformedData = await Promise.all(
        data?.DETAILS_DATA?.isNewRow?.map(async (row) => ({
          ...row,
          SUBMIT: row.SUBMIT ? "Y" : "N",
          VALID_UPTO: await GeneralAPI.getDateWithCurrentTime(
            row?.VALID_UPTO ? new Date(row?.VALID_UPTO) : ""
          ),
        }))
      );
      const Apireq = {
        _isNewRow: true,
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        CODE: data?.CODE ?? "",
        FLAG: data?.FLAG ? "Y" : "N",
        FROM_EFF_DATE: data?.FROM_EFF_DATE
          ? format(new Date(data?.FROM_EFF_DATE), "dd-MMM-yyyy")
          : "",
        TO_EFF_DATE: data?.TO_EFF_DATE
          ? format(new Date(data?.TO_EFF_DATE), "dd-MMM-yyyy")
          : "",
        AMOUNT_UPTO: data?.AMOUNT_UPTO ?? "",
        DETAILS_DATA: { ...data.DETAILS_DATA, isNewRow: transformedData },
      };

      validateTempOD?.mutate(
        {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: data?.BRANCH_CD ?? "",
          ACCT_TYPE: data?.ACCT_TYPE ?? "",
          ACCT_CD: data?.ACCT_CD ?? "",
          FROM_DT: data?.FROM_EFF_DATE
            ? format(new Date(data?.FROM_EFF_DATE), "dd-MMM-yyyy")
            : "",
          TO_DT: data?.TO_EFF_DATE
            ? format(new Date(data?.TO_EFF_DATE), "dd-MMM-yyyy")
            : "",
          CODE_VALUE: data?.CODE ?? "",
          AMOUNT_UPTO: data?.AMOUNT_UPTO ?? "",
          WORKING_DATE: authState?.workingDate ?? "",
        },
        {
          onSuccess: async (data) => {
            for (const obj of data) {
              const continueProcess = await showMessageBox(obj);
              if (!continueProcess) {
                break;
              }
              if (obj?.O_STATUS === "0") {
                crudTempOD.mutate(Apireq);
              }
            }
          },
        }
      );
    } catch (error) {
      console.error("Error processing data:", error);
    }

    //@ts-ignore
    endSubmit(true);
  };

  const setCurrentAction = useCallback(
    async (data) => {
      if (data.name === "add") {
        let gridData = await myRef?.current?.GetGirdData?.();
        const hasDuplicateTemplateCd = (data) => {
          const templateCdSet = new Set();
          for (const item of data) {
            if (templateCdSet.has(item.TEMPLATE_CD)) {
              return true;
            }
            templateCdSet.add(item.TEMPLATE_CD);
          }
          return false;
        };
        const duplicateExists = hasDuplicateTemplateCd(gridData);
        if (!Boolean(duplicateExists)) {
          myRef.current?.addNewRow(true, {
            VALID_UPTO: authState?.workingDate,
          });
        }
      }
    },
    [navigate]
  );

  // let metadata: MasterDetailsMetaData = {} as MasterDetailsMetaData;
  let metadata = cloneDeep(temporaryODentryMetadata) as MasterDetailsMetaData;
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const [dataClass, setDataClass] = useState("");
  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setDataClass(newData);
  }, [commonClass, dialogClassNames]);

  useEnter(`${dataClass}`);
  return (
    <>
      <Container
        className="main"
        maxWidth={false}
        sx={{ px: "8px !important" }}
      >
        <Tabs
          value={isData.value}
          className={style.tabStyle}
          onChange={(event, newValue) => {
            setIsData((old) => ({
              ...old,
              value: newValue,
              closeAlert: false,
            }));
            temporaryODDetail.data = [];

            const handleTabChange = (metaData, flag) => {
              myRef?.current?.getFieldData().then((res) => {
                if (res?.ACCT_CD && res?.ACCT_TYPE && res?.BRANCH_CD) {
                  metaData.gridConfig.subGridLabel = `\u00A0\u00A0 ${(
                    authState?.companyID +
                    "-" +
                    res?.BRANCH_CD +
                    "-" +
                    res?.ACCT_TYPE +
                    "-" +
                    res?.ACCT_CD
                  ).replace(/\s/g, "")}`;

                  let Apireq = {
                    COMP_CD: authState?.companyID,
                    BRANCH_CD: res?.BRANCH_CD,
                    ACCT_TYPE: res?.ACCT_TYPE,
                    ACCT_CD: res?.ACCT_CD,
                    FLAG: flag,
                    ASON_DT: authState?.workingDate,
                  };
                  temporaryODDetail.mutate(Apireq);
                }
              });
            };

            if (newValue === "tab2") {
              handleTabChange(tempODGridTodayMetaData, "T");
            } else if (newValue === "tab3") {
              handleTabChange(tempODGridHistoryMetaData, "H");
            }
          }}
          aria-label="secondary tabs example"
        >
          <Tab tabIndex={0} value="tab1" label={t("TemporaryODEntry")} />
          {isData.isVisible && (
            <Tab tabIndex={0} value="tab2" label={t("TodaysDetail")} />
          )}
          {isData.isVisible && (
            <Tab tabIndex={0} value="tab3" label={t("HistoryDetail")} />
          )}
        </Tabs>
      </Container>

      <Container className="" maxWidth={false} sx={{ px: "8px !important" }}>
        <Grid
          sx={{
            backgroundColor: "var(--theme-color2)",
            padding: "0px",
            borderRadius: "10px",
            boxShadow:
              "rgba(136, 165, 191, 0.48) 6px 2px 16px 0px, rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;",
          }}
        >
          {crudTempOD?.isLoading || cardData?.isLoading ? (
            <LinearProgress color="secondary" />
          ) : (temporaryODDetail?.isError && isData.closeAlert) ||
            (crudTempOD?.isError && isData.closeAlert) ||
            (cardData?.isError && isData.closeAlert) ? (
            <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={
                    temporaryODDetail?.error?.error_msg ??
                    crudTempOD?.error?.error_msg ??
                    cardData?.error?.error_msg ??
                    "Unknow Error"
                  }
                  errorDetail={
                    temporaryODDetail?.error?.error_detail ??
                    crudTempOD?.error?.error_detail ??
                    cardData?.error?.error_detail ??
                    ""
                  }
                  color="error"
                />
              </AppBar>
            </div>
          ) : (
            <LinearProgressBarSpacer />
          )}
          <div
            className={`${isData?.value === "tab1" ? "main" : ""}`}
            style={{ display: isData.value === "tab1" ? "inherit" : "none" }}
          >
            <div style={{ padding: "5px 10px 5px 10px" }}>
              <AppBar
                position="relative"
                sx={{ background: "var(--primary-bg)" }}
              >
                <Toolbar
                  variant="dense"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    minHeight: "40px !important",
                  }}
                >
                  <Typography component="div" variant="h6" color="primary">
                    {utilFunction.getDynamicLabel(
                      useLocation().pathname,
                      authState?.menulistdata,
                      true
                    )}
                  </Typography>
                  <GradientButton
                    onClick={(e) => {
                      myRef?.current?.onSubmitHandler(e, "Save");
                    }}
                    disabled={!isData?.isVisible}
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                </Toolbar>
              </AppBar>
            </div>
            <div style={{ padding: "0 10px 0 10px" }}>
              <AccDetails
                cardsData={isData?.isVisible ? cardData?.data ?? [] : []}
              />
            </div>
            <MasterDetailsForm
              key={"temporaryODentry"}
              metaData={metadata}
              initialData={{}}
              subHeaderLabelStyle={{ paddingLeft: "0px !important" }}
              onSubmitData={onSubmitHandler}
              isNewRow={false}
              onClickActionEvent={() => {}}
              formState={{
                MessageBox: MessageBox,
                WORKING_DATE: authState?.workingDate,
                cardData: cardData,
                docCD: docCD,
                acctDtlReqPara: {
                  ACCT_CD: {
                    ACCT_TYPE: "ACCT_TYPE",
                    BRANCH_CD: "BRANCH_CD",
                    SCREEN_REF: docCD ?? "",
                  },
                },
              }}
              setDataOnFieldChange={(action, payload) => {
                if (action === "IS_VISIBLE") {
                  setIsData((old) => ({
                    ...old,
                    isVisible: payload.IS_VISIBLE,
                  }));
                }
              }}
              actions={actions}
              hideHeader={true}
              handelActionEvent={setCurrentAction}
              isDetailRowRequire={false}
              ref={myRef}
              headerToolbarStyle={{
                minHeight: "40px !important",
              }}
              formStyle={{ paddingTop: "0px !important" }}
            >
              {({ isSubmitting, handleSubmit }) => {}}
            </MasterDetailsForm>
          </div>
          <div
            className={`${isData?.value === "tab2" ? "main" : ""}`}
            style={{
              display: isData.value === "tab2" ? "inherit" : "none",
              padding: "10px",
            }}
          >
            <>
              <GridWrapper
                key={`tempODGrid-Today-data` + temporaryODDetail.isSuccess}
                finalMetaData={tempODGridTodayMetaData as GridMetaDataType}
                data={temporaryODDetail.data ?? []}
                setData={() => {}}
                loading={temporaryODDetail.isLoading}
              />
            </>
          </div>
          <div
            className={`${isData?.value === "tab3" ? "main" : ""}`}
            style={{
              display: isData.value === "tab3" ? "inherit" : "none",
              padding: "10px",
            }}
          >
            <>
              <GridWrapper
                key={`tempODGrid-History-Data` + temporaryODDetail.isSuccess}
                finalMetaData={tempODGridHistoryMetaData as GridMetaDataType}
                data={temporaryODDetail.data ?? []}
                setData={() => {}}
                loading={temporaryODDetail.isLoading}
                onClickActionEvent={async (index, id, data) => {
                  let res = await MessageBox({
                    messageTitle: "confirmation",
                    message: "AreYouSureToForceExp",
                    buttonNames: ["Yes", "No"],
                  });
                  if (res === "Yes") {
                    let Apireq = {
                      isNewRow: false,
                      COMP_CD: data?.COMP_CD ?? "",
                      BRANCH_CD: data?.BRANCH_CD ?? "",
                      ACCT_TYPE: data?.ACCT_TYPE ?? "",
                      ACCT_CD: data?.ACCT_CD ?? "",
                      SR_CD: data?.SR_CD ?? "",
                    };
                    validateTempOD?.mutate(
                      {
                        COMP_CD: data?.COMP_CD ?? "",
                        BRANCH_CD: data?.BRANCH_CD ?? "",
                        ACCT_TYPE: data?.ACCT_TYPE ?? "",
                        ACCT_CD: data?.ACCT_CD ?? "",
                        FROM_DT:
                          format(
                            new Date(data?.FROM_EFF_DATE),
                            "dd-MMM-yyyy"
                          ) ?? "",
                        TO_DT:
                          format(new Date(data?.TO_EFF_DATE), "dd-MMM-yyyy") ??
                          "",
                        CODE_VALUE: data?.CODE_CD ?? "",
                        AMOUNT_UPTO: data?.AMOUNT_UPTO ?? "",
                        WORKING_DATE: authState?.workingDate ?? "",
                      },
                      {
                        onSuccess: async (data) => {
                          for (const obj of data) {
                            const continueProcess = await showMessageBox(obj);
                            if (!continueProcess) {
                              break;
                            }
                            if (obj?.O_STATUS === "0") {
                              crudTempOD.mutate(Apireq);
                            }
                          }
                        },
                      }
                    );
                  }
                }}
              />
            </>
          </div>
        </Grid>
      </Container>
    </>
  );
};
export const TemporaryOD = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <TemporaryODMain />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
