import React, { useCallback, useContext, useRef, useState } from "react";
import { useMutation } from "react-query";
import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import * as API from "./api";
import {
  retrieveAcctFormMetaData,
  retrieveAcctGridMetaData,
} from "./metadata/retrieveAcctMetadata";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import AcctModal from "./AcctModal";

import {
  usePopupContext,
  GridWrapper,
  GradientButton,
  ActionTypes,
  utilFunction,
  GridMetaDataType,
  Alert,
  SubmitFnType,
} from "@acuteinfo/common-base";
import {
  getdocCD,
  getPadAccountNumber,
} from "components/utilFunction/function";
import { useTranslation } from "react-i18next";
const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
];

const RetrieveAcct = ({ gridApiReqDataRef }) => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [rowsData, setRowsData] = useState<any[]>([]);
  const { MessageBox } = usePopupContext();
  const [displayGridData, setDisplayGridData] = useState(false);
  const { t } = useTranslation();
  const formRef = useRef<any>(null);
  const endSubmitRef = useRef<any>(null);
  // const gridApiReqDataRef = useRef<any>(null);
  const isCallFinalSaveRef = useRef<boolean>(false);
  const routeLocation = useLocation();
  const path = routeLocation.pathname;
  const shouldHideMainUI =
    path.includes("new-account") || path.includes("view-detail");

  const setCurrentAction = useCallback(
    (data) => {
      const confirmed = data?.rows?.[0]?.data?.CONFIRMED ?? "";
      const maker = data?.rows?.[0]?.data?.MAKER ?? "";
      const loggedinUser = authState?.user?.id;
      let formmode = "edit";
      if (Boolean(confirmed)) {
        // P=SENT TO CONFIRMATION
        if (confirmed.includes("P")) {
          if (maker === loggedinUser) {
          } else {
            formmode = "view";
          }
        } else if (confirmed.includes("M")) {
          // M=SENT TO MODIFICATION
        } else if (confirmed.includes("Y") || confirmed.includes("R")) {
        } else {
          formmode = "view";
        }
      }
      setRowsData(data?.rows);

      if (data.name === "view-detail") {
        navigate(data?.name, {
          state: {
            rows: data?.rows ?? [{ data: null }],
            formmode: formmode,
            from: "retrieve-entry",
          },
        });
        // setComponentToShow("ViewDetail");
        // setAcctOpen(true);
        // setRowsData(data?.rows);
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const mutation: any = useMutation(API.getAccountList, {
    onSuccess: () => {},
    onError: (error) => {},
  });

  const onFormSubmit: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmitRef.current = endSubmit;
    const hasBranch = Boolean(data?.BRANCH_CD?.trim());
    const hasAcctType = Boolean(data?.ACCT_TYPE?.trim());
    const hasAcctCode = Boolean(data?.ACCT_CD?.trim());
    const hasContact = Boolean(data?.CONTACT2?.trim());
    const hasCustomerID = Boolean(data?.CUSTOMER_ID?.trim());
    const hasPan = Boolean(data?.PAN_NO?.trim());

    const hasAnyField =
      hasBranch ||
      hasAcctType ||
      hasAcctCode ||
      hasContact ||
      hasCustomerID ||
      hasPan;

    if (!hasAnyField) {
      endSubmit(true, t("PleaseEnterAnyAalue"));
      setDisplayGridData(false);
      return;
    }

    if (
      hasBranch &&
      !hasContact &&
      !hasCustomerID &&
      !hasPan &&
      (!hasAcctType || !hasAcctCode)
    ) {
      if (!hasAcctType && !hasAcctCode) {
        endSubmit(true, t("PleaseEnterAccountTypeAccountCode"));
      } else if (!hasAcctType) {
        endSubmit(true, t("PleaseSelectAcctType"));
      } else if (!hasAcctCode) {
        endSubmit(true, t("PleaseEnterAccountCode"));
      } else {
        endSubmit(true);
      }
      setDisplayGridData(false);
      return;
    }

    endSubmit(true);
    setDisplayGridData(true);
    let payload = {
      SELECT_COLUMN: {},
      A_COMP_CD: authState?.companyID ?? "",
      A_BRANCH_CD: authState?.user?.branchCode ?? "",
    };
    let { RETRIEVE_BTN, PADDINGNUMBER, ...others } = data;
    Object.keys(others)?.forEach((key) => {
      if (Boolean(data[key])) {
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
    gridApiReqDataRef.current = payload;
    mutation.mutate(payload);
  };

  const handleDialogClose = useCallback(() => {
    navigate(".");
    if (
      isCallFinalSaveRef.current === true &&
      Object.keys(gridApiReqDataRef.current)?.length > 0
    ) {
      mutation.mutate(gridApiReqDataRef.current ?? {});
      isCallFinalSaveRef.current = false;
    }
  }, [navigate]);

  return (
    <div key={"RetrieveAcct"}>
      {!shouldHideMainUI && (
        <div key={"RetrieveAcct222"}>
          <div
            onKeyDown={async (e: any) => {
              if (e.key !== "Enter") return;
              if (!e.target?.value?.trim()) return;
              if (e.target?.name === "retrieveAcctForm/ACCT_CD") {
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
                if (
                  currentIndex > -1 &&
                  currentIndex < formElements?.length - 1
                ) {
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
              key={"retrieveAcctForm"}
              metaData={retrieveAcctFormMetaData as MetaDataType}
              initialValues={{}}
              onSubmitHandler={onFormSubmit}
              formState={{
                MessageBox: MessageBox,
                docCD: docCD,
                setDisplayGridData: setDisplayGridData,
                acctDtlReqPara: {
                  ACCT_CD: {
                    ACCT_TYPE: "ACCT_TYPE",
                    BRANCH_CD: "BRANCH_CD",
                    SCREEN_REF: docCD ?? "",
                  },
                },
                mutation: mutation,
                endSubmitRef: endSubmitRef,
                gridApiReqDataRef: gridApiReqDataRef,
              }}
              formStyle={{
                background: "white",
                maxHeight: "200px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
              containerstyle={{ padding: "0px 0px 10px 0px" }}
              ref={formRef}
              onFormButtonClickHandel={() => {
                let event: any = { preventDefault: () => {} };
                formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
              }}
            >
              {() => (
                <>
                  <GradientButton
                    onClick={() => {
                      // onClose();
                      navigate("new-account", {
                        state: {
                          isFormModalOpen: true,
                          // entityType: "I",
                          isFreshEntry: true,

                          rows: [{ data: {} }],
                          formmode: "new",
                          from: "new-entry",
                        },
                      });
                    }}
                    // disabled={isSubmitting}
                    color={"primary"}
                  >
                    NEW ACCOUNT
                  </GradientButton>
                </>
              )}
            </FormWrapper>
          </div>
          {mutation?.isError && (
            <Alert
              severity={mutation?.error?.severity ?? "error"}
              errorMsg={
                mutation?.error?.error_msg ?? "Something went to wrong.."
              }
              errorDetail={mutation?.error?.error_detail}
              color="error"
            />
          )}
          <GridWrapper
            key={"retrieveAcctGrid" + displayGridData}
            finalMetaData={retrieveAcctGridMetaData as GridMetaDataType}
            data={displayGridData ? mutation.data ?? [] : []}
            setData={() => null}
            loading={mutation.isLoading}
            actions={actions}
            setAction={setCurrentAction}
          />
        </div>
      )}
    </div>
  );
};

export default RetrieveAcct;
