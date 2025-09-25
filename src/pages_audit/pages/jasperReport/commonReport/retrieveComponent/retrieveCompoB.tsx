import {
  AppBar,
  Box,
  CircularProgress,
  Dialog,
  LinearProgress,
} from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import {
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
  InitialValuesType,
  queryClient,
  Alert,
  usePopupContext,
  RetrievalParametersProps,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { retrieveCompoBMetadata } from "./Metadata/retrieveCompoBmetadata";
import { useQuery } from "react-query";
import { getDefaultValue } from "../api";
import { AuthContext } from "pages_audit/auth";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { retrieveCompoBMetadata2 } from "./Metadata/retrieveCompoBmetadata2";
import { retrieveMetaData105 } from "./Metadata/retrieveMetadata105";
import { retrieveCompoBMetadata3 } from "./Metadata/retrieveCompoBmetadata3";
import { retrieveMetaData1442 } from "./Metadata/retrieveMetadata1442";

export const RetrieveCompoB: React.FC<RetrievalParametersProps> = ({
  handleClose,
  retrievalParaValues,
}) => {
  const { t } = useTranslation();
  const submitFormRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const [isValidate, setIsValidate] = useState(false);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox } = usePopupContext();

  let metadata: any =
    docCD === "RPT/1364"
      ? retrieveCompoBMetadata
      : docCD === "RPT/1763"
      ? retrieveCompoBMetadata2
      : docCD === "RPT/1735" || docCD === "RPT/1644"
      ? retrieveCompoBMetadata3
      : docCD === "RPT/105"
      ? retrieveMetaData105
      : docCD === "RPT/1442" || docCD === "RPT/103"
      ? retrieveMetaData1442
      : {};

  let { formMetadata, dialogStyle, ...other } = metadata?.formConfig;

  const {
    data: defaultData,
    isLoading,
    isFetching,
    isError,
    error,
    isSuccess,
  } = useQuery<any, any, any>(
    ["getDefaultValue"],
    () =>
      getDefaultValue({
        GD_DATE: authState?.workingDate,
        API_URL: metadata?.defaultApiUrl,
      }),
    {
      enabled:
        typeof metadata?.defaultApiUrl === "string" &&
        metadata?.defaultApiUrl?.trim() !== "",
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDefaultValue"]);
    };
  }, []);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit
  ) => {
    endSubmit(true);
    let colomnKeyLabel = formMetadata?.fields.reduce((acc, curr) => {
      acc[curr.name] = curr.label;
      return acc;
    }, {});

    let visibleRetrieval = formMetadata?.fields.reduce((acc, curr) => {
      acc[curr.name] = curr.visibleInRetrieval;
      return acc;
    }, {});

    const retrievalValues = Object.entries(data)
      .sort()
      .map((key: any, val) => {
        const rawValue = key?.[1];

        const formattedValue =
          formMetadata?.fields?.find((f) => f.name === key?.[0])?.render
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
            visibleInRetrieval: visibleRetrieval[key?.[0]] ?? true,
          },
        };
      });

    retrievalParaValues(retrievalValues, data);
    handleClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && isValidate) {
        e.preventDefault();
        submitFormRef?.current?.handleSubmit(
          { preventDefault: () => {} },
          "Save"
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isValidate]);

  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          maxWidth: "685px",
        },
      }}
      fullWidth={true}
      onKeyUp={(e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      }}
      {...dialogStyle}
    >
      {isLoading || isFetching ? (
        <LinearProgress color="secondary" />
      ) : isError ? (
        <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={error?.error_msg ?? t("Unknownerroroccured")}
              errorDetail={error?.error_detail ?? ""}
              color="error"
            />
          </AppBar>
        </div>
      ) : (
        <LinearProgressBarSpacer />
      )}
      <FormWrapper
        key={"retrieveCompoBMetadata" + isSuccess}
        metaData={formMetadata as MetaDataType}
        onSubmitHandler={onSubmitHandler}
        displayMode={isLoading || isFetching ? "view" : ""}
        initialValues={
          {
            BRANCH_CD: authState?.user?.branchCode,
            ...defaultData?.[0],
          } as InitialValuesType
        }
        formState={{
          MessageBox: MessageBox,
          setIsValidate: setIsValidate,
          docCD: docCD,
        }}
        formStyle={{
          background: "white",
        }}
        ref={submitFormRef}
        controlsAtBottom={true}
        {...other}
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
            <GradientButton onClick={() => handleClose()}>
              {t("Close")}
            </GradientButton>
          </Box>
        )}
      </FormWrapper>
    </Dialog>
  );
};
