import {
  Alert,
  extractMetaData,
  FormWrapper,
  InitialValuesType,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { Box } from "@mui/system";
import { AuthContext } from "pages_audit/auth";
import { useContext, useRef, useState } from "react";
import { MortgageContext } from "./mortgageContext";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useMutation } from "react-query";
import * as API from "./api";
import { t } from "i18next";
import ShareAcctDetails from "./shareAcctDetails";
import { headerDetailsMetaData } from "./netadata/formMetaData/headerDetailsMetaData";
import { mortgageDetailsMetadata } from "./netadata/formMetaData/mortgageDetailsMetadata";
import { getUnmatchedSrCds, StepperContentBox } from "./helper";

const StepperContent = ({
  defaultView,
  formMode,
  headerDTLformref,
  mortgageDTLformref,
  paraValue,
  collectedRows,
  detailData,
  propHoldrDetail,
  mortgageDetails,
  finalRef,
  closeDialog,
  filteredArray,
  isDataChangedRef,
}) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const {
    dataState,
    setActiveStep,
    updateHeaderEntryData,
    updatePropertyHolderDataData,
  } = useContext(MortgageContext);
  const autosetDataRef = useRef<any>(null);
  const [isshareAcctDtlOpen, setIsshareAcctDtlOpen] = useState(false);
  const [autoSetData, setAutoSetData] = useState<any>(null);
  const selectedSrCd = useRef<string>("1");
  const isRowExist = useRef<any>(null);
  const selectedFareValue = useRef<string>("0.00");
  const { state: rows }: any = useLocation();

  const saveDataMutation = useMutation(API.saveMortgageEntryData, {
    onError: (error: any) => {
      MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      if (data[0]?.STATUS === "0") {
        const buttonName = await MessageBox({
          message: data[0]?.MESSAGE ?? "",
          messageTitle: "Sucess",
          icon: "SUCCESS",
          buttonNames: ["Ok"],
        });

        if (buttonName === "Ok") {
          isDataChangedRef.current = true;
          closeDialog();
          CloseMessageBox();
        }
      } else if (data[0]?.STATUS === "99") {
        MessageBox({
          message: data[0]?.MESSAGE ?? "",
          messageTitle: "Error",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      }
    },
  });

  const onArrayFieldRowClickHandle = (data) => {
    selectedSrCd.current = data?.SR_CD;
    isRowExist.current = data?.RAW_EXIST;
    selectedFareValue.current = data?.FARE_VALUE;
  };

  const headerFormSubmit: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);

    updatePropertyHolderDataData(data?.HOLDER_DATA);

    const {
      LAST_MACHINE_NM,
      ENTERED_DATE,
      MACHINE_NM,
      LAST_ENTERED_BY,
      LAST_MODIFIED_DATE,
      ENTERED_BY,
      COMP_CD,
      BRANCH_CD,
      HOLDER_DATA,
      ...rest
    } = data;

    const formatDate = (date: any) =>
      !utilFunction.isValidDate(date)
        ? authState?.workingDate
        : format(new Date(date), "dd/MMM/yyyy");

    rest.TRAN_DT = formatDate(rest?.TRAN_DT);
    rest.MORTGAGE_DATE = formatDate(rest?.MORTGAGE_DATE);
    rest.MORT_EXP_DT = formatDate(rest?.MORT_EXP_DT);

    updateHeaderEntryData(rest);
    setActiveStep(dataState?.activeStep + 1);
  };
  const saveMortgageEntry: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    if (data && !hasError) {
      endSubmit(true);
      //---------section-2 submit------------
      const dateFields = [
        "MORT_CHG_SAT_DT",
        "CER_CHG_DT",
        "CER_CHG_SAT_DT",
        "VALUATION_DT",
        "VAL_EXP_DT",
        "TITLE_DT",
        "EXPIRY_DATE",
        "MORT_CHG_DT",
      ];
      data?.EQUITABLE_MORTGAGE_DETAILS?.forEach((el, i) => {
        Object.keys(el).forEach((key) => {
          if (dateFields.includes(key)) {
            if (utilFunction.isValidDate(el[key]))
              el[key] = format(new Date(el[key]), "dd/MM/yyyy");
          }
        });
      });
      const updPara1 = utilFunction.transformDetailDataForDML(
        detailData ?? [],
        data?.EQUITABLE_MORTGAGE_DETAILS ?? [],
        ["SR_CD"]
      );
      const mortgageDtlEntry = API.removeKeysFromUpdateRows(
        updPara1,
        [
          "COUNT",
          "ROW_ID",
          "UNIQUE_KEY",
          "ADD_PROPERTY",
          "REGIONBTN",
          "SR_CD",
          "TRAN_DT",
        ],
        {
          COMP_CD: authState?.companyID,
          TRAN_CD: defaultView === "add" ? "" : rows[0]?.data?.TRAN_CD,
        }
      );
      //----------section 3 --------------
      const newPropertyData = finalRef.current;

      const propertyDataReq: any = newPropertyData
        ? Object.values(newPropertyData).flat()
        : [];

      const updPara2 = utilFunction.transformDetailDataForDML(
        propHoldrDetail ?? [],
        propertyDataReq ?? [],
        ["UNIQUE_KEY"]
      );

      const propertyDtlEntry = API.removeKeysFromUpdateRows(
        updPara2,
        ["COUNT", "ROW_ID", "UNIQUE_KEY", "SR_CD", "RAW_EXIST"],
        {
          COMP_CD: authState?.companyID,
          TRAN_CD: defaultView === "add" ? "" : rows[0]?.data?.TRAN_CD,
        }
      );

      //---------section 1-header entry -------------
      let oldData = defaultView === "add" ? [] : [rows?.[0]?.data];

      let newHeaderData = [dataState?.headerEntryData];

      const headerUpdatedPara = utilFunction.transformDetailDataForDML(
        oldData ?? [],
        newHeaderData ?? [],
        ["TRAN_CD"]
      );

      const mortgageHeader = API.removeKeysFromUpdateRows(
        headerUpdatedPara,
        ["COUNT", "ROW_ID", "UNIQUE_KEY", "SR_CD"],
        {
          COMP_CD: authState?.companyID,
          TRAN_CD: defaultView === "add" ? "" : rows[0]?.data?.TRAN_CD,
        }
      );
      //---------section 1-add holder -------------
      const updPara3 = utilFunction.transformDetailDataForDML(
        mortgageDetails ?? [],
        dataState?.mortgageData?.HOLDER_DATA ?? [],
        ["SR_CD"]
      );
      const mortgagePropertyHolderDtl = API.removeKeysFromUpdateRows(
        updPara3,
        ["COUNT", "ROW_ID", "UNIQUE_KEY", "SR_CD"],
        {
          COMP_CD: authState?.companyID,
          TRAN_CD: defaultView === "add" ? "" : rows[0]?.data?.TRAN_CD,
        }
      );
      const sr_cd = await getUnmatchedSrCds({
        MORTAGE_DETAIL_ENTRY: mortgageDtlEntry,
        PROPERTY_HOLDER_DETAILS: propertyDtlEntry,
      });
      console.log(sr_cd, "sr_cd");

      if (sr_cd.length > 0) {
        const buttonName = await MessageBox({
          messageTitle: t("Error"),
          message: `please Insert property detail at row ${sr_cd}`,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
        const classArray = document.querySelectorAll(
          ".EQUITABLE_MORTGAGE_DETAILS-array-field-row"
        );
        if (buttonName === "Ok") {
          classArray[Number(sr_cd) - 1].scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
          setIsshareAcctDtlOpen(true);
        }
      } else {
        const buttonName = await MessageBox({
          messageTitle: t("Confirmation"),
          message: t("ProceedGen"),
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          saveDataMutation?.mutate({
            _isNewRow: defaultView === "add",
            TRAN_CD: defaultView === "add" ? "" : rows[0]?.data?.TRAN_CD,
            MORTAGE_HEADER_ENTRY: mortgageHeader,
            ADD_PROPERTY_HOLDER:
              paraValue?.[0]?.PARA_162 === "Y" ? mortgagePropertyHolderDtl : {},
            MORTAGE_DETAIL_ENTRY: mortgageDtlEntry,
            PROPERTY_HOLDER_DETAILS: propertyDtlEntry,
            PARA_162: paraValue?.[0]?.PARA_162,
          });
        }
      }
    }
  };

  return (
    <>
      <Box sx={StepperContentBox}>
        {saveDataMutation?.isError && (
          <Alert
            severity="error"
            errorMsg={
              saveDataMutation?.error?.error_msg ?? t("Somethingwenttowrong")
            }
            errorDetail={saveDataMutation?.error?.error_detail}
            color="error"
          />
        )}
        {dataState?.activeStep === 0 ? (
          <FormWrapper
            key={"headerForm" + formMode}
            metaData={
              extractMetaData(headerDetailsMetaData, formMode) as MetaDataType
            }
            formStyle={{
              background: "white",
              height: "auto",
              overflow: "auto",
            }}
            formState={{
              MessageBox: MessageBox,
              authState: authState,
            }}
            initialValues={{
              ...dataState?.headerEntryData,
              ...dataState?.mortgageData,

              PARA_162: paraValue?.[0]?.PARA_162 ?? "",
            }}
            displayMode={formMode}
            onSubmitHandler={headerFormSubmit}
            ref={headerDTLformref}
          />
        ) : dataState?.activeStep === 1 ? (
          <FormWrapper
            key={"detailsdata form" + formMode}
            metaData={
              extractMetaData(mortgageDetailsMetadata, formMode) as MetaDataType
            }
            formStyle={{
              background: "white",
              overflow: "auto",
              maxHeight: "600px",
            }}
            setDataOnFieldChange={async (action, payload) => {
              if (action === "SECURITY_AUTOSET") {
                autosetDataRef.current = {
                  ...payload,
                };
                if (formMode === "edit" && isRowExist.current === "Y") {
                  setAutoSetData({ ...payload });
                  setIsshareAcctDtlOpen(true);
                }
              }
            }}
            formState={{
              MessageBox: MessageBox,
              authState: authState,
              onArrayFieldRowClickHandle,
              FORM_MODE: formMode,
              propertyRows: collectedRows,
            }}
            initialValues={
              formMode === "add"
                ? {
                    PARA_162: paraValue?.[0]?.PARA_162 ?? "",
                    EQUITABLE_MORTGAGE_DETAILS: [{}],
                  }
                : {
                    ...dataState?.mortgageEntryData,
                    PARA_162: paraValue?.[0]?.PARA_162 ?? "",

                    FORM_MODE: formMode as InitialValuesType,
                  }
            }
            onFormButtonClickHandel={async (id) => {
              if (id.slice(id.indexOf(".") + 1) === "ADD_PROPERTY") {
                setIsshareAcctDtlOpen(true);
              }
            }}
            displayMode={formMode}
            onSubmitHandler={saveMortgageEntry}
            ref={mortgageDTLformref}
          />
        ) : null}
      </Box>
      <ShareAcctDetails
        open={isshareAcctDtlOpen}
        formMode={formMode}
        filteredArray={filteredArray}
        autoSetData={autoSetData}
        selectedSrCd={selectedSrCd}
        selectedFareValue={selectedFareValue}
        collectedRows={collectedRows}
        setIsshareAcctDtlOpen={setIsshareAcctDtlOpen}
        setAutoSetData={setAutoSetData}
        paraValue={paraValue}
      />
    </>
  );
};

export default StepperContent;
