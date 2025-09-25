import {
  Alert,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
} from "@acuteinfo/common-base";
import { Dialog, IconButton } from "@mui/material";
import { getACH_OWDetail } from "./api";
import { useQuery } from "react-query";
import { useMemo } from "react";
import { cloneDeep } from "lodash";
import { ach_OW_dtlmetaData } from "./gridMetadata";
import { t } from "i18next";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

export const ACHOWDetailView = ({ isOpen, rowsData, handleClose }) => {
  const { data, isLoading, isFetching, error, isError } = useQuery<any, any>(
    ["getACH_OWDetail", { rowsData }],
    () => {
      return getACH_OWDetail({
        ENT_COMP_CD: rowsData?.ENTERED_COMP_CD ?? "",
        ENT_BRANCH_CD: rowsData?.ENTERED_BRANCH_CD ?? "",
        COMP_CD: rowsData?.COMP_CD ?? "",
        BRANCH_CD: rowsData?.BRANCH_CD ?? "",
        ACCT_TYPE: rowsData?.ACCT_TYPE ?? "",
        ACCT_CD: rowsData?.ACCT_CD ?? "",
        TRAN_CD: rowsData?.TRAN_CD ?? "",
      });
    }
  );
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(ach_OW_dtlmetaData);

    if (metadata?.form) {
      const accountData = data?.[0];
      const fullAccountNo = [
        accountData?.COMP_CD?.trim() ?? "",
        accountData?.BRANCH_CD?.trim() ?? "",
        accountData?.ACCT_TYPE?.trim() ?? "",
        accountData?.ACCT_CD?.trim() ?? "",
      ].join("");

      const umrnNo = accountData?.UMRN?.trim() ?? "";

      metadata.form.label = t("ACHIWHeader", {
        FULL_ACCOUNT_NO: fullAccountNo,
        UMRN_NO: umrnNo,
      });
    }

    return metadata;
  }, [data?.[0]]);
  return (
    <Dialog
      open={isOpen}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          handleClose();
        }
      }}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="lg"
    >
      {isLoading || isFetching ? <LoaderPaperComponent size={30} /> : null}
      {isError ? (
        <>
          <div style={{ margin: "1.2rem" }}>
            <Alert
              severity={error?.severity ?? "error"}
              errorMsg={error?.error_msg ?? "Error"}
              errorDetail={error?.error_detail ?? ""}
            />
          </div>
          {typeof handleClose === "function" ? (
            <div style={{ position: "absolute", right: 0, top: 0 }}>
              <IconButton onClick={handleClose}>
                <HighlightOffOutlinedIcon />
              </IconButton>
            </div>
          ) : null}
        </>
      ) : null}
      {!isLoading && !isFetching && !isError ? (
        <FormWrapper
          key={"ACH/OW_DtlFormData"}
          metaData={memoizedMetadata as MetaDataType}
          displayMode={"view"}
          onSubmitHandler={() => {}}
          initialValues={data?.[0] ?? {}}
          formStyle={{
            background: "white",
            margin: "10px 0",
          }}
          formState={{
            rowDetails: data?.[0],
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <GradientButton onClick={handleClose} color={"primary"}>
              {t("Close")}
            </GradientButton>
          )}
        </FormWrapper>
      ) : null}
    </Dialog>
  );
};
