import { useCallback, useContext, useRef, useState } from "react";
import { Dialog } from "@mui/material";
import { AccountInquiryMetadata } from "../metaData";
import { useMutation } from "react-query";
import { useNavigate, useLocation } from "react-router-dom";
import * as API from "../api";
import { AuthContext } from "pages_audit/auth";
import Dependencies from "../dependencies";
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
  utilFunction,
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
import {
  getdocCD,
  getPadAccountNumber,
} from "components/utilFunction/function";
import { Customer360GridMetaData } from "./Customer360Metadata";
import ClonedCkycProvider from "pages_audit/pages/operations/c-kyc/formModal/formDetails/formComponents/legalComps/ClonedCkycContext";
import { PaperComponent } from "pages_audit/pages/operations/DailyTransaction/TRN001/components";
import FormModal from "pages_audit/pages/operations/c-kyc/formModal/formModal";

const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
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
    actionName: "viewall",
    actionLabel: "ViewAll",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const Customer360Main = ({ open = false, onClose = () => {}, from = "" }) => {
  const navigate = useNavigate();
  const [rowsData, setRowsData] = useState<any>([]);
  const [acctOpen, setAcctOpen] = useState(false);
  const [componentToShow, setComponentToShow] = useState("");
  const [searchPara, setSearchPara] = useState<any>({});
  const [singleAccountInterest, setSingleAccountInterest] = useState(false);
  const [dateDialog, setDateDialog] = useState(false);
  const [interestCalReportDTL, setInterestCalReportDTL] = useState<any>([]);
  const [filterData, setFilterData] = useState("Y");
  const [actionMenu, setActionMenu] = useState(actions);

  const formRef = useRef<any>(null);
  const sevrerGridRef = useRef<any>(null);
  const formbtnRef = useRef<any>(null);
  const rowsDataRef = useRef<any>(null);
  const { authState }: any = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { trackDialogClass } = useDialogContext();
  const interestCalculateParaRef = useRef<any>(null);
  let currentPath = useLocation()?.pathname;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const endSubmitRef = useRef<any>(null);

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
        setRowsData(data?.rows);
        rowsDataRef.current = data?.rows?.[0]?.data;
        setAcctOpen(true);
      } else if (data.name === "dependencies") {
        setComponentToShow("Dependencies");
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
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const onSubmitHandler: SubmitFnType = (data: any, displayData, endSubmit) => {
    endSubmitRef.current = endSubmit;
    const hasBranch = Boolean(data?.BRANCH_CD?.trim());
    const hasAcctType = Boolean(data?.ACCT_TYPE?.trim());
    const hasAcctCode = Boolean(data?.ACCT_CD?.trim());
    const hasContact = Boolean(data?.CONTACT2?.trim());
    const hasCustomerID = Boolean(data?.CUSTOMER_ID?.trim());
    const hasPan = Boolean(data?.PAN_NO?.trim());
    const hasDrivingLicense = Boolean(data?.DRIVING_LICENSE_NO?.trim());
    const hasElectionCard = Boolean(data?.ELECTION_CARD_NO?.trim());
    const hasName = Boolean(data?.ACCT_NM?.trim());
    const hasPassportNo = Boolean(data?.PASSPORT_NO?.trim());
    const hasUniqueID = Boolean(data?.UNIQUE_ID?.trim());
    const hasAnyField =
      hasBranch ||
      hasAcctType ||
      hasAcctCode ||
      hasContact ||
      hasCustomerID ||
      hasPan ||
      hasDrivingLicense ||
      hasElectionCard ||
      hasName ||
      hasPassportNo ||
      hasUniqueID;
    if (!hasAnyField) {
      //@ts-ignore
      endSubmit(true, t("PleaseEnterAnyValue"));
      setSearchPara({});
      return;
    }
    if (
      !(
        hasAcctCode ||
        hasContact ||
        hasCustomerID ||
        hasPan ||
        hasDrivingLicense ||
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
  return (
    <>
      <div
        key={"Customer360Form"}
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
          key={`Customer360Form`}
          metaData={AccountInquiryMetadata as MetaDataType}
          initialValues={[]}
          subHeaderLabel={utilFunction?.getDynamicLabel(
            currentPath,
            authState?.menulistdata,
            true
          )}
          onSubmitHandler={onSubmitHandler}
          formStyle={{
            background: "white",
          }}
          containerstyle={{ padding: "0px 10px" }}
          formState={{
            docCD: docCD,
            MessageBox: MessageBox,
            setSearchPara: setSearchPara,
            endSubmitRef: endSubmitRef,
            sevrerGridRef: sevrerGridRef,
            acctDtlReqPara: {
              ACCT_CD: {
                ACCT_TYPE: "ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: docCD,
              },
            },
          }}
          onFormButtonClickHandel={() => {
            let event: any = { preventDefault: () => {} };
            formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
          }}
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
              >
                {t("Reset")}
              </GradientButton>
              {!Boolean(from === "MENU") ? (
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
      <div style={{ padding: "0px 10px" }}>
        <ServerGridWrapper
          dataGridKey={"customerInquiryGrid"}
          metaData={Customer360GridMetaData}
          getAPIFn={API.getCustomer360Data}
          getAPIReqPara={{ ...(searchPara ?? {}), DEFALUT_VIEW: filterData }}
          actions={actionMenu}
          setAction={setCurrentAction}
          ref={sevrerGridRef}
        />
      </div>
      {componentToShow === "ViewDetail" && Boolean(acctOpen) ? (
        <DailyTransTabsWithDialog
          handleClose={handleClose}
          rowsData={rowsData}
          setRowsData={setRowsData}
          isViewGrid={true}
          isShowFilterButton={true}
          label={
            rowsData?.[0]?.data?.AC_CD
              ? `Account No: ${rowsData?.[0]?.data?.AC_CD}`
              : undefined
          }
          occupiedHeight={{ min: "620px", max: "620px" }}
          screenFlag="CUST360"
        />
      ) : componentToShow === "Dependencies" ? (
        <Dependencies
          rowsData={rowsData}
          open={acctOpen}
          screenRef={null}
          onClose={() => setAcctOpen(false)}
        />
      ) : componentToShow === "viewCustomer" ? (
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
    </>
  );
};

export const Customer360 = ({
  open = false,
  onClose = () => {},
  from = "",
}) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <Customer360Main open={open} onClose={onClose} from={from} />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
