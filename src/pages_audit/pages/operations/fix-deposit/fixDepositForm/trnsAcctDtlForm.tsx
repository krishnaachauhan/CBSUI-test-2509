import {
  Fragment,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { cloneDeep } from "lodash";
import {
  RenewTransferMetadata,
  TransferAcctDetailFormMetadata,
} from "./metaData/trnsAcctDtlMetaData";
import {
  usePopupContext,
  InitialValuesType,
  FormWrapper,
  MetaDataType,
  GradientButton,
} from "@acuteinfo/common-base";
import { FDContext } from "../context/fdContext";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../function";

export const TransferAcctDetailForm = forwardRef<any, any>(
  (
    {
      onSubmitHandler,
      screenFlag,
      handleCloseTrnsferForm,
      openRenewTrnsForm,
      openTrnsForm,
      renewTrnsVal,
      handleDisableButton,
    },
    ref: any
  ) => {
    const { authState } = useContext(AuthContext);
    const { FDState } = useContext(FDContext);
    const { MessageBox, CloseMessageBox } = usePopupContext();
    const { t } = useTranslation();
    const { state: rows }: any = useLocation();
    let currentPath = useLocation().pathname;
    const docCD = getdocCD(currentPath, authState?.menulistdata);
    const { showMessageBox } = useCommonFunctions();

    let totalFDAmt = 0;

    if (
      Array.isArray(FDState?.fdDetailArrayFGridData) &&
      FDState.fdDetailArrayFGridData.length > 0
    ) {
      totalFDAmt = FDState.fdDetailArrayFGridData.reduce(
        (accum, obj) => accum + Number(obj?.TRSF_AMT || 0),
        0
      );
    } else {
      totalFDAmt = Number(FDState?.savedFormFieldData?.TRSF_AMT || 0);
    }

    let totalFDAmtTrns =
      Number(renewTrnsVal) > 0
        ? Number(renewTrnsVal)
        : (!Boolean(renewTrnsVal) || Number(renewTrnsVal) === 0) &&
          Boolean(openTrnsForm)
        ? FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM
        : totalFDAmt;

    const configuredMetadata = useMemo(() => {
      const clonedMetadata = cloneDeep(TransferAcctDetailFormMetadata);

      // Helper functions to find fields by name instead of using indices
      const findFieldByName = (fields: any[], name: string) => {
        return fields.find((field) => field.name === name);
      };

      const findSubFieldByName = (arrayField: any, name: string) => {
        if (!arrayField?._fields) return null;
        return arrayField._fields.find((field: any) => field.name === name);
      };

      const findSubFieldByComponentType = (
        arrayField: any,
        componentType: string
      ) => {
        if (!arrayField?._fields) return null;
        return arrayField._fields.find(
          (field: any) => field.render?.componentType === componentType
        );
      };

      // Find fields by name
      const trndtlsField = findFieldByName(clonedMetadata.fields, "TRNDTLS");
      const totalFdAmountField = findFieldByName(
        clonedMetadata.fields,
        "TOTAL_FD_AMOUNT"
      );
      const totalDrAmountField = findFieldByName(
        clonedMetadata.fields,
        "TOTAL_DR_AMOUNT"
      );

      // Find subfields within TRNDTLS array
      const accountNumberField = findSubFieldByComponentType(
        trndtlsField,
        "_accountNumber"
      ); // Find by component type instead of name
      const accountNameField = findSubFieldByName(trndtlsField, "ACCT_NM");
      const balanceField = findSubFieldByName(trndtlsField, "WIDTH_BAL");
      const amountField = findSubFieldByName(trndtlsField, "AMOUNT");

      if (
        trndtlsField &&
        accountNumberField &&
        accountNameField &&
        balanceField &&
        amountField &&
        totalFdAmountField &&
        totalDrAmountField &&
        accountNumberField.accountCodeMetadata
      ) {
        if (screenFlag === "paymentTransfer") {
          accountNumberField.branchCodeMetadata.GridProps = {
            xs: 12,
            sm: 4,
            md: 4,
            lg: 1.5,
            xl: 1.5,
          };
          accountNumberField.accountTypeMetadata.GridProps = {
            xs: 12,
            sm: 4,
            md: 4,
            lg: 1.5,
            xl: 1.5,
          };
          accountNumberField.accountCodeMetadata.GridProps = {
            xs: 12,
            sm: 4,
            md: 4,
            lg: 1.5,
            xl: 1.5,
          };
          accountNameField.GridProps = {
            xs: 12,
            sm: 6,
            md: 6,
            lg: 3.5,
            xl: 3.5,
          };
          balanceField.GridProps = {
            xs: 12,
            sm: 3,
            md: 3,
            lg: 2,
            xl: 2,
          };
          amountField.GridProps = {
            xs: 12,
            sm: 3,
            md: 3,
            lg: 2,
            xl: 2,
          };
          amountField.label = t("CreditAmount");
          totalDrAmountField.label = t("TotalCreditAmount");
          clonedMetadata.form.label = `A/c No.: ${
            rows?.[0]?.data?.BRANCH_CD?.trim() ?? ""
          }-${rows?.[0]?.data?.ACCT_TYPE?.trim() ?? ""}-${
            rows?.[0]?.data?.ACCT_CD?.trim() ?? ""
          } ${
            FDState?.retrieveFormData?.ACCT_NM?.trim() ?? ""
          }\u00A0\u00A0\u00A0\u00A0FD No.: ${rows?.[0]?.data?.FD_NO}`;
        } else {
          accountNumberField.branchCodeMetadata.GridProps = {
            xs: 12,
            sm: 2.5,
            md: 2.5,
            lg: 2.5,
            xl: 1.3,
          };
          accountNumberField.accountTypeMetadata.GridProps = {
            xs: 12,
            sm: 2.5,
            md: 2.5,
            lg: 2.5,
            xl: 1.3,
          };
          accountNumberField.accountCodeMetadata.GridProps = {
            xs: 12,
            sm: 2.5,
            md: 2.5,
            lg: 2.5,
            xl: 1.3,
          };
          accountNameField.GridProps = {
            xs: 12,
            sm: 4.5,
            md: 4.5,
            lg: 4.5,
            xl: 2.6,
          };
          balanceField.GridProps = {
            xs: 12,
            sm: 3,
            md: 3,
            lg: 3,
            xl: 1.5,
          };
          amountField.GridProps = {
            xs: 12,
            sm: 3,
            md: 3,
            lg: 3,
            xl: 1.5,
          };
          amountField.label = t("DebitAmount");
          totalDrAmountField.label = t("TotalDebitAmount");
          clonedMetadata.form.label = `A/c No.: ${
            FDState?.retrieveFormData?.BRANCH_CD?.trim() ?? ""
          }-${FDState?.retrieveFormData?.ACCT_TYPE?.trim() ?? ""}-${
            FDState?.retrieveFormData?.ACCT_CD?.trim() ?? ""
          } ${
            FDState?.retrieveFormData?.ACCT_NM?.trim() ?? ""
          }\u00A0\u00A0\u00A0\u00A0FD No.: ${rows?.[0]?.data?.FD_NO}`;
        }
      }

      return clonedMetadata;
    }, [
      screenFlag,
      t,
      rows,
      FDState?.retrieveFormData?.BRANCH_CD,
      FDState?.retrieveFormData?.ACCT_TYPE,
      FDState?.retrieveFormData?.ACCT_CD,
      FDState?.retrieveFormData?.ACCT_NM,
    ]);

    return (
      <Fragment>
        {Boolean(openRenewTrnsForm) ? (
          <FormWrapper
            key={"renewTransferForm" + FDState}
            metaData={RenewTransferMetadata as MetaDataType}
            onSubmitHandler={onSubmitHandler}
            formStyle={{
              background: "white",
            }}
            initialValues={
              {
                ...FDState?.renewTrnsFormData,
                CR_COMP_CD: authState?.companyID ?? "",
              } as InitialValuesType
            }
            ref={ref}
            formState={{
              MessageBox: MessageBox,
            }}
          />
        ) : (
          <FormWrapper
            key={
              "TransferAcctDetail" +
              FDState?.sourceAcctFormData?.TRNDTLS?.length +
              screenFlag +
              totalFDAmtTrns
            }
            metaData={configuredMetadata as MetaDataType}
            initialValues={
              {
                ...FDState?.sourceAcctFormData,
                TOTAL_FD_AMOUNT: totalFDAmtTrns,
                CR_COMP_CD: authState?.companyID ?? "",
              } as InitialValuesType
            }
            onSubmitHandler={onSubmitHandler}
            hideHeader={true}
            formStyle={{
              background: "white",
              padding: "5px",
              border: "1px solid var(--theme-color4)",
              borderRadius: "10px",
            }}
            formState={{
              MessageBox: MessageBox,
              screenFlag: screenFlag,
              docCD: "FDINSTRCRTYPE",
              screenRef: docCD ?? "",
              showMessageBox: showMessageBox,
              handleDisableButton,
              acctDtlReqPara: {
                ACCT_CD: {
                  ACCT_TYPE: "TRNDTLS.ACCT_TYPE",
                  BRANCH_CD: "TRNDTLS.BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
            ref={ref}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting}
                  endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>

                <GradientButton
                  onClick={handleCloseTrnsferForm}
                  color={"primary"}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        )}
      </Fragment>
    );
  }
);
