import {
  FormWrapper,
  GradientButton,
  InitialValuesType,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Dialog } from "@mui/material";
import { t } from "i18next";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";

export const AsPerQuery = ({
  open,
  handleClose,
  loginState,
  retrievalParaValues,
  defaultData,
  retrievalType,
  metaData,
}) => {
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const submitFormRef = useRef<any>(null);
  const [formaData, setFormData] = useState<any>(metaData);

  useEffect(() => {
    if (metaData?.fields?.length) {
      const updatedFields: any = [];

      metaData.fields.forEach((item) => {
        let updated: any = { ...item };

        if (typeof item?.validate === "string") {
          updated.validate = new Function(
            "currentField",
            "dependentField",
            "formState",
            item.validate
          );
          // continue → move to next condition
        }

        if (typeof item?.shouldExclude === "string") {
          updated.shouldExclude = new Function(
            "currentField",
            "dependentField",
            "formState",
            item.shouldExclude
          );
          // continue
        }

        if (typeof item?.postValidationSetCrossFieldValues === "string") {
          updated.postValidationSetCrossFieldValues = new Function(
            "currentField",
            "formState",
            "authState",
            "dependentField",
            item.postValidationSetCrossFieldValues
          );
          // continue
        }

        if (typeof item?.setFieldLabel === "string") {
          updated.setFieldLabel = new Function(
            "dependentField",
            "currentField",
            item.setFieldLabel
          );
          // continue
        }

        updatedFields.push(updated);
      });

      setFormData({ ...metaData, fields: updatedFields });
    }
  }, [metaData]);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit
  ) => {
    if (data) {
      let colomnKeyLabel = metaData?.fields.reduce((acc, curr) => {
        acc[curr.name] = curr.label;
        return acc;
      }, {});

      const visibleInRetrievalKeys = {};
      metaData?.fields?.forEach(({ name, visibleInRetrieval }) => {
        visibleInRetrievalKeys[name] = visibleInRetrieval ?? true;
      });

      const retrievalValues = Object.entries(data)
        .sort()
        .map((key: any, val) => {
          const rawValue = key?.[1];

          const formattedValue =
            metaData?.fields?.find((f) => f.name === key?.[0])?.render
              ?.componentType === "datePicker"
              ? format(new Date(rawValue ?? new Date()), "dd/MMM/yyyy")
              : typeof rawValue === "boolean"
              ? rawValue
                ? "Y"
                : "N"
              : rawValue;

          return {
            id: key?.[0],
            value: {
              condition: "equal",
              value: formattedValue,
              // columnName: key?.[0],
              columnName: t(colomnKeyLabel[key?.[0]]) ?? "",
              visibleInRetrieval: visibleInRetrievalKeys[key?.[0]],
            },
          };
        });

      retrievalParaValues(retrievalValues, data);

      endSubmit(true);
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        style: {
          maxWidth: "860px",
        },
      }}
      fullWidth={true}
      onKeyUp={(e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      }}
    >
      <FormWrapper
        key={"retrieve-compo-asperquery"}
        metaData={formaData as MetaDataType}
        formStyle={{
          background: "white",
        }}
        initialValues={{} as InitialValuesType}
        controlsAtBottom={true}
        onSubmitHandler={onSubmitHandler}
        formState={{
          MessageBox: MessageBox,
          docCD: docCD,
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        ref={submitFormRef}
      >
        {({ isSubmitting, handleSubmit }) => (
          <Box
            sx={{
              width: "100%",
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <GradientButton
              onClick={handleSubmit}
              disabled={isSubmitting}
              color={"primary"}
              endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton onClick={handleClose}>{t("Close")}</GradientButton>
          </Box>
        )}
      </FormWrapper>
    </Dialog>
  );
};
