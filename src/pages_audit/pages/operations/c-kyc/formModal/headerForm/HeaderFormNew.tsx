import {
  Alert,
  extractMetaData,
  FormWrapper,
  InitialValuesType,
  MetaDataType,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { CustHeaderFormMetadata } from "./headerFormMetadata";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CkycContext } from "../../CkycContext";
import { AppBar, LinearProgress, Toolbar } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import * as API from "../../api";
import { t } from "i18next";
import { format, isValid } from "date-fns";
import { useLocation } from "react-router-dom";
import Dependencies from "pages_audit/acct_Inquiry/dependencies";
import { getdocCD } from "components/utilFunction/function";
import CategoryUpdate from "../CategoryUpdateModal";
import _ from "lodash";
import { ClonedCkycContext } from "../formDetails/formComponents/legalComps/ClonedCkycContext";
import { HeaderFormMetadata } from "./headerFormModalMetaData";

const HeaderFormNew = forwardRef<any, any>(({ isModal }, ref) => {
  const {
    state,
    handleCategoryChangectx,
    handleApiRes,
    handleAccTypeVal,
    handleFormDataonSavectx,
    handleModifiedColsctx,
    headerFormSubmitRef,
    handleUpdateLoader,
    handleFormDataonSavectxNew,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const [dependecyDialogOpen, setDependecyDialogOpen] = useState(false);
  const [changeCategDialog, setChangeCategDialog] = useState<boolean>(false);
  const { authState } = useContext(AuthContext);
  const personalDtl = state?.retrieveFormDataApiRes?.PERSONAL_DETAIL || {};
  const modifiedFormCols = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: data } = useLocation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const childRef = useRef<any>(null);
  const {
    data: TabsData,
    isError,
    error,
    isFetching,
    isLoading,
  } = useQuery<any, any>(
    [
      "getTabsDetail",
      {
        ENTITY_TYPE: state?.entityTypectx,
        CATEGORY_CD: state?.categoryValuectx,
        CONS_TYPE: state?.constitutionValuectx,
        CONFIRMFLAG: state?.confirmFlagctx,
      },
    ],
    () =>
      API.getTabsDetail({
        COMP_CD: authState?.companyID ?? "",
        ENTITY_TYPE: state?.entityTypectx,
        ENTRY_MODE:
          (!Boolean(state?.customerIDctx) && !Boolean(state?.req_cd_ctx)) ||
          state?.fromctx === "confirmation-entry"
            ? "NEW"
            : "EDIT",
      }),
    {
      onSuccess: (data) => {
        if (data?.length > 0) {
          attestationMutation?.mutate({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            CUSTOMER_ID: state?.customerIDctx ?? "",
            USER_NAME: authState?.user?.id ?? "",
          });
        }
      },
    }
  );

  useEffect(() => {
    if (!isLoading && TabsData?.length) {
      const tabLookup: { [tabName: string]: any } = {};
      const newData: any[] = [];

      TabsData.forEach((element) => {
        const { TAB_NAME, SUB_TITLE_NAME, SUB_TITLE_DESC, SUB_ICON, ...rest } =
          element;

        const subtitleInfo = { SUB_TITLE_NAME, SUB_TITLE_DESC, SUB_ICON };

        if (tabLookup[TAB_NAME]) {
          tabLookup[TAB_NAME].subtitles.push(subtitleInfo);
        } else {
          const newTab = {
            ...rest,
            TAB_NAME,
            subtitles: [subtitleInfo],
            isVisible: true,
          };
          tabLookup[TAB_NAME] = newTab;
          newData.push(newTab);
        }
      });

      handleApiRes(newData);
    }
  }, [TabsData, isLoading]);

  const attestationMutation: any = useMutation(API.getAttestData, {
    onSuccess: (data) => {},
    onError: (error: any) => {},
  });

  useEffect(() => {
    if (attestationMutation?.data?.length > 0) {
      const attestationObj = { ...attestationMutation?.data[0] };
      state.attestatioDtl = attestationObj;
    }
  }, [attestationMutation?.data?.length]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getTabsDetail",
        {
          ENTITY_TYPE: state?.entityTypectx,
          CATEGORY_CD: state?.categoryValuectx,
          CONS_TYPE: state?.constitutionValuectx,
          CONFIRMFLAG: state?.confirmFlagctx,
        },
      ]);
    };
  }, []);
  const onSubmitHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    let req = {
      ...data,
      ...utilFunction.transformDetailsData(
        data,
        optional?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
      ),
    };
    handleFormDataonSavectxNew({
      PERSONAL_DETAIL_HEADER_FORM: Boolean(
        Object?.keys(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {})
          ?.length > 0
      )
        ? req
        : data,
    });
    endSubmit(true);
  };

  useEffect(() => {
    modifiedFormCols.current = state?.modifiedFormCols;
  }, [state?.modifiedFormCols]);

  useImperativeHandle(ref, () => ({
    handleSubmit: childRef.current.handleSubmit,
  }));

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          boxShadow: "none",
          zIndex: "1",
        }}
      >
        <FormWrapper
          key={
            `CustIdHeaderForm` +
            personalDtl?.CUSTOMER_ID +
            personalDtl?.REQUEST_CD +
            state?.entityTypectx +
            state?.accTypeValuectx +
            state?.categoryValuectx
          }
          metaData={
            isModal
              ? (extractMetaData(
                  HeaderFormMetadata,
                  state?.formmodectx
                ) as MetaDataType)
              : (CustHeaderFormMetadata(state) as MetaDataType)
          }
          initialValues={
            {
              // ...personalDtl,
              CUSTOMER_ID: personalDtl?.CUSTOMER_ID ?? "",
              REQ_CD: personalDtl?.REQ_CD ?? "",
              KYC_NUMBER: personalDtl?.KYC_NUMBER ?? "",
              ACTIVE_FLAG_F: personalDtl?.ACTIVE_FLAG ?? false,
              ACTIVE_FLAG: isModal ? undefined : personalDtl?.ACTIVE_FLAG,
              INACTIVE_DT: personalDtl?.INACTIVE_DT ?? "",
              ACCT_TYPE: state?.accTypeValuectx
                ? state?.accTypeValuectx
                : personalDtl?.ACCT_TYPE
                ? personalDtl?.ACCT_TYPE
                : "",
              CATEG_CD: state?.categoryValuectx
                ? state?.categoryValuectx
                : personalDtl?.CATEG_CD
                ? personalDtl?.CATEG_CD
                : "",
            } as InitialValuesType
          }
          onSubmitHandler={onSubmitHandler}
          formState={{
            state,
            authState,
            handleCategoryChangectx,
            handleAccTypeVal,
            MessageBox,
            setDependecyDialogOpen,
          }}
          ref={childRef}
          hideHeader={true}
          formStyle={{
            height: "auto",
          }}
          onFormButtonClickHandel={(id) => {
            if (id === "UPD_CATEG") {
              setChangeCategDialog(true);
            }
          }}
        />
        {isLoading || isFetching ? <LinearProgress color="secondary" /> : null}
        {(isError || attestationMutation?.isError) && (
          <Alert
            severity="error"
            errorMsg={
              error?.error_msg ||
              attestationMutation?.error?.error_msg ||
              t("Somethingwenttowrong")
            }
            errorDetail={
              (error?.error_detail ||
                attestationMutation?.error?.error_detail) ??
              ""
            }
            color="error"
          />
        )}
      </AppBar>
      {changeCategDialog && (
        <CategoryUpdate
          open={changeCategDialog}
          setChangeCategDialog={setChangeCategDialog}
          isModal={isModal}
        />
      )}
      {dependecyDialogOpen && (
        <Dependencies
          rowsData={data}
          open={dependecyDialogOpen}
          screenRef={docCD}
          onClose={() => {
            setDependecyDialogOpen(false);
          }}
        />
      )}
    </>
  );
});

export default HeaderFormNew;
