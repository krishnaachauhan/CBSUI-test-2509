import { createContext, useReducer } from "react";
import { StateType, ActionType, ContextType } from "./type";
import React from "react";

const inititalState: StateType = {
  formData: {},
  oldformData: {},
  form1Data: {},
  appContextData: [],
  branchContextData: [],
  productContextData: [],
  grid4: {},
  grid5: [],
  oldappContextData: [],
  oldbranchContextData: [],
  oldproductContextData: [],
  appUpdatedData: [],
  branchUpdatedData: [],
  productUpdatedData: [],
  oldData3: [],
  oldData4: {},
  activeStep: 0,
  isBackButton: false,
};

const userReducer = (state: StateType, action: ActionType): StateType => {
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
    case "formData":
      return {
        ...state,
        formData: { ...state?.formData, ...action.payload },
      };
    case "oldformData":
      return {
        ...state,
        oldformData: { ...state?.formData, ...action.payload },
      };
    case "appContextData":
      return {
        ...state,
        appContextData: action.payload,
      };
    case "branchContextData":
      return {
        ...state,
        branchContextData: action.payload,
      };
    case "productContextData":
      return {
        ...state,
        productContextData: action.payload,
      };
    case "grid4":
      return {
        ...state,
        grid4: { ...state?.grid4, ...action.payload },
      };
    case "grid5":
      return {
        ...state,
        grid5: action.payload,
      };
    case "oldappContextData":
      return {
        ...state,
        oldappContextData: action.payload,
      };
    case "oldbranchContextData":
      return {
        ...state,
        oldbranchContextData: action.payload,
      };
    case "oldproductContextData":
      return {
        ...state,
        oldproductContextData: action.payload,
      };
    case "appUpdatedData":
      return {
        ...state,
        appUpdatedData: action.payload,
      };
    case "branchUpdatedData":
      return {
        ...state,
        branchUpdatedData: action.payload,
      };
    case "productUpdatedData":
      return {
        ...state,
        productUpdatedData: action.payload,
      };
    case "oldData3":
      return {
        ...state,
        oldData3: action.payload,
      };
    case "oldData4":
      return {
        ...state,
        oldData4: action.payload,
      };
    case "resetAllData":
      return inititalState;
    default: {
      return state;
    }
  }
};

export const SecurityContext = createContext<any>(inititalState);

export const SecurityContextWrapper = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, inititalState);
  const tabRefs = React.useRef(true);
  const setActiveStep = (value) => {
    dispatch({
      type: "activeStep",
      payload: {
        activeStep: value,
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
  const dispatchCommon = (type: string, payload: object) => {
    dispatch({
      type: type,
      payload: payload ?? {},
    });
  };
  const setFlag = (value) => {
    dispatch({
      type: "commonType",
      payload: {
        flag: value,
      },
    });
  };
  return (
    <SecurityContext.Provider
      value={{
        userState: state,
        setActiveStep,
        dispatchCommon,
        resetAllData,
        setIsBackButton,
        setFlag,
        tabRefs,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};
