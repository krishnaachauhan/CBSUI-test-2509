import React, { useContext, useEffect, useMemo, useRef } from "react";
import { AppBar, LinearProgress } from "@mui/material";
import { useMutation, useQuery } from "react-query";
import { acctMSTHeaderFormMetadata } from "./metadata/acctHeaderMetadata";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { AcctMSTContext } from "./AcctMSTContext";
import {
  Alert,
  extractMetaData,
  FormWrapper,
  MetaDataType,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import _ from "lodash";

const AcctHeaderForm = ({ formmode, from, rowData }) => {
  const { MessageBox } = usePopupContext();
  const {
    AcctMSTState,
    handleHeaderFormSubmit,
    handleApiRes,
    handleFormLoading,
    handleAcctTypeValue,
    handleFormDataonSavectx,
    handleModifiedColsctx,
    handleStepStatusctx,
    handleColTabChangectx,
    handleUpdateLoader,
    handleFormModalClosectx,
    handleFormModalOpenctx,
    handleFromFormModectx,
    handleUpdateDocument,
    submitRefs,
    handleFdDetailParactx,
  } = useContext(AcctMSTContext);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const formRef = useRef<any | null>(null);

  const docTemplateMutation = useMutation(API.getKYCDocumentGridData, {
    onSuccess: async (data) => {
      if (Array.isArray(data) && data.length > 0) {
        const formattedTemplateData = data.map((doc) => {
          const cleanedRow = _.omit(doc, [
            "VERIFIED_MACHINE_NM",
            "VERIFIED_DATE",
            "VERIFIED_BY",
            "MACHINE_NM",
            "LAST_MODIFIED_DATE",
            "LAST_MACHINE_NM",
            "LAST_ENTERED_BY",
            "ENTERED_BY",
          ]);

          return {
            ...cleanedRow,
            TRANSR_CD: `${doc.SR_CD}`,
            SUBMIT: doc.SUBMIT === "Y",
            DOC_TYPE: "ACCT",
            ACTIVE: true,
            ENTERED_DATE: authState?.workingDate ?? "",
            DISPLAY_TEMPLATE_CD: doc?.DOC_DESCRIPTION,
            // _isNewRow: true,
          };
        });
        handleUpdateDocument({
          documents: [...formattedTemplateData],
        });
      }
    },
  });
  const fdDetailsParameter = useMutation(API.getFDParaDetail, {
    onSuccess: async (data) => {
      handleFdDetailParactx(...data);
    },
  });
  const onSubmitHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    const docTemplatePayload: any = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      ACCT_TYPE: data?.ACCT_TYPE,
      CONSTITUTION_TYPE: AcctMSTState?.constitutionValuectx ?? "",
    };
    if (data && !hasError) {
      if (data?.ACCT_TYPE !== AcctMSTState?.accTypeValuectx) {
        if (
          Boolean(AcctMSTState?.accTypeValuectx?.trim()) &&
          data?.ACCT_TYPE?.trim() !== AcctMSTState?.accTypeValuectx?.trim()
        ) {
          let buttonName = await MessageBox({
            messageTitle: "Confirmation",
            message: "YourChangesWillBeLostAreYouSure",
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            handleStepStatusctx({ reset: true });
            handleFormDataonSavectx({});
            handleFormModalClosectx();
            handleModifiedColsctx({});
            handleColTabChangectx(0);
            handleFormModalOpenctx();
            handleFromFormModectx({
              formmode: formmode === "edit" ? "view" : formmode,
              from,
            });
            handleHeaderFormSubmit({
              acctType: data?.ACCT_TYPE,
              parentCode: data?.PARENT_CODE,
              reqID: data?.REQ_ID,
            });

            if (formmode === "new") {
              docTemplateMutation.mutate(docTemplatePayload);
            }
          }
        } else {
          handleHeaderFormSubmit({
            acctType: data?.ACCT_TYPE,
            parentCode: data?.PARENT_CODE,
            reqID: data?.REQ_ID,
          });

          if (formmode === "new") {
            docTemplateMutation.mutate(docTemplatePayload);
          }
          handleColTabChangectx(0);
        }
      }
    }
    submitRefs.current = false;
    endSubmit(true);
  };

  const initialVal = useMemo(() => {
    return {
      ACCT_CD: AcctMSTState?.acctNumberctx,
      ACCT_TYPE: AcctMSTState?.accTypeValuectx,
      REQ_ID: AcctMSTState?.req_cd_ctx,
      BRANCH_CD: AcctMSTState?.rowBranchCodectx
        ? AcctMSTState?.rowBranchCodectx ?? ""
        : authState?.user?.branchCode ?? "",
    };
  }, [
    AcctMSTState?.acctNumberctx,
    AcctMSTState?.accTypeValuectx,
    AcctMSTState?.req_cd_ctx,
  ]);

  // const loader = useMemo(() => (AcctMSTState?.currentFormctx.isLoading || AcctMSTState?.isLoading) ? <LinearProgress color="secondary" /> : null, [AcctMSTState?.currentFormctx.isLoading, AcctMSTState?.isLoading])
  const loader = useMemo(
    () =>
      AcctMSTState?.isLoading ? <LinearProgress color="secondary" /> : null,
    [AcctMSTState?.isLoading]
  );

  const {
    data: TabsData,
    isSuccess,
    isLoading,
    isFetching,
    isError: isTabError,
    error: TabError,
    refetch,
  } = useQuery<any, any>(
    ["getTabsDetail", AcctMSTState?.accTypeValuectx],
    () =>
      API.getTabsDetail({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        ACCT_TYPE: AcctMSTState?.accTypeValuectx,
        ACCT_MODE: AcctMSTState?.acctModectx,
        ALLOW_EDIT:
          docCD === "RPT/48" || docCD === "MST/144"
            ? "LOCNEW"
            : AcctMSTState?.isFreshEntryctx
            ? "NEW"
            : AcctMSTState?.confirmFlagctx
            ? AcctMSTState?.confirmFlagctx === "Y"
              ? "EDIT"
              : "NEW"
            : "EDIT",
        // isFreshEntry: state?.isFreshEntryctx,
      }),
    {
      enabled: Boolean(AcctMSTState?.accTypeValuectx),
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getTabsDetail",
        AcctMSTState?.accTypeValuectx,
      ]);
    };
  }, []);

  useEffect(() => {
    // if() {
    // console.log("ResultResult", TabsData)
    // setTabsApiRes(data)
    if (!isLoading && TabsData && TabsData.length > 0) {
      let newData: any[] = [];
      TabsData.forEach(async (element: { [k: string]: any }) => {
        if (element.O_STATUS !== "0") {
          let buttonName = await MessageBox({
            messageTitle:
              element.O_STATUS === "999"
                ? "ValidationFailed"
                : element.O_STATUS === "9"
                ? "Alert"
                : element.O_STATUS === "99"
                ? "Confirmation"
                : "Success",
            message: element.O_MESSAGE,
            buttonNames:
              element.O_STATUS === "999"
                ? ["Ok"]
                : element.O_STATUS === "9"
                ? ["Ok"]
                : element.O_STATUS === "99"
                ? ["Yes", "No"]
                : ["Ok"],
            icon:
              element.O_STATUS === "999"
                ? "ERROR"
                : element.O_STATUS === "9"
                ? "WARNING"
                : element.O_STATUS === "99"
                ? "CONFIRM"
                : "SUCCESS",
          });
          if (buttonName === "Ok" && element.O_STATUS === "999") {
            handleAcctTypeValue("");
          }
        } else {
          let subtitleinfo = {
            SUB_TITLE_NAME: element?.SUB_TITLE_NAME,
            SUB_TITLE_DESC: element?.SUB_TITLE_DESC,
            SUB_ICON: element?.SUB_ICON,
          };
          let index = newData.findIndex(
            (el: any) => el?.TAB_NAME === element?.TAB_NAME
          );
          if (index != -1) {
            // duplicate tab element
            let subtitles = newData[index].subtitles;
            subtitles.push(subtitleinfo);
          } else {
            // new tab element
            newData.push({
              ...element,
              subtitles: [subtitleinfo],
              isVisible: true,
            });
          }
          // console.log("filled newdata -aft", element.TAB_NAME , newData)
        }
      });
      // setTabsApiRes(newData)
      const validTabNames = ["FD", "FCUM", "DFD"];
      const hasFD = newData?.find(
        (tab) => validTabNames.includes(tab?.TAB_NAME) && tab?.OPEN_FD === "Y"
      );
      if (hasFD) {
        fdDetailsParameter.mutate({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: AcctMSTState?.rowBranchCodectx
            ? AcctMSTState?.rowBranchCodectx
            : authState?.user?.branchCode ?? "",
          ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
          SCREEN_REF: docCD ?? "",
        });
      }
      handleApiRes(newData);
    }
    // }
  }, [TabsData, isLoading]);
  useEffect(() => {
    if (isLoading || isFetching) {
      handleUpdateLoader(true);
    } else {
      handleUpdateLoader(false);
    }
  }, [isLoading, isFetching, TabsData]);

  // useEffect(() => {
  //   console.log("AcctMSTState?.isLoading iauhfuiahef", AcctMSTState?.isLoading)
  // }, [AcctMSTState?.isLoading])

  return (
    <AppBar position="sticky" style={{ marginBottom: "10px", zIndex: 99 }}>
      <FormWrapper
        key={"acct-header-form" + initialVal + AcctMSTState?.accTypeValuectx}
        ref={formRef}
        onSubmitHandler={onSubmitHandler}
        initialValues={initialVal}
        metaData={
          extractMetaData(
            acctMSTHeaderFormMetadata,
            AcctMSTState?.formmodectx
          ) as MetaDataType
        }
        formStyle={{}}
        formState={{
          docCD: docCD,
          formMode: AcctMSTState?.formmodectx || formmode,
        }}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        controlsAtBottom={false}
        onFormButtonClickHandel={() => {
          let event: any = { preventDefault: () => {} };
          formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
        }}
      ></FormWrapper>
      {loader}
      {isTabError && (
        <Alert
          severity={TabError?.severity ?? "error"}
          errorMsg={TabError?.error_msg ?? "Something went to wrong.."}
          errorDetail={TabError?.error_detail}
          color="error"
        />
      )}
    </AppBar>
  );
};

export default AcctHeaderForm;
