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
  extractMetaData,
  utilFunction,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog } from "@mui/material";
import {
  securityBtnBFDMetadata,
  securityBtnLICMetadata,
  securityBtnOTHMetadata,
  securityBtnSHMetadata,
  securityBtnSTKMetadata,
  securityBtnVEHMetadata,
} from "../buttonMetadata/securityBtnMetadata";
import { useMutation } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { AcctMSTContext } from "../AcctMSTContext";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

export const OtherSecurityButton = ({
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
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const {
    AcctMSTState,
    handleColBtnData,
    handleRetrieveColBtnData,
    floatedValue,
  } = useContext(AcctMSTContext);

  let metaData: any;
  let initialValue;

  const getDefaultSecurityValue = () => ({
    SR_CD: "",
  });

  switch (optionData) {
    case "OTH":
    case "GOV":
      metaData = securityBtnOTHMetadata as MetaDataType;
      initialValue =
        Array.isArray(AcctMSTState?.retrievecolBtnDatactx) &&
        AcctMSTState?.retrievecolBtnDatactx[formIndex]?.OTHER_SECURITY_TYPE
          ?.length > 0
          ? {
              SECURITY_OTH:
                AcctMSTState.retrievecolBtnDatactx[formIndex]
                  .OTHER_SECURITY_TYPE,
            }
          : otherSecurityData?.length > 0
          ? {
              SECURITY_OTH: [...otherSecurityData],
            }
          : {
              SECURITY_OTH: [getDefaultSecurityValue()],
            };
      break;

    case "BFD":
    case "BRD":
      metaData = securityBtnBFDMetadata as MetaDataType;
      initialValue =
        Array.isArray(AcctMSTState?.retrievecolBtnDatactx) &&
        AcctMSTState?.retrievecolBtnDatactx[formIndex]?.OTHER_SECURITY_TYPE
          ?.length > 0
          ? {
              SECURITY_BFD:
                AcctMSTState.retrievecolBtnDatactx[formIndex]
                  .OTHER_SECURITY_TYPE,
            }
          : otherSecurityData?.length > 0
          ? {
              SECURITY_BFD: [...otherSecurityData],
            }
          : {
              SECURITY_BFD: [getDefaultSecurityValue()],
            };
      break;

    case "VEH":
      metaData = securityBtnVEHMetadata as MetaDataType;
      initialValue =
        Array.isArray(AcctMSTState?.retrievecolBtnDatactx) &&
        AcctMSTState?.retrievecolBtnDatactx[formIndex]?.OTHER_SECURITY_TYPE
          ?.length > 0
          ? {
              SECURITY_VEH:
                AcctMSTState.retrievecolBtnDatactx[formIndex]
                  .OTHER_SECURITY_TYPE,
            }
          : otherSecurityData?.length > 0
          ? {
              SECURITY_VEH: [...otherSecurityData],
            }
          : {
              SECURITY_VEH: [getDefaultSecurityValue()],
            };
      break;

    case "STK":
    case "BDC":
      metaData = securityBtnSTKMetadata as MetaDataType;
      initialValue =
        Array.isArray(AcctMSTState?.retrievecolBtnDatactx) &&
        AcctMSTState?.retrievecolBtnDatactx[formIndex]?.OTHER_SECURITY_TYPE
          ?.length > 0
          ? {
              SECURITY_STK:
                AcctMSTState.retrievecolBtnDatactx[formIndex]
                  .OTHER_SECURITY_TYPE,
            }
          : otherSecurityData?.length > 0
          ? {
              SECURITY_STK: [...otherSecurityData],
            }
          : {
              SECURITY_STK: [getDefaultSecurityValue()],
            };
      break;

    case "SH":
      metaData = securityBtnSHMetadata as MetaDataType;
      initialValue =
        Array.isArray(AcctMSTState?.retrievecolBtnDatactx) &&
        AcctMSTState?.retrievecolBtnDatactx[formIndex]?.OTHER_SECURITY_TYPE
          ?.length > 0
          ? {
              SECURITY_SH:
                AcctMSTState.retrievecolBtnDatactx[formIndex]
                  .OTHER_SECURITY_TYPE,
            }
          : otherSecurityData?.length > 0
          ? {
              SECURITY_SH: [...otherSecurityData],
            }
          : {
              SECURITY_SH: [getDefaultSecurityValue()],
            };
      break;

    case "LIC":
      metaData = securityBtnLICMetadata as MetaDataType;
      initialValue =
        Array.isArray(AcctMSTState?.retrievecolBtnDatactx) &&
        AcctMSTState?.retrievecolBtnDatactx[formIndex]?.OTHER_SECURITY_TYPE
          ?.length > 0
          ? {
              SECURITY_LIC:
                AcctMSTState.retrievecolBtnDatactx[formIndex]
                  .OTHER_SECURITY_TYPE,
            }
          : otherSecurityData?.length > 0
          ? {
              SECURITY_LIC: [...otherSecurityData],
            }
          : {
              SECURITY_LIC: [getDefaultSecurityValue()],
            };
      break;
    default:
      break;
  }
  const formRef = useRef<any>(null);
  const handleSave = async (e, btnFlag) => {
    const refs = await Promise.all([
      formRef.current.handleSubmit(e, "Save", false, AcctMSTState),
    ]);
  };
  const securityFieldKey = useMemo(() => {
    return metaData?.fields?.find(
      (f) => f?.render?.componentType === "arrayField"
    )?.name;
  }, [metaData]);
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action,
    hasError,
    option
  ) => {
    // Ensure array has enough space for the index
    while (colBtnData?.length <= formIndex) {
      colBtnData?.push({});
    }

    if (!colBtnData[formIndex]) {
      colBtnData[formIndex] = {};
    }

    colBtnData[formIndex] = {
      ...colBtnData[formIndex],
      OTHER_SECURITY_TYPE: data[securityFieldKey],
    };
    handleRetrieveColBtnData([...colBtnData]);

    let newFormatData = data[securityFieldKey]?.map((formRow, i) => {
      const formData = data[securityFieldKey][i];
      const allFields = Object?.keys(formData);
      const dateFields: string[] = [
        "ISSUE_DATE",
        "EXP_DATE",
        "PERMIT_START_DT",
        "PERMIT_EXPIRY_DT",
        "PURCHASE_DT",
        "MFG_DATE",
        "VALUATION_DT",
        "SEC_EXEC_DATE",
        "SENT_DATE",
        "REFUND_DATE",
        "MATURITY_DATE",
        "ENCASHMENT_DATE",
        "COMMENCEMENT_DATE",
      ];
      const checkBoxFields: string[] = ["ACTIVE", "ALWAYSAVAILABLE"];
      floatedValue(
        [
          "COLLATERAL_AMT",
          "MATURED_AMT",
          "ELIGIBLE_VALUE",
          "TOTAL_VALUE",
          "PURCHASE_AMT",
          "ELIGIBLE_AMT",
          "VALUE_AMT",
          "ABSOLUTE_STOCK",
          "ACTUAL_VALUE",
          "CREDITOR",
          "STOCK_VALUE",
          "DRAWING_POWER",
          "REF_AMT",
          "ASSURED_SUM",
          "PREMIUM_AMT",
          "SURRENDER_VALUE",
          "MARGIN",
          "ACC_INT",
          "COLLATERAL_RATE",
        ],
        formData
      );
      allFields?.forEach((field) => {
        if (dateFields.includes(field)) {
          formData[field] = Boolean(formData[field])
            ? format(
                utilFunction?.getParsedDate(formData[field]),
                "dd-MMM-yyyy"
              )
            : "";
        }
      });
      allFields?.forEach((field) => {
        if (checkBoxFields?.includes(field)) {
          formData[field] = Boolean(formData[field]) ? "Y" : "N";
        }
      });
      return {
        ...formData,
      };
    });
    let oldData =
      option?.colOldBtnDatactx[formIndex]?.OTHER_SECURITY_TYPE ?? [];
    let maxSRCD =
      oldData?.reduce((max, item) => {
        const srCdNum = parseInt(item.LINE_ID, 10);
        return !isNaN(srCdNum) && srCdNum > max ? srCdNum : max;
      }, 0) ?? 0;
    newFormatData?.forEach((item) => {
      if (!item.LINE_ID || item.LINE_ID === "") {
        maxSRCD += 1;
        item.LINE_ID = String(maxSRCD);
      }
    });
    const transformed2 = utilFunction?.transformDetailDataForDML(
      oldData,
      newFormatData,
      ["LINE_ID"]
    );
    const TemplateData = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: AcctMSTState?.rowBranchCodectx
        ? AcctMSTState?.rowBranchCodectx
        : authState?.user?.branchCode ?? "",
      ACCT_TYPE: AcctMSTState?.accTypeValuectx,
      ACCT_CD: AcctMSTState?.acctNumberctx,
      LIEN_COMP_CD: authState?.companyID ?? "",
      LIEN_BANCH_CD: AcctMSTState?.rowBranchCodectx
        ? AcctMSTState?.rowBranchCodectx
        : authState?.user?.branchCode ?? "",
      LIEN_ACCT_TYPE: AcctMSTState?.accTypeValuectx,
      LIEN_ACCT_CD: AcctMSTState?.acctNumberctx,
      REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
      REQ_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
      SAVE_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
      SR_CD: String(parseInt(formIndex) + 1), // Ensure SR_CD matches the array index
    };
    if (AcctMSTState?.formmodectx === "new") {
      const mergeData = newFormatData?.map((item) => ({
        ...item,
        ...TemplateData,
        IsNewRow: true,
      }));
      savecolBtnData[formIndex] = {
        ...savecolBtnData[formIndex],
        OTHER_SECURITY_TYPE: mergeData,
      };
      handleColBtnData([...savecolBtnData]);
      closeDialog();
    } else {
      const mergeRows = (rows, templateData, IsNewRow) => {
        return rows?.map((val) => ({
          ...val,
          ...templateData,
          IsNewRow: IsNewRow,
        }));
      };

      transformed2["isNewRow"] = mergeRows(
        transformed2?.isNewRow?.map((val) => {
          if (val.TRAN_CD) {
            return val;
          }
          const { TRAN_CD, ...rest } = val;
          return rest;
        }),
        TemplateData,
        true
      );
      transformed2["isUpdatedRow"] = mergeRows(
        transformed2?.isUpdatedRow,
        TemplateData,
        false
      );
      transformed2["isDeleteRow"] = mergeRows(
        transformed2?.isDeleteRow,
        TemplateData,
        false
      );
      const checkForDataInRows = (rows) => {
        return rows?.some((row) => row && Object?.keys(row)?.length > 0);
      };
      if (
        checkForDataInRows(transformed2?.isNewRow) ||
        checkForDataInRows(transformed2?.isUpdatedRow) ||
        checkForDataInRows(transformed2?.isDeleteRow)
      ) {
        savecolBtnData[formIndex] = {
          ...savecolBtnData[formIndex],
          OTHER_SECURITY_TYPE: transformed2,
        };
        handleColBtnData([...savecolBtnData]);
      } else {
        handleColBtnData([]);
      }
      closeDialog();
    }
    endSubmit(true);
  };

  if (metaData?.form) {
    const securityLabel = isData?.securityCode?.optionData?.[0]?.label ?? "";
    const sanctionedLimit =
      AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL?.SANCTIONED_AMT ?? "";
    metaData.form.label = `${t("PrimeSecurityDetail")}: ${securityLabel} ${t(
      "SanctionedLimit"
    )}: ${sanctionedLimit}`;
  } else {
    metaData.form.label = "PrimeSecurityDetail";
  }

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
          key={"MachineryDetailsMetadata" + securityFieldKey}
          metaData={
            extractMetaData(metaData, AcctMSTState?.formmodectx) as MetaDataType
          }
          onSubmitHandler={onSubmitHandler}
          initialValues={{ ...initialValue }}
          formStyle={{
            background: "white",
          }}
          ref={formRef}
          formState={{
            MessageBox: MessageBox,
            isData: isData,
            authState: authState,
            formMode: AcctMSTState?.formmodectx,
            initialVal: initialValue,
            MarginDefaultValue:
              isData?.securityCode?.optionData?.[0]?.LIMIT_MARGIN,
            docCD: docCD,
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
