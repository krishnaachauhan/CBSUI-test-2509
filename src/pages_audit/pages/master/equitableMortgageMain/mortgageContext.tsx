import { createContext, useMemo, useReducer } from "react";

const inititalState: any = {
  headerEntryData: {},

  paraValue: {},
  mortgageData: {
    HOLDER_DATA: [
      {
        CUSTOMER_ID: "",
      },
    ],
  },
  rawCount: "0",
  mortgageEntryData: {
    EQUITABLE_MORTGAGE_DETAILS: [
      {
        TRANS_ACCT_NM: "",
      },
    ],
  },
  propertyHoldersData: {
    PROPERTY_DETAILS: {},
  },
  activeStep: 0,
  isBackButton: false,
  disableButton: false,
};

const reccurPaymtReducer = (state: any, action: any): any => {
  switch (action.type) {
    case "commonType":
    case "activeStep":
      return {
        ...state,
        ...action.payload,
      };
    case "resetAllData":
      return inititalState;
    default:
      return state;
  }
};

export const MortgageContext = createContext<any>(inititalState);

export const MortgageContextWrapper = ({ children }) => {
  const [state, dispatch] = useReducer(reccurPaymtReducer, inititalState);

  const setActiveStep = (value) => {
    dispatch({
      type: "activeStep",
      payload: {
        activeStep: value,
      },
    });
  };
  const updateParaValue = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        paraValue: data,
      },
    });
  };
  const updateHeaderEntryData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        headerEntryData: data,
      },
    });
  };
  const updateRowCount = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        rawCount: data,
      },
    });
  };

  const setUpdatedShareAcctDtl = (payload: { key: string; data: any }) => {
    dispatch({
      type: "commonType",
      payload: {
        propertyHoldersData: {
          PROPERTY_DETAILS: {
            ...(state?.propertyHoldersData?.PROPERTY_DETAILS ?? {}),
            [payload.key]: payload.data,
          },
        },
      },
    });
  };

  const setAllUpdatedShareAcctDtl = (payload: any) => {
    dispatch({
      type: "commonType",
      payload: {
        propertyHoldersData: {
          PROPERTY_DETAILS: payload,
        },
      },
    });
  };

  const updateMortgageEntryData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        mortgageEntryData: { EQUITABLE_MORTGAGE_DETAILS: data },
      },
    });
  };
  const updatePropertyHolderDataData = (data) => {
    dispatch({
      type: "commonType",
      payload: {
        mortgageData: { HOLDER_DATA: data },
      },
    });
  };

  const updatePropertyHoldersData = (data) => {
    console.log("updatePropertyHoldersData >>>");
    dispatch({
      type: "commonType",
      payload: {
        propertyHoldersData: { PROPERTY_DETAILS: data },
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
    <MortgageContext.Provider
      value={useMemo(
        () => ({
          dataState: state,
          setActiveStep,
          updateHeaderEntryData,
          updateMortgageEntryData,
          updatePropertyHoldersData,
          resetAllData,
          updateRowCount,
          setIsBackButton,
          updateParaValue,
          handleDisableButton,
          updatePropertyHolderDataData,
          setUpdatedShareAcctDtl,
          setAllUpdatedShareAcctDtl,
        }),
        [
          state,
          setActiveStep,
          updateHeaderEntryData,
          updateMortgageEntryData,
          updatePropertyHoldersData,
          resetAllData,
          updateRowCount,
          setIsBackButton,
          updateParaValue,
          handleDisableButton,
          updatePropertyHolderDataData,
          setUpdatedShareAcctDtl,
          setAllUpdatedShareAcctDtl,
        ]
      )}
    >
      {children}
    </MortgageContext.Provider>
  );
};
