import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import * as API from "./api";
import { CkycStateType } from "./type";
import { AuthSDK } from "registry/fns/auth";
import { DefaultErrorObject, utilFunction } from "@acuteinfo/common-base";
import _ from "lodash";
import { format, isValid } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import useCkycContext from "./useCkycContext";

const initialState: any = {
  handleFormModalOpenctx: () => {},
  handleFormModalClosectx: () => {},

  fromctx: "",
  formmodectx: "",
  isDraftSavedctx: false,

  isSidebarExpandedctx: false,
  setIsSidebarExpandedctx: () => {},
  handleSidebarExpansionctx: () => {},

  colTabValuectx: 0,
  setColTabValuectx: () => {},
  handleColTabChangectx: () => {},

  isLoadingDatactx: () => {},
  setIsLoadingDatactx: () => {},
  isCustomerDatactx: false,
  setIsCustomerDatactx: () => {},

  entityTypectx: null,

  tabsApiResctx: [],
  tabNameList: [],
  setTabsApiRes: () => {},
  // customerCategoriesctx: [],
  categoryValuectx: null,
  constitutionValuectx: null,
  accTypeValuectx: null,
  isMinorOrMajor: null,
  personalOtherDtlLFno: null,
  kycNoValuectx: "",
  setCategoryValue: () => {},
  setConstitutionValuectx: () => {},
  setAccTypeValuectx: () => {},
  AccTypeOptionsctx: [],

  formDatactx: {},
  formDataCtxNew: {},
  otherExtDetailsctx: {},
  retrieveFormDataApiRes: {},
  customerIDctx: "",
  inActiveDatectx: "",
  attestatioDtl: {},
  formDataDraftctx: {},
  isFreshEntryctx: false,
  isCustActivectx: null,
  req_cd_ctx: "",

  photoBlobctx: null,
  photoBase64ctx: null,
  signBlobctx: null,
  signBase64ctx: null,

  confirmFlagctx: null,
  update_casectx: null,
  steps: {
    0: { status: "" },
  },
  currentFormctx: {
    currentFormRefctx: [],
    currentFormSubmitted: null,
    colTabValuectx: null,
  },
  modifiedFormCols: {},
  isFinalUpdatectx: false,
  isValidateCustCtx: {},
  updatedReq: {},
  multipleRows: {},
  selectedRow: {},
  finalUpdatedReq: {},
  updatedOtherDtlReq: {},
  panDuplicateReasonctx: "",
  loader: false,
  custRetData: [],
  documentObj: {},
  isAbortSubmit: false,
  isButtonDisable: false,

  // steps: {
  //     error: [],
  //     completed: [],
  //     notValidated: []
  // }
  handleUpdateDocument: () => {},
};

export const CkycContext = React.createContext<any>(initialState);
const CkycProvider = ({ children }) => {
  const value = useCkycContext();
  return <CkycContext.Provider value={value}>{children}</CkycContext.Provider>;
};

export default CkycProvider;
