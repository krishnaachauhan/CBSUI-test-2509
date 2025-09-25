import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { Dialog } from "@mui/material";
import { AccountInquiryMetadata, AccountInquiryGridMetaData } from "./metaData";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { ViewStatement } from "./viewStatement";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import Dependencies from "./dependencies";
import { DailyTransTabsWithDialog } from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs/DailyTransTabs";
import { t } from "i18next";
import {
  GradientButton,
  ActionTypes,
  SubmitFnType,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  ClearCacheProvider,
  ServerGridWrapper,
} from "@acuteinfo/common-base";
import { DateRetrival } from "pages_audit/pages/operations/DailyTransaction/TRN001/DateRetrival/DataRetrival";
import { getInterestCalculatePara } from "pages_audit/pages/operations/DailyTransaction/TRN001/api";
import {
  getHeaderDTL,
  getInterestCalculateReportDTL,
} from "pages_audit/pages/operations/DailyTransaction/TRN001/DateRetrival/api";
import { format } from "date-fns";
import {
  DialogProvider,
  useDialogContext,
} from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
import { SingleAccountInterestReport } from "pages_audit/pages/operations/DailyTransaction/TRN001/DateRetrival/singleAccountInterestReport";
import { getPadAccountNumber } from "components/utilFunction/function";
import AcctMSTProvider from "pages_audit/pages/operations/acct-mst/AcctMSTContext";
import AcctModal from "pages_audit/pages/operations/acct-mst/AcctModal";
import ClonedCkycProvider from "pages_audit/pages/operations/c-kyc/formModal/formDetails/formComponents/legalComps/ClonedCkycContext";
import { PaperComponent } from "pages_audit/pages/operations/DailyTransaction/TRN001/components";
import FormModal from "pages_audit/pages/operations/c-kyc/formModal/formModal";
import { cloneDeep } from "lodash";

