import { createContext, useReducer } from "react";
import { FDStateType, ActionType, FDContextType } from "./type";

const inititalState: FDStateType = {
  activeStep: 0,
  isBackButton: false,
  disableButton: false,
  sourceAcctFormData: {
    TRNDTLS: [
      {
        ACCT_NAME: "",
      },
    ],
  },
  payslipAndDDData: {
    PAYSLIPDD: [
      {
        TRANS_ACCT_NM: "",
      },
    ],
  },
  beneficiaryAcctData: {
    BENEFIACCTDTL: [
      {
        TRANS_ACCT_NM: "",
      },
    ],
  },
  retrieveFormData: {},
  fdParaDetailData: {},
  acctNoData: {},
  fdPaymentData: {},
  fdSavedPaymentData: {},
  prematureRateData: {},
  viewDtlGridData: [],
  checkAllowFDPayApiData: {},
  renewTrnsFormData: {},
  validatePaymetEntryData: {},
  renewDataForDeposit: {},
  schemeSelecRowData: {},
  fdDetailArrayFGridData: [],
  iniDtlFormDataNewFD: {},
  initialRenData: {},
  savedFormFieldData: {},
};

const FDReducer = (state: FDStateType, action: ActionType): FDStateType => {
  switch (action.type) {
    case "commonType":
      return {
        ...state,
        ...action.payload,
      };
    case "activeStep":
      return {
        ...state,
        ...action.payload,
      };
    case "resetAllData":
      return inititalState;
    default: {
      return state;
    }
  }
};

export const FDContext = createContext<any>(inititalState);

export const FDContextWrapper = ({ children }) => {
  const [state, dispatch] = useReducer(FDReducer, inititalState);

  const setActiveStep = (value) => {
    dispatch({
      type: "activeStep",
      payload: {
        activeStep: value,
      },
    });
  };
  const setIsBackButton = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        isBackButton: data,
      },
    });
  };
  const handleDisableButton = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        disableButton: data,
      },
    });
  };
  const updateSourceAcctFormData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        sourceAcctFormData: { TRNDTLS: data },
      },
    });
  };
  const updateRetrieveFormData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        retrieveFormData: data,
      },
    });
  };
  const updateFDParaDetailData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        fdParaDetailData: data,
      },
    });
  };
  const updateAcctNoData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        acctNoData: data,
      },
    });
  };
  const updateFDPaymentData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        fdPaymentData: data,
      },
    });
  };
  const updateViewDtlGridData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        viewDtlGridData: data,
      },
    });
  };
  const updateCheckAllowFDPayApiData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        checkAllowFDPayApiData: data,
      },
    });
  };
  const updatePrematureRateData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        prematureRateData: data,
      },
    });
  };
  const updateFdSavedPaymentData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        fdSavedPaymentData: data,
      },
    });
  };
  const updateRenewTrnsFormData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        renewTrnsFormData: data,
      },
    });
  };
  const updateValidatePaymetEntryData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        validatePaymetEntryData: data,
      },
    });
  };
  const updateRenewDataForDeposit = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        renewDataForDeposit: data,
      },
    });
  };
  const resetAllData = (data) => {
    dispatch({
      type: "resetAllData",
      payload: {},
    });
  };
  const updatePayslipAndDDData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        payslipAndDDData: { PAYSLIPDD: data },
      },
    });
  };
  const updateBeneficiaryAcctData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        beneficiaryAcctData: { BENEFIACCTDTL: data },
      },
    });
  };
  const updateSchemeSelecRowData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        schemeSelecRowData: data,
      },
    });
  };
  const updateFDDetailArrayFGridData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        fdDetailArrayFGridData: data,
      },
    });
  };

  const updateIniDtlFormDataNewFD = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        iniDtlFormDataNewFD: data,
      },
    });
  };
  const updateInitialRenData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        initialRenData: data,
      },
    });
  };

  const updateSavedFormFieldData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        savedFormFieldData: data,
      },
    });
  };

  return (
    <FDContext.Provider
      value={{
        FDState: state,
        setActiveStep,
        resetAllData,
        setIsBackButton,
        handleDisableButton,
        updateSourceAcctFormData,
        updateRetrieveFormData,
        updateFDParaDetailData,
        updateAcctNoData,
        updateViewDtlGridData,
        updateFDPaymentData,
        updateCheckAllowFDPayApiData,
        updatePrematureRateData,
        updateFdSavedPaymentData,
        updateRenewTrnsFormData,
        updateValidatePaymetEntryData,
        updateRenewDataForDeposit,
        updatePayslipAndDDData,
        updateBeneficiaryAcctData,
        updateSchemeSelecRowData,
        updateFDDetailArrayFGridData,
        updateIniDtlFormDataNewFD,
        updateInitialRenData,
        updateSavedFormFieldData,
      }}
    >
      {children}
    </FDContext.Provider>
  );
};
