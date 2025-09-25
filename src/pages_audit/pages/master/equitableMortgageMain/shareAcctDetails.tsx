import {
  extractMetaData,
  FormWrapper,
  GradientButton,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { Box, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { t } from "i18next";
import { MortgageContext } from "./mortgageContext";
import {
  propertyAcctDetails,
  TotalOfFieldsMetaData,
} from "./netadata/formMetaData/shareAcctMetaData";
import { PaperComponent } from "pages_audit/pages/operations/DailyTransaction/TRN001/components";

const ShareAcctDetails = ({
  open,
  formMode,
  filteredArray,
  autoSetData,
  selectedSrCd,
  selectedFareValue,
  collectedRows,
  setIsshareAcctDtlOpen,
  setAutoSetData,
  paraValue,
}) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { dataState, setUpdatedShareAcctDtl } = useContext(MortgageContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const propertyDTLformref = useRef<any>(null);
  const { state: rows }: any = useLocation();

  const modifiedPropertyDetails =
    dataState?.propertyHoldersData?.PROPERTY_DETAILS?.[
      selectedSrCd.current
    ]?.map((item: any) => ({
      ...item,
      REALESE_FLAG: item?.REALESE_FLAG === "Y",
    })) ?? [{}];

  const shareAcctFormSubmit: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    if (!hasError) {
      if (Array.isArray(data?.PROPERTY_DETAILS)) {
        data.PROPERTY_DETAILS.forEach((item) => {
          item.REALESE_FLAG = item?.REALESE_FLAG === true ? "Y" : "N";
        });
      }

      const newObj = {
        key: selectedSrCd.current,
        data: data?.PROPERTY_DETAILS,
      };

      setUpdatedShareAcctDtl(newObj);
      setIsshareAcctDtlOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      className="form"
      maxWidth="xl"
      onClose={() => {
        setIsshareAcctDtlOpen(false);
      }}
      id="draggable-dialog-title"
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      BackdropProps={{
        style: {
          backgroundColor: "transparent",
        },
      }}
      PaperProps={{
        style: {
          width: "100%",
          position: "relative",
          height: "auto",
          overflow: "auto",
        },
      }}
    >
      <Box id="draggable-dialog-title" style={{ cursor: "move" }}>
        <FormWrapper
          key={
            "propert detaikl form" +
            formMode +
            filteredArray.current +
            autoSetData?.security_Per
          }
          metaData={
            extractMetaData(propertyAcctDetails, formMode) as MetaDataType
          }
          formState={{
            MessageBox: MessageBox,
            authState: authState,
            srCd: selectedSrCd.current,
            ROW_ID: selectedSrCd.current,
            docCD,
            TRAN_CD: rows?.[0]?.data?.TRAN_CD ?? "",
            fareValue: selectedFareValue?.current,
            propertyRows: collectedRows,
            security_Per: autoSetData?.security_Per,
          }}
          displayMode={formMode}
          initialValues={{
            PROPERTY_DETAILS: modifiedPropertyDetails ?? [],
            PARA_162: paraValue?.[0]?.PARA_162 ?? "",
            AUTOSET_SECURITY_PER: autoSetData?.security_Per,
          }}
          onSubmitHandler={shareAcctFormSubmit}
          formStyle={{
            background: "white",
            overflow: "scroll",
            height: "30vh",
          }}
          ref={propertyDTLformref}
        >
          {({ isSubmitting, handleSubmit }) => (
            <GradientButton
              onClick={async (event) => {
                setAutoSetData(null);
                handleSubmit(event, "Save");
              }}
              color={"primary"}
            >
              {formMode === "view" ? t("close") : t("SaveClose")}
            </GradientButton>
          )}
        </FormWrapper>
        <FormWrapper
          key={"headerForm" + formMode}
          metaData={
            extractMetaData(TotalOfFieldsMetaData, formMode) as MetaDataType
          }
          formStyle={{
            background: "white",
            height: "auto",
            overflow: "auto",
          }}
          initialValues={{}}
          hideHeader={true}
          displayMode={formMode}
          onSubmitHandler={() => {}}
        />
      </Box>
    </Dialog>
  );
};
export default ShareAcctDetails;