const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "viewMaster",
    actionLabel: "View A/c Master",
    multiple: false,
    rowDoubleClick: false,
  },
  {
    actionName: "viewCustomer",
    actionLabel: "View Customer Master",
    multiple: false,
    rowDoubleClick: false,
  },
  {
    actionName: "dependencies",
    actionLabel: "Dependencies",
    multiple: false,
    rowDoubleClick: false,
  },
  {
    actionName: "view-statement",
    actionLabel: "View Statement/Passbook",
    multiple: false,
    rowDoubleClick: false,
  },
  {
    actionName: "view-interest",
    actionLabel: "View Interest",
    multiple: false,
    rowDoubleClick: false,
  },
  {
    actionName: "viewall",
    actionLabel: "ViewAll",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const AccountinquiryMain = ({
  open = false,
  onClose = () => {},
  from = "",
}) => {
  const navigate = useNavigate();
  const [rowsData, setRowsData] = useState<any>([]);
  const [searchPara, setSearchPara] = useState<any>({});
  const [acctOpen, setAcctOpen] = useState(false);
  const [componentToShow, setComponentToShow] = useState("");
  const formRef = useRef<any>(null);
  const formbtnRef = useRef<any>(null);
  const rowsDataRef = useRef<any>(null);
  const { authState }: any = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [singleAccountInterest, setSingleAccountInterest] = useState(false);
  const [dateDialog, setDateDialog] = useState(false);
  const { trackDialogClass } = useDialogContext();
  const interestCalculateParaRef = useRef<any>(null);
  const sevrerGridRef = useRef<any>(null);
  const [interestCalReportDTL, setInterestCalReportDTL] = useState<any>([]);
  const endSubmitRef = useRef<any>(null);
  const [filterData, setFilterData] = useState("Y");
  const [actionMenu, setActionMenu] = useState(actions);
  interface InsertFormDataFnType {
    data: object;
    displayData?: object;
    endSubmit?: any;
    setFieldError?: any;
  }

  const getInterestCalculateReport = useMutation(
    getInterestCalculateReportDTL,
    {
      onSuccess: async (data: any, variables: any) => {
        for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
          if (data?.[0]?.MSG[i]?.O_STATUS === "999") {
            await MessageBox({
              messageTitle:
                data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "99") {
            await MessageBox({
              messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "9") {
            await MessageBox({
              messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Alert",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "0") {
            getHeaderDtl.mutate({ SCREEN_REF: "" });
          }
        }
        CloseMessageBox();
      },
      onError: async (error: any, variables: any) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "Somethingwenttowrong",
          icon: "ERROR",
        });
        getHeaderDtl.mutate({ SCREEN_REF: "" });
      },
    }
  );

  const getHeaderDtl = useMutation(getHeaderDTL, {
    onSuccess: async (data: any, variables: any) => {
      CloseMessageBox();
    },
    onError: async (error: any, variables: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "Somethingwenttowrong",
        icon: "ERROR",
      });
    },
  });

  const getInterestCalculateParaMutation = useMutation(
    getInterestCalculatePara,
    {
      onSuccess: async (data: any, variables: any) => {
        const combinedData = { ...data?.rows?.[0]?.data, ...data?.[0] };
        interestCalculateParaRef.current = [
          ...(interestCalculateParaRef.current || []),
          combinedData,
        ];
        if (data?.[0]?.OPEN_DATE_PARA === "Y") {
          setDateDialog(true);
          trackDialogClass("Retrieve");
        } else if (data?.[0]?.OPEN_DATE_PARA === "N") {
          setSingleAccountInterest(true);
          getInterestCalculateReport.mutate({
            COMP_CD: rowsDataRef?.current?.COMP_CD ?? "",
            BRANCH_CD: rowsDataRef?.current?.BRANCH_CD ?? "",
            ACCT_TYPE: rowsDataRef?.current?.ACCT_TYPE ?? "",
            ACCT_CD: rowsDataRef?.current?.ACCT_CD ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
            FROM_DT: data?.[0]?.FROM_DT
              ? format(new Date(data?.[0]?.FROM_DT), "dd/MMM/yyyy")
              : "",
            TO_DT: data?.[0]?.TO_DT
              ? format(new Date(data?.[0]?.TO_DT), "dd/MMM/yyyy")
              : "",
            PARENT_CODE: data?.[0]?.PARENT_CODE ?? "",
            PARENT_TYPE: data?.[0]?.PARENT_TYPE ?? "",
            GD_DATE: authState?.workingDate ?? "",
            SCREEN_REF: "",
          });
        }
      },
      onError: async (error: any, variables: any) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "Somethingwenttowrong",
          icon: "ERROR",
        });
      },
    }
  );

  const setCurrentAction = useCallback(
    (data) => {
      if (data.name === "view-detail") {
        setComponentToShow("ViewDetail");
        setAcctOpen(true);
        setRowsData(data?.rows);
        rowsDataRef.current = data?.rows?.[0]?.data;
      } else if (data.name === "dependencies") {
        setComponentToShow("Dependencies");
        setAcctOpen(true);
        setRowsData(data?.rows);
      } else if (data.name === "view-statement") {
        setComponentToShow("ViewStatement");
        setAcctOpen(true);
        setRowsData(data?.rows);
      } else if (data?.name === "viewOpen") {
        setActionMenu((values) =>
          values.map((item) =>
            item.actionName === "viewOpen"
              ? { ...item, actionName: "viewall", actionLabel: t("ViewAll") }
              : item
          )
        );
        setFilterData("Y");
        sevrerGridRef?.current?.fetchData();
      } else if (data?.name === "viewall") {
        setActionMenu((values) =>
          values.map((item) =>
            item.actionName === "viewall"
              ? { ...item, actionName: "viewOpen", actionLabel: "View Open" }
              : item
          )
        );
        setFilterData("N");
        sevrerGridRef?.current?.fetchData();
      } else if (data.name === "viewCustomer") {
        setComponentToShow("viewCustomer");
        setAcctOpen(true);
        setRowsData(data?.rows?.[0]?.data);
      } else if (data.name === "view-interest") {
        rowsDataRef.current = data?.rows?.[0]?.data;
        setInterestCalReportDTL([]);
        interestCalculateParaRef.current = [];
        getInterestCalculateParaMutation?.mutate({
          A_COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
          A_BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
          A_ACCT_TYPE: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
          A_ACCT_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
          A_SCREEN_REF: "",
          WORKING_DATE: authState?.workingDate ?? "",
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
        });
      } else if (data.name === "viewMaster") {
        setComponentToShow("viewMaster");
        setAcctOpen(true);
        setRowsData(data?.rows?.[0]?.data);
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit
  ) => {
    const hasAcctCode = Boolean(data?.ACCT_CD?.trim());
    const hasContact = Boolean(data?.CONTACT2?.trim());
    const hasCustomerID = Boolean(data?.CUSTOMER_ID?.trim());
    const hasPan = Boolean(data?.PAN_NO?.trim());
    const hasElectionCard = Boolean(data?.ELECTION_CARD_NO?.trim());
    const hasName = Boolean(data?.ACCT_NM?.trim());
    const hasPassportNo = Boolean(data?.PASSPORT_NO?.trim());
    const hasUniqueID = Boolean(data?.UNIQUE_ID?.trim());
    if (
      !(
        hasAcctCode ||
        hasContact ||
        hasCustomerID ||
        hasPan ||
        hasElectionCard ||
        hasName ||
        hasPassportNo ||
        hasUniqueID
      )
    ) {
      //@ts-ignore
      endSubmit(true);
      return;
    }
    endSubmitRef.current = endSubmit;
    //@ts-ignore
    setSearchPara({});
    endSubmit(true);
    const payload = {
      ...data,
      COMP_CD: authState?.companyID,
      SELECT_COLUMN: {},
    };
    let { RETRIEVE_BTN, PADDINGNUMBER, ...others } = data;
    Object.keys(others)?.forEach((key) => {
      if (data[key]) {
        if (key === "ACCT_CD") {
          payload["SELECT_COLUMN"]["ACCT_CD"] = getPadAccountNumber(
            data?.ACCT_CD,
            { PADDING_NUMBER: PADDINGNUMBER }
          );
        } else {
          payload["SELECT_COLUMN"][key] = data?.[key];
        }
      }
    });
    setSearchPara(payload);
    sevrerGridRef?.current?.fetchData();
  };

  const handleClose = () => {
    setAcctOpen(false);
  };

  const parsedMetaData = useMemo(() => {
    let metaData = cloneDeep(AccountInquiryMetadata);
    return {
      ...metaData,
      fields: metaData?.fields?.filter(
        (obj) => obj.name !== "DRIVING_LICENSE_NO"
      ),
    };
  }, []);
  return (
    <>
      {/* <Dialog
        open={open}
        onClose={onClose}
        fullWidth={true}
        PaperProps={{
          style: {
            maxWidth: "1150px",
          },
        }}
      > */}
      <div
        onKeyDown={async (e: any) => {
          if (e.key !== "Enter") return;
          if (!e.target?.value?.trim()) return;
          if (e.target?.name === "AccountInquiry895/ACCT_CD") {
            e.preventDefault();
            endSubmitRef.current?.(true);
            const formElements: any = Array.from(
              e.currentTarget.querySelectorAll(
                'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
              ) as NodeListOf<HTMLElement>
            ).filter(
              (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
            );
            const currentIndex = formElements?.findIndex(
              (el) => el === e.target
            );
            if (currentIndex > -1 && currentIndex < formElements?.length - 1) {
              const nextElement = formElements[currentIndex + 1];
              nextElement?.focus();
            }
          } else {
            e.preventDefault();
            formRef?.current?.handleSubmit(e, "save");
          }
        }}
      >
        <FormWrapper
          key={`accountInquiryForm`}
          metaData={parsedMetaData as MetaDataType}
          initialValues={[]}
          subHeaderLabel="Account Inquiry"
          onSubmitHandler={onSubmitHandler}
          formStyle={{
            background: "white",
          }}
          formState={{
            docCD: "ACCTINQ",
            MessageBox: MessageBox,
            setSearchPara: setSearchPara,
            endSubmitRef: endSubmitRef,
            // mutation: mutation,
            sevrerGridRef: sevrerGridRef,
            acctDtlReqPara: {
              ACCT_CD: {
                ACCT_TYPE: "ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: "ACCTINQ",
              },
            },
          }}
          onFormButtonClickHandel={() => {
            let event: any = { preventDefault: () => {} };
            formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
          }}
          // onFormButtonCicular={mutation.isLoading}
          ref={formRef}
        >
          {() => (
            <>
              <GradientButton
                onClick={(e) => {
                  formRef.current?.handleFormReset(e, "Reset");
                  setSearchPara({});
                  sevrerGridRef?.current?.fetchData();
                }}
                color={"primary"}
                // ref={formbtnRef}
              >
                {t("Reset")}
              </GradientButton>
              {from !== "MENU" ? (
                <GradientButton
                  onClick={() => {
                    onClose();
                  }}
                  color={"primary"}
                  ref={formbtnRef}
                  endicon="CancelOutlined"
                  rotateIcon="scale(1.4) rotate(360deg)"
                  sx={{
                    background: "transparent !important",
                    color: "var(--theme-color2) !important",
                    boxShadow: "none !important",
                    fontSize: "14px",
                    "&:hover": {
                      background: "rgba(235, 237, 238, 0.45) !important",
                      // color: "var(--theme-color2) !important",
                      // border: "1.5px solid var(--theme-color2)",
                      transition: "all 1s ease 0s",
                      "& .MuiSvgIcon-root": {
                        transform: "scale(1.4) rotateY(360deg)",
                        transition: "transform 2s ease-in-out",
                      },
                    },
                  }}
                >
                  {t("Close")}
                </GradientButton>
              ) : null}
            </>
          )}
        </FormWrapper>
      </div>
      <div style={{ padding: "0px 10px 10px 10px" }}>
        <ServerGridWrapper
          dataGridKey={"accountInquiryGrid"}
          metaData={AccountInquiryGridMetaData}
          getAPIFn={API.getAccountInquiry}
          getAPIReqPara={{ ...(searchPara ?? {}), DEFALUT_VIEW: filterData }}
          actions={actionMenu}
          setAction={setCurrentAction}
          ref={sevrerGridRef}
        />
      </div>
      {componentToShow === "ViewDetail" && Boolean(acctOpen) && (
        <DailyTransTabsWithDialog
          handleClose={handleClose}
          rowsData={rowsData}
          setRowsData={setRowsData}
          isViewGrid={false}
          isShowFilterButton={false}
          occupiedHeight={{ min: "327px", max: "327px" }}
          screenFlag="ACCTINQ"
          label={
            rowsData?.[0]?.data?.ACCT_NO
              ? `Account No: ${rowsData?.[0]?.data?.ACCT_NO}`
              : undefined
          }
        />
      )}
      {componentToShow === "Dependencies" && (
        <Dependencies
          rowsData={rowsData}
          open={acctOpen}
          screenRef={null}
          onClose={() => setAcctOpen(false)}
        />
      )}{" "}
      {componentToShow === "ViewStatement" && (
        <ViewStatement
          rowsData={rowsData}
          open={acctOpen}
          onClose={() => setAcctOpen(false)}
          screenFlag={"ACCT_INQ"}
          close={onClose}
        />
      )}
      {componentToShow === "viewMaster" && (
        <Dialog
          open={acctOpen}
          maxWidth="xl"
          PaperProps={{
            style: {
              width: "100%",
              padding: 8,
            },
          }}
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setAcctOpen(false);
            }
          }}
        >
          <AcctMSTProvider>
            <AcctModal
              onClose={() => setAcctOpen(false)}
              asDialog={false}
              rowData={rowsData}
              formmodeState="view"
              fromState="pending-entry"
            />
          </AcctMSTProvider>
        </Dialog>
      )}
      {componentToShow === "viewCustomer" ? (
        <ClonedCkycProvider>
          <Dialog
            open={acctOpen}
            PaperComponent={PaperComponent}
            id="draggable-dialog-title"
            PaperProps={{
              style: {
                width: "100%",
                padding: 8,
              },
            }}
            maxWidth="xl"
          >
            <FormModal
              key={`ckycFormModal-Dialog`}
              onClose={() => setAcctOpen(false)}
              formmode={"view"}
              from={"pending-entry"}
              rowData={rowsData}
              isModal={true}
              docCDExternal="ACCTINQ"
            />
          </Dialog>
        </ClonedCkycProvider>
      ) : null}
      {dateDialog && (
        <DateRetrival
          closeDialog={() => {
            setDateDialog(false);
            trackDialogClass("");
          }}
          open={dateDialog}
          reqData={{
            COMP_CD: rowsDataRef?.current?.COMP_CD ?? "",
            BRANCH_CD: rowsDataRef?.current?.BRANCH_CD ?? "",
            ACCT_TYPE: rowsDataRef?.current?.ACCT_TYPE ?? "",
            ACCT_CD: rowsDataRef?.current?.ACCT_CD ?? "",
            PARENT_CODE:
              getInterestCalculateParaMutation?.data?.[0]?.PARENT_CODE ?? "",
            PARENT_TYPE:
              getInterestCalculateParaMutation?.data?.[0]?.PARENT_TYPE ?? "",
            FROM_DT: getInterestCalculateParaMutation?.data?.[0]?.FROM_DT ?? "",
            TO_DT: getInterestCalculateParaMutation?.data?.[0]?.TO_DT ?? "",
            DISABLE_FROM_DT:
              getInterestCalculateParaMutation?.data?.[0]?.DISABLE_FROM_DT ??
              "",
            DISABLE_TO_DT:
              getInterestCalculateParaMutation?.data?.[0]?.DISABLE_TO_DT ?? "",
          }}
          reportDTL={setInterestCalReportDTL}
          openReport={() => {
            setDateDialog(false);
            setSingleAccountInterest(true);
          }}
        />
      )}
      {singleAccountInterest && (
        <SingleAccountInterestReport
          open={singleAccountInterest}
          date={
            interestCalReportDTL?.[0] ??
            getInterestCalculateParaMutation?.data?.[0]
          }
          reportHeading={interestCalReportDTL?.[2] ?? getHeaderDtl?.data?.[0]}
          reportDetail={
            interestCalReportDTL?.[1] ?? getInterestCalculateReport?.data?.[0]
          }
          acctInfo={{
            BRANCH_CD: rowsDataRef?.current?.BRANCH_CD ?? "",
            ACCT_TYPE: rowsDataRef?.current?.ACCT_TYPE ?? "",
            ACCT_CD: rowsDataRef?.current?.ACCT_CD ?? "",
            PARENT_TYPE:
              getInterestCalculateParaMutation?.data?.[0]?.PARENT_TYPE ?? "",
          }}
          closeDialog={() => {
            setSingleAccountInterest(false);
            trackDialogClass("");
          }}
          isLoader={
            getInterestCalculateReport?.isLoading || getHeaderDtl?.isLoading
          }
        />
      )}
      {/* </Dialog> */}
    </>
  );
};

export const Accountinquiry = ({
  open = false,
  onClose = () => {},
  from = "",
}) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <AccountinquiryMain open={open} onClose={onClose} from={from} />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
