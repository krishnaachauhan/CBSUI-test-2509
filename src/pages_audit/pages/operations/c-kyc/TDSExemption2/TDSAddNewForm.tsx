import {
  extractMetaData,
  FormWrapper,
  GradientButton,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { TDSAddNewFormMetadata } from "./TDSAddNewFormMetadata";
import { t } from "i18next";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";

const TDSAddNewForm = ({
  setIsAddNewFormVisible,
  formMode,
  setGridData,
  curRow,
  custID,
  enteredFrom,
  updateMutation,
}) => {
  const { authState } = useContext(AuthContext);
  const { state } = useLocation();
  const { MessageBox } = usePopupContext();
  const reqCD = state?.[0]?.data?.REQUEST_ID ?? "";

  const initialValuesRef = useRef({});
  const [initValues, setInitValues] = useState({});
  useEffect(() => {
    if (formMode !== "new") {
      initialValuesRef.current = { TDS_ADD_NEW_ROWS: [{ ...curRow }] };
      setInitValues({ TDS_ADD_NEW_ROWS: [{ ...curRow }] });
    }
  }, [formMode, curRow]);

  const onFormSubmit = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    // console.log("data on addnewformSubmit", data, hasError);
    if (data && !hasError) {
      if (data?.TDS_ADD_NEW_ROWS && data?.TDS_ADD_NEW_ROWS?.length > 0) {
        // const rows = data?.TDS_ADD_NEW_ROWS;
        // setGridData((oldData) => {
        //   const getMaxTranCD = utilFunction?.GetMaxCdForDetails(
        //     oldData,
        //     "TRAN_CD"
        //   );
        //   const rows = data?.TDS_ADD_NEW_ROWS?.map((row, index) => ({
        //     ...row,
        //     TRAN_CD: getMaxTranCD + index,
        //   }));
        //   return [...oldData, ...rows];
        // });
        const rows = data?.TDS_ADD_NEW_ROWS.map((row) => {
          const { IsNewRow, TRAN_CD, ACTIVE, ...other } = row;
          // other["ACTIVE"] = false;
          const fields = Object.keys(other);
          fields.forEach((field) => {
            // console.log(other[field], "iusehfiuwfw", field);
            if (!isNaN(new Date(other[field]).getTime())) {
              // console.log("iusehfiuwfw --", field);
              other[field] = format(new Date(other[field]), "dd-MMM-yyyy");
            }
          });
          return {
            ...other,
            ACTIVE: "N",
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            ENTERED_COMP_CD: authState?.companyID ?? "",
            ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
            CUSTOMER_ID: custID,
            ENTERED_FROM: enteredFrom ?? "",
          };
        });
        let payload = {
          IsNewRow: true,
          REQ_CD: reqCD ?? "",
          REQ_FLAG: custID ? "E" : "F",
          ENTRY_TYPE: "",
          COMP_CD: authState?.companyID ?? "",
          SAVE_FLAG: "",
          CUSTOMER_ID: custID ?? "",
          IS_FROM_TDS_EXEMPTION: reqCD === "" ? "Y" : "N",
          TDS_EXEMPTION: {
            DETAILS_DATA: {
              isNewRow: [...rows],
              isUpdatedRow: [],
              isDeleteRow: [],
            },
            IsNewRow: true,
            REQ_CD: reqCD ?? "",
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
          },
        };
        // console.log(rows, "uwehfiuwhfwef")
        updateMutation.mutate(payload);
      } else {
        setIsAddNewFormVisible(false);
      }
      endSubmit(true);
    } else {
      endSubmit(false);
    }
  };

  return (
    <Dialog
      open={true}
      maxWidth="lg"
      PaperProps={{
        style: {
          minWidth: "70%",
          width: "80%",
        },
      }}
    >
      <FormWrapper
        key={"TDSAddNewForm" + initialValuesRef?.current + initValues}
        metaData={
          extractMetaData(TDSAddNewFormMetadata, formMode) as MetaDataType
        }
        //   ref={}
        onSubmitHandler={onFormSubmit}
        initialValues={initValues ?? {}}
        displayMode={formMode ?? "view"}
        formState={{
          WORKING_DATE: authState?.workingDate,
          MessageBox,
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={(event) => {
                handleSubmit(event, "Save");
              }}
              disabled={isSubmitting}
              color={"primary"}
            >
              {t("Save")}
            </GradientButton>
            <GradientButton
              onClick={() => setIsAddNewFormVisible(false)}
              color={"primary"}
            >
              {t("Cancel")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </Dialog>
  );
};

export default TDSAddNewForm;
