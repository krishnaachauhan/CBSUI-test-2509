import {
  FormWrapper,
  MetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
import React, { forwardRef, useEffect } from "react";
import { CashRemiRecMetaData } from "./parameterMetaData";
import { useLocation } from "react-router-dom";
import EnfinityLoader from "components/common/loader/EnfinityLoader";
import { Box } from "@mui/system";

interface CashRemiReciFormProps {
  authState: any;
  formMutate: any;
  formData: any;
  formIsLoading: any;
  openCodeDialog: any;
}

const CashRemiReciForm = forwardRef<HTMLDivElement, CashRemiReciFormProps>(
  (
    { authState, formMutate, formData, formIsLoading, openCodeDialog },
    ref: any
  ) => {
    useEffect(() => {
      if (ref.current?.TRAN_CD) {
        formMutate({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState.user?.branchCode,
          ADT_TRAN_DT: authState?.workingDate,
          TRAN_CD: ref?.current?.TRAN_CD, // Fill or update this with actual transaction code logic
        });
      }
    }, [ref.current?.TRAN_CD]);

    CashRemiRecMetaData.form.label = utilFunction.getDynamicLabel(
      useLocation().pathname,
      authState?.menulistdata,
      true
    );
    return (
      <Box sx={{ position: "relative" }}>
        <EnfinityLoader loading={formIsLoading} />
        <FormWrapper
          key={"actionsForm" + formData}
          metaData={CashRemiRecMetaData as MetaDataType}
          onSubmitHandler={() => {}}
          formStyle={{
            background: "white",
          }}
          initialValues={openCodeDialog ? {} : formData?.[0]}
        />
      </Box>
    );
  }
);

export { CashRemiReciForm };
