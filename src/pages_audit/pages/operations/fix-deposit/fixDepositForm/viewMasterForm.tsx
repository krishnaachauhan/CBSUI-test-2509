import { Dialog, Paper } from "@mui/material";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { ViewMasterMetadata } from "./metaData/viewMasterMetaData";
import { useQuery } from "react-query";
import * as API from "../api";
import {
  LoaderPaperComponent,
  Alert,
  GradientButton,
  queryClient,
  InitialValuesType,
  FormWrapper,
  MetaDataType,
  extractMetaData,
} from "@acuteinfo/common-base";
import { cloneDeep } from "lodash";

interface ViewMasterFormProps {
  handleDialogClose: any;
  requestData?: any;
}
export const ViewMasterForm: React.FC<ViewMasterFormProps> = ({
  handleDialogClose,
  requestData,
}) => {
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();

  //Api for get View master detail form data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getFDViewMasterDtl"], () =>
    API.getFDViewMasterDtl({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: requestData.BRANCH_CD ?? "",
      ACCT_TYPE: requestData?.ACCT_TYPE ?? "",
      ACCT_CD: requestData?.ACCT_CD ?? "",
      A_ASON_DT: authState?.workingDate ?? "",
      TDS_METHOD: requestData?.TDS_METHOD ?? "",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getFDViewMasterDtl"]);
    };
  }, []);

  // Set the header title for the grid, dynamically generating it based on account details
  const memoizedMetadata = useMemo(() => {
    const cloned = cloneDeep(ViewMasterMetadata);
    cloned.form.label = `View Master of A/c No.: ${
      requestData?.BRANCH_CD?.trim() ?? ""
    }-${requestData?.ACCT_TYPE?.trim() ?? ""}-${
      requestData?.ACCT_CD?.trim() ?? ""
    } ${requestData?.ACCT_NM?.trim() ?? ""}`;
    return cloned;
  }, [requestData?.BRANCH_CD, requestData?.ACCT_TYPE, requestData?.ACCT_CD]);

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          width: "100%",
        },
      }}
      maxWidth="lg"
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          handleDialogClose();
        }
      }}
      className="fdCommDlg"
    >
      {error && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      {isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <FormWrapper
          key={"ViewMasterForm"}
          metaData={extractMetaData(memoizedMetadata, "view") as MetaDataType}
          initialValues={
            {
              ...data?.[0],
              FORM_60:
                data?.[0]?.FORM_60 === "Y"
                  ? t("FORM60Submitted")
                  : data?.[0]?.FORM_60 === "F"
                  ? t("FORM61Submitted")
                  : data?.[0]?.FORM_60 === "N"
                  ? "N"
                  : "",
              CATEGORY_VAL: `${
                data?.[0]?.CATEG_CD ? data?.[0]?.CATEG_CD?.trim() : ""
              } - ${data?.[0]?.CATEG_NM ? data?.[0]?.CATEG_NM?.trim() : ""}`,
              MODE_VAL: `${
                data?.[0]?.ACCT_MODE ? data?.[0]?.ACCT_MODE?.trim() : ""
              } - ${data?.[0]?.MODE_NM ? data?.[0]?.MODE_NM?.trim() : ""}`,
              BRANCH_VAL: `${
                data?.[0]?.BRANCH_CD ? data?.[0]?.BRANCH_CD?.trim() : ""
              } - ${data?.[0]?.BRANCH_NM ? data?.[0]?.BRANCH_NM?.trim() : ""}`,
              ACCT_TYPE_VAL: `${
                data?.[0]?.ACCT_TYPE ? data?.[0]?.ACCT_TYPE?.trim() : ""
              } - ${data?.[0]?.TYPE_NM ? data?.[0]?.TYPE_NM?.trim() : ""}`,
            } as InitialValuesType
          }
          onSubmitHandler={() => {}}
          displayMode={"view"}
          formStyle={{
            background: "white",
          }}
        >
          <GradientButton onClick={() => handleDialogClose()}>
            {t("Close")}
          </GradientButton>
        </FormWrapper>
      )}
    </Dialog>
  );
};
