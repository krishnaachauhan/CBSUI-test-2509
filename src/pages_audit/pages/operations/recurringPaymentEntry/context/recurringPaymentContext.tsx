import { createContext, useReducer } from "react";
import { RecurPaymtStateType, ActionType, ContextType } from "./type";

const inititalState: RecurPaymtStateType = {
  recurPmtEntryData: {},
  recurPmtTransferData: {
    RECPAYTRANS: [
      {
        TRANS_ACCT_NM: "",
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
  recurPmtEntryGridData: [],
  getAcctData: {},
  dataForJasperParam: {},
  onSaveValidationData: {},
  activeStep: 0,
  isBackButton: false,
  disableButton: false,
};

const reccurPaymtReducer = (
  state: RecurPaymtStateType,
  action: ActionType
): RecurPaymtStateType => {
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

export const RecurringContext = createContext<any>(inititalState);

export const RecurringContextWrapper = ({ children }) => {
  const [state, dispatch] = useReducer(reccurPaymtReducer, inititalState);

  const setActiveStep = (value) => {
    dispatch({
      type: "activeStep",
      payload: {
        activeStep: value,
      },
    });
  };
  const updateRecurPmtEntryData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        recurPmtEntryData: data,
      },
    });
  };

  const updateRecurPmtTransferData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        recurPmtTransferData: { RECPAYTRANS: data },
      },
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

  const updateRecurPmtEntryGridData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        recurPmtEntryGridData: data,
      },
    });
  };

  const updateDataForJasperParam = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        dataForJasperParam: data,
      },
    });
  };

  const updateSaveValidationData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        onSaveValidationData: data,
      },
    });
  };

  const getAcctDatafromValApi = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        getAcctData: data,
      },
    });
  };

  const resetAllData = (data) => {
    dispatch({
      type: "resetAllData",
      payload: {},
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

  return (
    <RecurringContext.Provider
      value={{
        rpState: state,
        setActiveStep,
        updateRecurPmtEntryData,
        updateRecurPmtTransferData,
        updatePayslipAndDDData,
        updateBeneficiaryAcctData,
        updateRecurPmtEntryGridData,
        resetAllData,
        setIsBackButton,
        getAcctDatafromValApi,
        handleDisableButton,
        updateSaveValidationData,
        updateDataForJasperParam,
      }}
    >
      {children}
    </RecurringContext.Provider>
  );
};
