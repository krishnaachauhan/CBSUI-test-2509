import { Dialog } from "@mui/material";
import { t } from "i18next";
import { CardDetailsMetaData } from "./cardDetailsMetadata";
import { useLocation } from "react-router-dom";
import {
  usePopupContext,
  FormWrapper,
  MetaDataType,
  GradientButton,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import { useContext } from "react";

export const CardDetails = ({
  navigate,
  parameter,
  myRef,
  docCD,
  isData,
  formMode,
}) => {
  const {
    state: { rows, retrieveData },
  }: any = useLocation();
  const { authState } = useContext(AuthContext);

  const { MessageBox } = usePopupContext();

  const formatDate = (date) =>
    date ? format(new Date(date), "dd/MMM/yyyy") : "";

  CardDetailsMetaData.fields[1].isFieldFocused =
    rows?.[0]?.data?.SR_CD && !rows?.[0]?.data?._isNewRow ? false : true;

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1100px",
          padding: "5px",
        },
      }}
    >
      <FormWrapper
        key={"atm-card-details"}
        metaData={CardDetailsMetaData as MetaDataType}
        initialValues={rows?.[0]?.data ?? { PARA_200: parameter?.PARA_200 }}
        formState={{
          MessageBox: MessageBox,
          myRef: myRef,
          reqData: {
            ...parameter,
            OLD_STATUS: rows?.[0]?.data?.OLD_STATUS,
            CONFIRMED:
              formMode === "new"
                ? isData?.cardData?.CONFIRMED
                : retrieveData?.CONFIRMED,
            ENTERED_BRANCH_CD:
              formMode === "new"
                ? authState.user.branchCode
                : retrieveData?.ENTERED_BRANCH_CD,
            ENTERED_COMP_CD:
              formMode === "new"
                ? authState.companyID
                : retrieveData?.ENTERED_COMP_CD,
            LAST_MODIFIED_DATE: retrieveData?.LAST_MODIFIED_DATE
              ? formatDate(retrieveData?.LAST_MODIFIED_DATE)
              : "",
            ENTERED_DATE: retrieveData?.ENTERED_DATE
              ? formatDate(retrieveData?.ENTERED_DATE)
              : "",
          },
          docCD: docCD,
        }}
        onSubmitHandler={(data: any, displayData, endSubmit) => {
          // @ts-ignore
          endSubmit(true);
          data = {
            ...data,
            REQ_DT: formatDate(data?.REQ_DT),
            ISSUE_DT: formatDate(data?.ISSUE_DT),
            EXPIRE_DT: formatDate(data?.EXPIRE_DT),
            DEACTIVE_DT: formatDate(data?.DEACTIVE_DT),
          };
          myRef.current?.setGridData((old) => {
            let oldRowData = old.map((item) => {
              return {
                ...item,
                REQ_DT: formatDate(item?.REQ_DT),
                ISSUE_DT: formatDate(item?.ISSUE_DT),
                EXPIRE_DT: formatDate(item?.EXPIRE_DT),
                DEACTIVE_DT: formatDate(item?.DEACTIVE_DT),
              };
            });
            const updatedGridData =
              rows?.[0]?.data?.SR_CD || rows?.[0]?.data?.ID_NO
                ? oldRowData?.map((item) => {
                    if (
                      item.SR_CD === rows?.[0]?.data?.SR_CD ||
                      (item.ID_NO && item.ID_NO === rows?.[0]?.data?.ID_NO)
                    ) {
                      const changedValues = {};
                      const changedDataValues = {};

                      // Iterate through keys of new data
                      Object.keys(data).forEach((key) => {
                        // Compare each key's value with old object
                        if (item[key] !== data[key]) {
                          changedDataValues[key] = item[key];
                          changedValues[key] = true;
                        }
                      });

                      return {
                        ...item,
                        ...data,
                        _oldData: {
                          ...changedDataValues,
                        },
                        _isTouchedCol: {
                          ...changedValues,
                        },
                      };
                    }
                    return item;
                  })
                : [
                    ...oldRowData,
                    {
                      ...data,
                      ID_NO: Date.now(),
                      ID_SR_NO: Date.now(),
                      _isNewRow: true,
                    },
                  ];
            return updatedGridData;
          });
          navigate(".");
        }}
        formStyle={{
          minHeight: "25vh",
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={(event) => {
                handleSubmit(event, "Save");
              }}
              color={"primary"}
            >
              {rows?.length ? t("Update") : t("Add")}
            </GradientButton>

            <GradientButton onClick={() => navigate(".")} color={"primary"}>
              {t("Close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </Dialog>
  );
};
