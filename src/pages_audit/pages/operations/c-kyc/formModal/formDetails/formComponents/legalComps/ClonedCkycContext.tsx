import useCkycContext from "pages_audit/pages/operations/c-kyc/useCkycContext";
import React from "react";

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

export const ClonedCkycContext = React.createContext<any>(initialState);
const ClonedCkycProvider = ({ children }) => {
  const value = useCkycContext();
  return (
    <ClonedCkycContext.Provider value={value}>
      {children}
    </ClonedCkycContext.Provider>
  );
};

export default ClonedCkycProvider;
