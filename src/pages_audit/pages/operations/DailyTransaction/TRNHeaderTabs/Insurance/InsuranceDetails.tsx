import {
  Alert,
  GradientButton,
  LoaderPaperComponent,
  MasterDetailsForm,
  MasterDetailsMetaData,
  queryClient,
} from "@acuteinfo/common-base";
import { cloneDeep } from "lodash";
import { AuthContext } from "pages_audit/auth";
import { getInsuranceEntryDetail } from "pages_audit/pages/operations/insuranceEntry/api";
import { InsuranceDetailFormMetaData } from "pages_audit/pages/operations/insuranceEntry/insuranceDetail/insuranceDetailMetadata";
import React, { useContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
type InsuranceEntryDtlCustomProps = {
  rowData?: any;
  setOpenDetail?: any;
};
export const InsuranceDetails: React.FC<InsuranceEntryDtlCustomProps> = ({
  rowData,
  setOpenDetail,
}) => {
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const {
    data: mainData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<any, any>(["getInsuranceEntryDetail", rowData?.TRAN_CD], () =>
    getInsuranceEntryDetail({
      COMP_CD: rowData?.COMP_CD ?? "",
      BRANCH_CD: rowData?.BRANCH_CD ?? "",
      ACCT_TYPE: rowData?.ACCT_TYPE ?? "",
      ACCT_CD: rowData?.ACCT_CD ?? "",
      TRAN_CD: rowData?.TRAN_CD ?? "",
      A_GD_DATE: authState?.workingDate,
    })
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getInsuranceEntryDetail", rowData?.TRAN_CD]);
    };
  }, []);

  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(InsuranceDetailFormMetaData);
    if (metadata?.masterForm) {
      metadata.masterForm.form.label = `${t("InsuranceDetailOfPolicy")} ${
        rowData?.POLICY_NO ?? ""
      } || ${rowData?.CM_RENEW ?? ""}`;
    }
    return metadata;
  }, [mainData]);

  const detailsData = mainData?.detailData.map((item) => {
    return {
      ...item,
      _isNewRow: false,
    };
  });
  return (
    <>
      {isLoading || isFetching ? (
        <LoaderPaperComponent />
      ) : (
        <>
          {isError && (
            <Alert
              severity="error"
              errorMsg={error?.error_msg ?? "Unknow Error"}
              errorDetail={error?.error_detail ?? ""}
            />
          )}
          <MasterDetailsForm
            key={"InsuranceDetailFormTRN"}
            metaData={memoizedMetadata as MasterDetailsMetaData}
            displayMode={"view"}
            initialData={{
              ...mainData?.[0],
              DETAILS_DATA: detailsData,
            }}
            onSubmitData={() => {}}
            formStyle={{
              background: "white",
              margin: "10px 0",
            }}
          >
            {({ isSubmitting, handleSubmit }) => {
              return (
                <>
                  <GradientButton
                    onClick={(event) => {
                      setOpenDetail(false);
                    }}
                    color={"primary"}
                  >
                    {t("Close")}
                  </GradientButton>
                </>
              );
            }}
          </MasterDetailsForm>
        </>
      )}
    </>
  );
};
