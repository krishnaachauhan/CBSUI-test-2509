import { forwardRef, useContext, useEffect, useMemo, useState } from "react";
import { PayslipAndDDFormMetaData } from "./metaData/payslipAndDDMetaData";
import {
  InitialValuesType,
  extractMetaData,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  GradientButton,
} from "@acuteinfo/common-base";
import { CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCommonFunctions } from "../../fix-deposit/function";
import { cloneDeep } from "lodash";

export const PayslipAndDDForm = forwardRef<any, any>(
  (
    {
      defaultView,
      accountDetailsForPayslip,
      onSubmitHandler,
      handleDialogClose,
      hideHeader,
      handleDisableButton,
    },
    ref: any
  ) => {
    const { MessageBox } = usePopupContext();
    const [formMode, setFormMode] = useState(defaultView);
    const { t } = useTranslation();
    const { showMessageBox } = useCommonFunctions();

    //Form Header title
    const clonedMetaData = useMemo(() => {
      const cloned = cloneDeep(PayslipAndDDFormMetaData);
      cloned.form.label = `${
        accountDetailsForPayslip?.SCREEN_NAME ?? ""
      } for A/C No.:\u00A0${
        accountDetailsForPayslip?.BRANCH_CD?.trim() ?? ""
      }-${accountDetailsForPayslip?.ACCT_TYPE.trim() ?? ""}-${
        accountDetailsForPayslip?.ACCT_CD.trim() ?? ""
      } `;
      return cloned;
    }, [
      accountDetailsForPayslip?.SCREEN_NAME,
      accountDetailsForPayslip?.BRANCH_CD,
      accountDetailsForPayslip?.ACCT_TYPE,
      accountDetailsForPayslip?.ACCT_CD,
      t,
    ]);

    return (
      <>
        <FormWrapper
          key={"payslipAndDDForm" + accountDetailsForPayslip}
          metaData={
            extractMetaData(clonedMetaData, defaultView) as MetaDataType
          }
          hideHeader={hideHeader ?? true}
          initialValues={{ ...accountDetailsForPayslip } as InitialValuesType}
          onSubmitHandler={onSubmitHandler}
          ref={ref}
          formState={{
            MessageBox: MessageBox,
            accountDetailsForPayslip: accountDetailsForPayslip,
            showMessageBox: showMessageBox,
            handleDisableButton,
          }}
          formStyle={{
            background: "white",
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              {formMode === "edit" ? (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting}
                    endIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setFormMode("view");
                    }}
                    color={"primary"}
                  >
                    {t("Cancel")}
                  </GradientButton>
                </>
              ) : formMode === "new" ? (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting}
                    endIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>

                  <GradientButton onClick={handleDialogClose} color={"primary"}>
                    {t("Close")}
                  </GradientButton>
                </>
              ) : (
                <>
                  <GradientButton
                    onClick={() => {
                      setFormMode("edit");
                    }}
                    color={"primary"}
                  >
                    {t("Edit")}
                  </GradientButton>
                  <GradientButton onClick={handleDialogClose} color={"primary"}>
                    {t("Close")}
                  </GradientButton>
                </>
              )}
            </>
          )}
        </FormWrapper>
      </>
    );
  }
);
