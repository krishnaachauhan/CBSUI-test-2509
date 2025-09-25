import { useContext, useMemo, useRef } from "react";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  GradientButton,
  FormWrapper,
  MetaDataType,
  SubmitFnType,
  LoaderPaperComponent,
  utilFunction,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog } from "@mui/material";
import { AcctMSTContext } from "../AcctMSTContext";
import {
  MachineryDetailsMetadata,
  PropertyDetailsMetadata,
} from "../buttonMetadata/machineryDtlMetadata";
import { format } from "date-fns";

export const ColletralButton = ({
  closeDialog,
  buttonName,
  optionData,
  isLoading,
  otherSecurityData,
  isData,
  colBtnData,
  formIndex,
  savecolBtnData,
}: any) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const {
    AcctMSTState,
    handleColBtnData,
    handleRetrieveColBtnData,
    floatedValue,
  } = useContext(AcctMSTContext);
  const dateFields: string[] = ["DOCUMENT_DT", "CERSAI_REGI_DT"];
  const checkBoxFields: string[] = ["CERSAI_REGI"];
  const formatFields = (
    obj: Record<string, any> | undefined | null
  ): Record<string, any> => {
    if (!obj) return {};

    const formatted = { ...obj }; // To avoid mutating the original object (optional)

    Object?.keys(formatted)?.forEach((key) => {
      if (dateFields?.includes(key)) {
        formatted[key] = Boolean(formatted[key])
          ? format(utilFunction?.getParsedDate(formatted[key]), "dd-MMM-yyyy")
          : "";
      } else if (checkBoxFields?.includes(key)) {
        formatted[key] = Boolean(formatted[key]) ? "Y" : "N";
      }
    });

    return formatted;
  };
  const formRef = useRef<any>(null);
  const handleSave = async (e, btnFlag) => {
    const refs = await Promise.all([
      formRef.current.handleSubmit(e, "Save", false, AcctMSTState),
    ]);
  };
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action,
    hasError,
    option
  ) => {
    let buttonNames;
    if (buttonName === "PROPERTY") {
      buttonNames = "PROPERTY_DETAILS";
    } else if (buttonName === "MACHINERY") {
      buttonNames = "MACHINERY_DETAILS";
    }

    colBtnData[formIndex] = {
      ...colBtnData[formIndex],
      [buttonNames]: data,
    };
    handleRetrieveColBtnData([...colBtnData]);
    await floatedValue(["COST_AMT", "ELIGIBLE_VALUE", "MARGIN"], data);
    let newData = formatFields(data ?? {});
    let oldData = formatFields(
      option?.colOldBtnDatactx[formIndex]?.[buttonNames] ?? {}
    );
    const TemplateData = {
      ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
      ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
      BRANCH_CD: AcctMSTState?.rowBranchCodectx
        ? AcctMSTState?.rowBranchCodectx
        : authState?.user?.branchCode ?? "",
      REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
      COMP_CD: authState?.companyID ?? "",
      REQ_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
      SAVE_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
      LETTER_DP_FLAG: "N",
      DOC_VALUE: "0",
      CERSAI_REGI: newData?.CERSAI_REGI ?? "N",
    };
    const transformed3 = utilFunction?.transformDetailsData(newData, oldData);
    if (AcctMSTState?.formmodectx === "new") {
      const mergeData = {
        ...newData,
        ...TemplateData,
        IsNewRow: true,
      };
      savecolBtnData[formIndex] = {
        ...savecolBtnData[formIndex],
        [buttonNames]: mergeData,
      };
      handleColBtnData([...savecolBtnData]);
      closeDialog();
    } else {
      const finalData = {
        ...newData,
        ...(option?.colOldBtnDatactx[formIndex]?.[buttonNames] &&
          Object.keys(option?.colOldBtnDatactx[formIndex]?.[buttonNames])
            ?.length > 0 &&
          transformed3),
        ...TemplateData,
        IsNewRow: option?.colOldBtnDatactx[formIndex]?.[buttonNames]
          ? false
          : true,
      };
      savecolBtnData[formIndex] = {
        ...savecolBtnData[formIndex],
        [buttonNames]: finalData,
      };
      handleColBtnData([...savecolBtnData]);
      closeDialog();
    }
    endSubmit(true);
  };
  const initialVal = useMemo(() => {
    if (buttonName === "MACHINERY") {
      const machineryData =
        Array?.isArray(AcctMSTState?.retrievecolBtnDatactx) &&
        AcctMSTState?.retrievecolBtnDatactx[formIndex]?.MACHINERY_DETAILS;
      if (machineryData && Object?.keys(machineryData)?.length > 0) {
        return machineryData;
      } else if (
        otherSecurityData &&
        Object.keys(otherSecurityData)?.length > 0
      ) {
        return otherSecurityData?.[0];
      }
    } else if (buttonName === "PROPERTY") {
      const propertyData =
        Array?.isArray(AcctMSTState?.retrievecolBtnDatactx) &&
        AcctMSTState?.retrievecolBtnDatactx[formIndex]?.PROPERTY_DETAILS;
      if (propertyData && Object?.keys(propertyData)?.length > 0) {
        return propertyData;
      } else if (
        otherSecurityData &&
        Object?.keys(otherSecurityData)?.length > 0
      ) {
        return otherSecurityData?.[0];
      }
    }

    return {};
  }, [
    buttonName,
    AcctMSTState?.retrievecolBtnDatactx,
    formIndex,
    otherSecurityData,
  ]);
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "70%",
          overflow: "auto",
        },
      }}
      maxWidth="md"
    >
      {isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <FormWrapper
          key={
            "MachineryDetailsMetadata" + AcctMSTState?.formmodectx + initialVal
          }
          metaData={
            buttonName === "MACHINERY"
              ? (MachineryDetailsMetadata as MetaDataType)
              : (PropertyDetailsMetadata as MetaDataType)
          }
          onSubmitHandler={onSubmitHandler}
          initialValues={{ ...initialVal }}
          ref={formRef}
          formStyle={{
            background: "white",
          }}
          formState={{
            MessageBox: MessageBox,
          }}
          displayMode={AcctMSTState?.formmodectx}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              {AcctMSTState?.formmodectx !== "view" && (
                <GradientButton
                  onClick={(event) => {
                    handleSave(event, "Save");
                  }}
                  disabled={isSubmitting}
                  endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>
              )}
              <GradientButton onClick={closeDialog} color={"primary"}>
                {t("Back")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      )}
    </Dialog>
  );
};
export default ColletralButton;
