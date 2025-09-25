import { utilFunction } from "@acuteinfo/common-base";
import { format } from "date-fns";
import _ from "lodash";
import React, { useCallback, useReducer } from "react";

const initialState: any = {
  acctModectx: null,
  acctNumberctx: "",
  isLoading: false,
  param320: "", //enable/disable
  gparam155: "", //visible/hide
  lf_noctx: "",
  cctlcactx: "",
  is_nbfcctx: "",
  CustDataFieldsctx: "",
  disableIntRatectx: "",
  disablePanelRatectx: "",
  disableAgClearingRatectx: "",
  disableInsuDueRatectx: "",
  disableInstallmentTypectx: "",
  intialStartDt: "",
  disableInterestTypectx: "",
  disableRiskCategoryctx: "",
  disableMaturityAmtctx: "",
  disableInstStartDatectx: "",
  disableInstDueDatectx: "",
  disableTypeCdctx: "",
  displayFDDetailsctx: "",
  defaultInterestTypectx: "",
  defaultInstallmentTypectx: "",
  defaultTypeCdctx: "",
  changeRecommandedLabelctx: "",
  changeRelationshipCompctx: "",
  rowBranchCodectx: "",
  setInterestRatectx: "",
  para_297ctx: "",
  visibleTradeInfoctx: "",
  lastAcctCdctx: "",
  diableIntroAcct: "",
  // all customer-mst states
  isFormModalOpenctx: false,

  fromctx: "",
  formmodectx: "",
  allowEditctx: "",
  allowReopenAcctctx: "",
  allowCloseAcctctx: "",
  isSidebarExpandedctx: false,

  colTabValuectx: false,

  tabsApiResctx: [],
  tabNameList: [],
  constitutionValuectx: null,
  accTypeValuectx: null,
  parentCodectx: null,
  kycNoValuectx: null,

  formDatactx: {},
  btnDatactx: {},
  fdDetailPara: {},
  UpdDatactx: {},
  retrievebtnDataApiRes: {},
  retrieveFormDataApiRes: {},
  customerIDctx: "",
  isFreshEntryctx: false,
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
    isLoading: false,
  },
  modifiedFormCols: {},
  updateFormDatactx: {},
  isFinalUpdatectx: false,
  closeAcctStatus: "",
  colBtnDatactx: [],
  colOldBtnDatactx: [],
  retrievecolBtnDatactx: [],

  mainIntialVals: {
    UDYAM_REG_NO: "",
    ANNUAL_TURNOVER_SR_CD: "",
    BUSINESS_CD: "",
    PRODUCTION_YES_NO: "",
    DATE_OF_COMMENCEMENT: "",
    ACTION_TAKEN_CD: "",
    SANCTIONED_BY: "",
    RATE_WEF: "",
    NO_OF_LEAVES: "",
    CHEQUE_NO: "",
    REF_ACCT_CD: "",
    REF_ACCT_TYPE: "",
    REF_COMP_CD: "",
    REF_BRANCH_CD: "",
    LOCKER_KEY_NO: "",
    INT_SKIP_REASON_TRAN_CD: "",
    UDYAM_REG_DT: "",
    INVEST_IN_PLANT: "",
    NPA_REASON: "",
    INT_SKIP_FLAG: "",
    INSURANCE_EXPIRY_PENAL_RT: "",
    STOCK_EXPIRY_PENAL_RT: "",
    PACKET_NO: "",
    AGAINST_CLEARING: "",
    OD_APPLICABLE: "",
    RESOLUTION_NO: "",
    DOCKET_NO: "",
    FILE_NO: "",
    DATE_OF_DEATH: "",
    HANDICAP_DESCIRPTION: "",
    HANDICAP_FLAG: "",
    PASSPORT_NO: "",
    DAY_BOOK_REVRS_GRP_CD: "",
    MONTHLY_HOUSEHOLD_INCOME: "",
    EDUCATION_QUALIFICATION: "",
    MARITAL_STATUS: "",
    DATE_OF_RETIREMENT: "",
    DESIGNATION_CD: "",
    FIRM_NM: "",
    SALARIED: "",
    MOTHER_MAIDEN_NM: "",
    PREFIX_CD: "",
    LST_STATEMENT_DT: "",
    CLOSE_REASON_CD: "",
    DISBURSEMENT_DT: "",
    PTS: "",
    DUE_AMT: "",
    DRAWING_POWER: "",
    NPA_CD: "",
    NPA_DT: "",
    TYPE_CD: "",
    LIMIT_AMOUNT: "",
    PATH_SIGN: "",
    DAY_BOOK_GRP_CD: "",
    INSTALLMENT_TYPE: "",
    LAST_INST_DT: "",
    INST_DUE_DT: "",
    INST_NO: "",
    INST_RS: "",
    SANCTIONED_AMT: "",
    APPLIED_AMT: "",
    INS_START_DT: "",
    SANCTION_DT: "",
    APPLY_DT: "",
    RECOMMENDED_DESG: "",
    RECOMMENED_NM: "",
    ENTERED_DATE: "",
    INT_TYPE: "",
    SECURITY_CD: "",
    PRIORITY_CD: "",
    PURPOSE_CD: "",
    CR_INT: "",
    PENAL_RATE: "",
    AG_CLR_RATE: "",
    INT_RATE: "",
    CATEG_CD: "",
    CLASS_CD: "",
    AGENT_CD: "",
    LEAN_AMT: "",
    LEAN_TYPE: "",
    SHARE_ACCT_CD: "",
    SHARE_ACCT_TYPE: "",
    MEM_ACCT_CD: "",
    MEM_ACCT_TYPE: "",
    E_MAIL_ID: "",
    REMARKS: "",
    TRADE_INFO: "",
    COMMU_CD: "",
    ACCT_MODE: "",
    GROUP_CD: "",
    TRADE_CD: "",
    FORM_60: "",
    PAN_NO: "",
    MOBILE_REG: "",
    CONTACT3: "",
    CONTACT2: "",
    CONTACT1: "",
    CONTACT4: "",
    CONFIRMED: "",
    GSTIN: "",
    UNIQUE_ID: "",
    CITY_CD: "",
    AREA_CD: "",
    ADD1: "",
    ADD2: "",
    STATUS: "",
    ADD3: "",
    FIRST_NM: "",
    CLOSE_DT: "",
    OP_DATE: "",
    CUSTOMER_ID: "",
    ACCT_CD: "",
    ACCT_TYPE: "",
    TIN: "",
    LF_NO: "",
    BIRTH_DT: "",
    GENDER: "",
    LAST_NM: "",
    SURNAME: "",
    INDUSTRY_CODE: "",
    RENRE_CD: "",
    THROUGH_CHANNEL: "",
    REQUEST_CD: "",
    ACCT_NM: "",
  },
  SHARE_AMT: "",
  DEF_BRANCH: "",
  SCREEN_FLAG: "",
  documentObj: [],
  jointTypeDtl: [],
  advConfigObj: {},
  loader: false,
  CONFIRMED: "",
  isTabDisable: false,
  // steps: {
  //     error: [],
  //     completed: [],
  //     notValidated: []
  // }
};

const Reducer = (state, action) => {
  switch (action.type) {
    case "handleFromFormMode":
    case "handleFormModalOpen":
    case "handleDraftSave":
    case "handleFormModalClose":
    case "update_ApiResctx":
    case "handleCategoryChangectx":
    case "update_accTypeValuectx":
    case "update_kycNoValuectx":
    case "update_req_cd_ctxctx":
    case "update_photo_signctx":
    case "update_req_cd_ctxctx":
    case "update_isSidebarExpandedctx":
    case "update_colTabValuectx":
    case "update_stepStatus":
    case "update_formData":
    case "update_formDataDraft":
    case "update_retrieveFormData":
    case "update_retrieveBtnData":
    case "handle_BtnDatas":
    case "Upd_BtnDatas":
    case "modify_formdata":
    case "modify_tabCols":
    case "update_customerIDctx":
    case "reset_ckyc":
    case "set_currentFormObj":
    case "onFinalUpdate":
    case "handle_formloading":
    case "update_document":
    case "update_advConfig":
    case "update_loading":
    case "handle_closeAcctStatus":
    case "handle_fdDetailpara":
    case "buttonDisable":
    case "updateIntro_acctValue":

    case "update_viewedFlag":
    case "update_colBtnData":
    case "retrieve_colBtnData":
    case "retrieve_oldColBtnData":
    case "joint_type_dtl":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
export const AcctMSTContext = React.createContext<any>({
  AcctMSTState: initialState,
  handleFormLoading: () => {},
  handleFromFormModectx: () => {},
  handleFormModalClosectx: () => {},
  handleFormModalOpenOnEditctx: () => {},
  handleReqCDctx: () => {},
  handleSidebarExpansionctx: () => {},
  handleHeaderFormSubmit: () => {},
  handleAcctTypeValue: () => {},
  handleApiRes: () => {},
  handleCustFieldsReadOnlyctx: () => {},
  handleColTabChangectx: () => {},
  handleFormModalOpenctx: () => {},
  handleCurrFormctx: () => {},
  handleStepStatusctx: () => {},
  onFinalUpdatectx: () => {},
  handleFormDataonSavectx: () => {},
  handleBtnDataonSavectx: () => {},
  handleFdDetailParactx: () => {},
  UpdBtnDataonSavectx: () => {},
  handleBtnDataonRetrievectx: () => {},
  handlecustomerIDctx: () => {},
  handleModifiedColsctx: () => {},
  handleFormDataonRetrievectx: () => {},
  handleSavectx: () => {},
  handleUpdatectx: () => {},
  handleUpdateDocument: () => {},
  handleCloseAcctStatus: () => {},
  handleIntroAcct: () => {},
  handleColBtnData: () => {},
  handleRetrieveColBtnData: () => {},
  handleOldColBtnData: () => {},
});
const AcctMSTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  const tabFormRefs = React.useRef([]);
  const submitRefs = React.useRef(false);

  interface handleFromFormModeTyoe {
    formmode?: string | null;
    from?: string | null;
  }
  const handleFromFormModectx = useCallback((data: handleFromFormModeTyoe) => {
    const keys = Object.keys(data);
    let payload = {};
    if (keys.includes("formmode")) {
      payload["formmodectx"] = data["formmode"];
    }
    if (keys.includes("from")) {
      payload["fromctx"] = data["from"];
    }
    dispatch({
      type: "handleFromFormMode",
      payload: payload,
    });
  }, []);

  const handleFormModalClosectx = useCallback(() => {
    dispatch({
      type: "handleFormModalClose",
      payload: {
        acctModectx: null,
        acctNumberctx: "",
        isLoading: false,
        param320: "",
        gparam155: "",
        lf_noctx: "",
        cctlcactx: "",
        is_nbfcctx: "",
        CustDataFieldsctx: "",
        disableIntRatectx: "",
        disablePanelRatectx: "",
        disableAgClearingRatectx: "",
        disableInsuDueRatectx: "",
        disableInterestTypectx: "",
        disableInstallmentTypectx: "",
        intialStartDt: "",
        disableRiskCategoryctx: "",
        disableMaturityAmtctx: "",
        disableInstStartDatectx: "",
        disableInstDueDatectx: "",
        disableTypeCdctx: "",
        displayFDDetailsctx: "",
        defaultInterestTypectx: "",
        defaultInstallmentTypectx: "",
        defaultTypeCdctx: "",
        changeRecommandedLabelctx: "",
        changeRelationshipCompctx: "",
        rowBranchCodectx: "",
        setInterestRatectx: "",
        para_297ctx: "",
        visibleTradeInfoctx: "",
        lastAcctCdctx: "",
        diableIntroAcct: "",
        isFormModalOpenctx: false,
        colTabValuectx: false,
        constitutionValuectx: null,
        accTypeValuectx: null,
        parentCodectx: null,
        tabsApiResctx: [],
        isFreshEntryctx: false,
        tabNameList: [],
        formDatactx: {},
        btnDatactx: {},
        fdDetailPara: {},
        UpdDatactx: {},
        retrievebtnDataApiRes: {},
        steps: {},

        retrieveFormDataApiRes: {},
        req_cd_ctx: "",
        customerIDctx: "",
        photoBlobctx: null,
        photoBase64ctx: null,
        signBlobctx: null,
        signBase64ctx: null,

        modifiedFormCols: {},
        updateFormDatactx: {},
        confirmFlagctx: null,
        update_casectx: "",
        currentFormctx: {
          currentFormRefctx: [],
          currentFormSubmitted: null,
          colTabValuectx: null,
          isLoading: false,
        },
        isFinalUpdatectx: false,

        fromctx: "",
        formmodectx: "",
        allowEditctx: "",
        allowReopenAcctctx: "",
        allowCloseAcctctx: "",
        documentObj: [],
        jointTypeDtl: [],
        closeAcctStatus: "",
        advConfigObj: "",
        loader: false,
        SHARE_AMT: "",
        DEF_BRANCH: "",
        SCREEN_FLAG: "",
        CONFIRMED: "",
        colBtnDatactx: [],
        colOldBtnDatactx: [],
        retrievecolBtnDatactx: [],
        isTabDisable: false,
      },
    });
  }, []);

  const handleReqCDctx = (value) => {
    dispatch({
      type: "update_req_cd_ctxctx",
      payload: {
        req_cd_ctx: value,
      },
    });
  };

  const handleSidebarExpansionctx = useCallback(() => {
    dispatch({
      type: "update_isSidebarExpandedctx",
      payload: {
        isSidebarExpandedctx: !state.isSidebarExpandedctx,
      },
    });
  }, [state.isSidebarExpandedctx]);

  interface handleHeaderFormSubmitType {
    acctType: string;
    reqID: string;
    parentCode: string;
  }
  const handleHeaderFormSubmit = useCallback(
    (reqObj: handleHeaderFormSubmitType) => {
      let payload: any = {};
      if (Boolean(reqObj.acctType)) {
        payload.accTypeValuectx = reqObj.acctType;
      }
      if (Boolean(reqObj.parentCode)) {
        payload.parentCodectx = reqObj.parentCode;
      }
      if (Boolean(reqObj.reqID)) {
        payload.req_cd_ctx = reqObj.reqID;
      }
      dispatch({
        type: "update_accTypeValuectx",
        payload: { ...payload },
      });
    },
    []
  );

  const handleAcctTypeValue = useCallback((value) => {
    dispatch({
      type: "update_accTypeValuectx",
      payload: { accTypeValuectx: value },
    });
  }, []);

  const handleApiRes = useCallback((apiRes) => {
    // console.log("asdasdas>>", apiRes)
    let steps: any[] = [];
    apiRes.forEach((element: any, index) => {
      steps.push({
        tabName: element?.TAB_DISPL_NAME,
        icon: element?.ICON,
        isVisible: element?.isVisible ?? true,
        tabNameFlag: element?.TAB_NAME,
        isViewed: index === 0 ? true : false,
      });
    });
    const PARAM320 = apiRes?.[0]?.PARA_320; // enable/disable fields in main tab
    const GPARAM155 = apiRes?.[0]?.GPARA_155; // hide/display fields
    const LF_NO = apiRes?.[0]?.LF_NO; // hide/ disable Minor/Major and Lendger No. Field
    const CCTLCA = apiRes?.[0]?.CCTLCA; // hide/ disable Investment, UAD, NUD, Turnover field
    const IS_NBFC = apiRes?.[0]?.IS_NBFC; // hide/ disable Additional Details Fields.
    const FIELD_LIST = apiRes?.[0]?.FIELD_LIST; // enable/ disable field that get in this key when get param 320 Y
    const DISABLE_INT_RATE = apiRes?.[0]?.DISABLE_INT_RATE; // enable/ disable Interest Rate
    const DISABLE_PENAL_RATE = apiRes?.[0]?.DISABLE_PENAL_RATE; // enable/ disable Panel Rate
    const DISABLE_AG_CLR_RATE = apiRes?.[0]?.DISABLE_AG_CLR_RATE; // enable/ disable Against Clearing Rate
    const DISABLE_INSU_DUE_RATE = apiRes?.[0]?.DISABLE_INSU_DUE_RATE; // enable/ disable Insurance Due Rate
    const DISABLE_INSTALLMENT_TYPE = apiRes?.[0]?.DISABLE_INSTALLMENT_TYPE; // enable/ disable Installment Type
    const DISABLE_INT_TYPE = apiRes?.[0]?.DISABLE_INT_TYPE; // enable/ disable Interest Type
    const DISABLE_CLASS_CD = apiRes?.[0]?.DISABLE_CLASS_CD; // enable/ disable Risk Category
    const DISABLE_DUE_AMT = apiRes?.[0]?.DISABLE_DUE_AMT; // enable/ disable  Maturity Amount (in recurring tab)
    const DISABLE_INS_START_DT = apiRes?.[0]?.DISABLE_INS_START_DT; // enable/ disable    Start Date  (in recurring tab)
    const DISABLE_INST_DUE_DT = apiRes?.[0]?.DISABLE_INST_DUE_DT; // enable/ disable Due Date (in recurring tab, hypo tab)
    const DISABLE_TYPE_CD = apiRes?.[0]?.DISABLE_TYPE_CD; // enable/ disable Type Cd (in Term Loan Tab)
    const OPEN_FD = apiRes?.[0]?.OPEN_FD; // display fd details if para value Y in Fix deposit tab
    const DEFAULT_INT_TYPE = apiRes?.[0]?.DEFAULT_INT_TYPE; // Display default value of Interest Type field in all tab
    const CHANGE_RECOMMENED_NM = apiRes?.[0]?.CHANGE_RECOMMENED_NM; // Display Leader Details if get value Y in Recommanded By divider.
    const RELATIONSHIP_DDDW = apiRes?.[0]?.RELATIONSHIP_DDDW; //Change component Type of RealtionShip field if Y then DropDown else textField.
    const INT_RATE_BASE_ON = apiRes?.[0]?.INT_RATE_BASE_ON; //Set Interest rate, panel rate, against clearing rate from which category cd, purpose cd, pts based on flag
    const DEFAULT_INSTALLMENT_TYPE = apiRes?.[0]?.INSTALLMENT_TYPE; // Display default value of INSTALLMENT_TYPE field in Term Loan
    const DEFAULT_TYPE_CD = apiRes?.[0]?.TYPE_CD; // Display default value of TYPE_CD field in Term Loan
    const PARA_297 = apiRes?.[0]?.PARA_297; //get month count in this state, set value in INST_DUE_DT, adding para297 into SANCTION_DT, in TL.
    const VISIBLE_TRADE_INFO = apiRes?.[0]?.VISIBLE_TRADE_INFO; //Y/N, tradeinfo field in main tab should be visible or not.
    const LAST_ACCT_CD = apiRes?.[0]?.LAST_ACCT_CD; //Show Last Opened Account Number.
    const AREA_VISIBLE = apiRes?.[0]?.AREA_VISIBLE;
    const DEF_BRANCH = apiRes?.[0]?.DEF_BRANCH;
    const SHARE_AMT = apiRes?.[0]?.SHARE_AMT;
    const SCREEN_FLAG = apiRes?.[0]?.SCREEN_FLAG;
    const CONFIRMED = apiRes?.[0]?.CONFIRMED;
    const NO_OF_ORN_VISIBLE = apiRes?.[0]?.NO_OF_ORN_VISIBLE; // Show/Hide No of ornament field in Gold Loan tab for Ornament Button
    const INS_START_DT = apiRes?.[0]?.INS_START_DT; // Intial Start Date value for Recurring tab

    dispatch({
      type: "update_ApiResctx",
      payload: {
        tabsApiResctx: apiRes,
        tabNameList: steps,
        param320: PARAM320,
        gparam155: GPARAM155,
        lf_noctx: LF_NO,
        cctlcactx: CCTLCA,
        is_nbfcctx: IS_NBFC,
        CustDataFieldsctx: FIELD_LIST,
        disableIntRatectx: DISABLE_INT_RATE,
        disablePanelRatectx: DISABLE_PENAL_RATE,
        disableAgClearingRatectx: DISABLE_AG_CLR_RATE,
        disableInsuDueRatectx: DISABLE_INSU_DUE_RATE,
        disableInterestTypectx: DISABLE_INT_TYPE,
        disableInstallmentTypectx: DISABLE_INSTALLMENT_TYPE,
        disableRiskCategoryctx: DISABLE_CLASS_CD,
        disableMaturityAmtctx: DISABLE_DUE_AMT,
        disableInstStartDatectx: DISABLE_INS_START_DT,
        disableInstDueDatectx: DISABLE_INST_DUE_DT,
        disableTypeCdctx: DISABLE_TYPE_CD,
        displayFDDetailsctx: OPEN_FD,
        defaultInterestTypectx: DEFAULT_INT_TYPE,
        changeRecommandedLabelctx: CHANGE_RECOMMENED_NM,
        changeRelationshipCompctx: RELATIONSHIP_DDDW,
        setInterestRatectx: INT_RATE_BASE_ON,
        para_297ctx: PARA_297,
        visibleTradeInfoctx: VISIBLE_TRADE_INFO,
        defaultInstallmentTypectx: DEFAULT_INSTALLMENT_TYPE,
        defaultTypeCdctx: DEFAULT_TYPE_CD,
        lastAcctCdctx: LAST_ACCT_CD,
        SHARE_AMT: SHARE_AMT,
        DEF_BRANCH: DEF_BRANCH,
        SCREEN_FLAG: SCREEN_FLAG,
        CONFIRMED: CONFIRMED,
        NO_OF_ORN_VISIBLE: NO_OF_ORN_VISIBLE,
        intialStartDt: INS_START_DT,
      },
    });
  }, []);
  const handleIntroAcct = async () => {
    const currentTabIndex = state?.colTabValuectx ?? 0;
    const currentTabData = state?.tabsApiResctx?.[currentTabIndex] ?? {};
    const introAcVisible = currentTabData?.INTRO_AC_VISIBLE;
    dispatch({
      type: "updateIntro_acctValue",
      payload: {
        diableIntroAcct: introAcVisible,
      },
    });
    return introAcVisible;
  };
  const handleCustFieldsReadOnlyctx = async (metadata: any) => {
    const currentTabIndex = state?.colTabValuectx ?? 0;
    const currentTabData = state?.tabsApiResctx?.[currentTabIndex] ?? {};
    const param320 = currentTabData.PARA_320;
    const tabFieldList = currentTabData.FIELD_LIST?.split(",") ?? [];
    const excludeFieldList =
      currentTabData.EXCLUDE_FIELD_FOR_N_M?.split(",") ?? [];
    const tabName = currentTabData.TAB_NAME;
    if (param320 !== "Y") return;
    const nestedKeys = [
      "branchCodeMetadata",
      "accountTypeMetadata",
      "accountCodeMetadata",
    ];
    // Check if a name should be disabled
    const nameShouldDisable = (name: string) => {
      if (!name) return false;
      if (tabName === "NOMINEE" || tabName === "COLL_DTL") {
        return tabFieldList.includes(name) && !excludeFieldList.includes(name);
      }
      return tabFieldList.includes(name);
    };
    // Check if a field (and its nested) should be disabled
    const shouldDisable = (field: any) => {
      if (nameShouldDisable(field?.name || field?.accessor)) return true;
      // Only disable nested metadata if their own name is in the list
      return nestedKeys.some((key) => nameShouldDisable(field?.[key]?.name));
    };
    // Set readOnly (handle nested metadata separately)
    const setReadOnly = (field: any) => {
      if (nameShouldDisable(field?.name)) {
        field.isReadOnly = true;
      }
      nestedKeys.forEach((key) => {
        if (field?.[key] && nameShouldDisable(field[key]?.name)) {
          field[key].isReadOnly = true;
        }
      });
    };
    // Recursively process fields and arrayFields
    const processFields = (fields: any[] = []) => {
      fields.forEach((field) => {
        if (field?.render?.componentType === "arrayField") {
          // Try both common array field locations
          const subFields = field._fields || field.fields;
          if (Array.isArray(subFields)) processFields(subFields);
        } else if (shouldDisable(field)) {
          setReadOnly(field);
        }
      });
    };
    // Handle simple form
    if (Array.isArray(metadata?.fields)) {
      processFields(metadata.fields);
    }
    // Handle AG Grid columns dynamically
    if (typeof metadata?.columns === "function") {
      const originalColumnsFn = metadata.columns;
      metadata.columns = () => {
        const cols = originalColumnsFn();
        return cols?.map((col) => {
          if (shouldDisable(col)) {
            return {
              ...col,
              isReadOnly: () => true,
            };
          }
          return col;
        });
      };
    }
  };

  const handleColTabChangectx = useCallback((value: any) => {
    dispatch({
      type: "update_colTabValuectx",
      payload: {
        colTabValuectx: value,
      },
    });
  }, []);

  const handleFormModalOpenctx = useCallback(() => {
    dispatch({
      type: "handleFormModalOpen",
      payload: {
        isFormModalOpenctx: true,
        isFreshEntryctx: true,
        formDatactx: {},
      },
    });
  }, []);

  const handleFormModalOpenOnEditctx = (row: any) => {
    let payload = {
      req_cd_ctx: !isNaN(parseInt(row?.REQUEST_ID))
        ? parseInt(row?.REQUEST_ID)
        : "",
      acctNumberctx: row?.ACCT_CD ?? "",
      accTypeValuectx: row?.ACCT_TYPE ?? "",
      isFormModalOpenctx: true,
      isFreshEntryctx: false,
      confirmFlagctx: row?.CONFIRMED,
      rowBranchCodectx: row?.BRANCH_CD,
    };
    dispatch({
      type: "handleCategoryChangectx",
      payload: payload,
    });
  };

  const handleFormLoading = useCallback((isloading: boolean) => {
    dispatch({
      type: "handle_formloading",
      payload: {
        isLoading: isloading,
      },
    });
  }, []);

  const handleCurrFormctx = useCallback(
    (obj) => {
      let currVal = state?.currentFormctx;
      dispatch({
        type: "set_currentFormObj",
        payload: {
          currentFormctx: {
            ...currVal,
            ...obj,
          },
        },
      });
    },
    [state?.currentFormctx]
  );
  const handleStepStatusctx = ({
    status = "error",
    coltabvalue = 0,
    reset = false,
  }) => {
    let payload = { steps: {} };
    if (!Boolean(reset)) {
      payload = {
        steps: {
          ...state?.steps,
          [coltabvalue]: { status: status },
        },
      };
    }
    dispatch({
      type: "update_stepStatus",
      payload: payload,
    });
  };

  const handleUpdateDocument = ({ documents }) => {
    let payload = { documentObj: [] };
    payload = {
      documentObj: documents ? documents : undefined,
    };

    dispatch({
      type: "update_document",
      payload: payload,
    });
  };

  const handleUpdateViewedTabs = ({ tabNameList }) => {
    let payload = {
      tabNameList: tabNameList ? tabNameList : undefined,
    };

    dispatch({
      type: "update_viewedFlag",
      payload: payload,
    });
  };

  const handleUpdateAdvConfig = ({ advConfig }) => {
    let payload = { advConfigObj: [] };
    payload = {
      advConfigObj: advConfig ? advConfig : undefined,
    };

    dispatch({
      type: "update_advConfig",
      payload: payload,
    });
  };
  const handleUpdateLoader = (loading: boolean) => {
    dispatch({
      type: "update_loading",
      payload: { loader: loading },
    });
  };
  const toNextTab = () => {
    const steps = state?.tabNameList.filter((tab) => tab.isVisible);
    const totalTab: any = Array.isArray(steps) && steps.length;
    if (totalTab - 1 > state?.colTabValuectx) {
      handleCurrFormctx({
        colTabValuectx: state?.colTabValuectx + 1,
      });
      handleColTabChangectx(state?.colTabValuectx + 1);
    }
  };

  const onFinalUpdatectx = (val: boolean) => {
    dispatch({
      type: "onFinalUpdate",
      payload: {
        isFinalUpdatectx: val,
      },
    });
  };

  const handleFormDataonSavectx = (data) => {
    dispatch({
      type: "update_formData",
      payload: {
        formDatactx: { ...data },
      },
    });
  };
  const handleBtnDataonSavectx = (data) => {
    dispatch({
      type: "handle_BtnDatas",
      payload: {
        btnDatactx: { ...data },
      },
    });
  };
  const handleFdDetailParactx = (data) => {
    dispatch({
      type: "handle_fdDetailpara",
      payload: {
        fdDetailPara: { ...data },
      },
    });
  };
  const UpdBtnDataonSavectx = (data, buttonNm = "") => {
    let retrieveApiRes = {};
    let payload = {};
    let isVehicle = data?.J_TYPE === "V   ";
    let sectionKey;
    let newData = { ...(state?.UpdDatactx ?? {}) };
    if (buttonNm === "ORNAMENT") {
      newData["ORNAMENT_BUTTON_DTL"] = data;
    } else {
      sectionKey = isVehicle ? "TERMLOAN_BTN_VEH" : "TERMLOAN_BTN_MAC";
      newData = {
        ...state?.UpdDatactx,
        [sectionKey]: {
          ...(state?.UpdDatactx?.[sectionKey] || {}),
          ...data,
        },
      };
    }
    retrieveApiRes = newData;
    payload["UpdDatactx"] = { ...retrieveApiRes };
    dispatch({
      type: "Upd_BtnDatas",
      payload: payload,
    });
  };

  const handlecustomerIDctx = (data) => {
    dispatch({
      type: "update_customerIDctx",
      payload: {
        customerIDctx: data,
      },
    });
  };

  const handleModifiedColsctx = (tabModifiedCols) => {
    dispatch({
      type: "modify_tabCols",
      payload: {
        modifiedFormCols: { ...tabModifiedCols },
      },
    });
  };

  const handleFormDataonRetrievectx = (data) => {
    const allowEdit = data?.MAIN_DETAIL?.ALLOW_EDIT ?? "";
    const allowReopenAcct = data?.MAIN_DETAIL?.ALLOW_REOPEN ?? "";
    const allowCloseAcct = data?.MAIN_DETAIL?.ALLOW_CLOSE ?? "";
    let retrieveApiRes = data;
    const checkBoxFields: string[] = [
      "SALARIED",
      "HANDICAP_FLAG",
      "MOBILE_REG",
      // "INT_SKIP_FLAG",
      "MOBILE_REG_FLAG",
      "SELF_EMPLOYED",
    ];

    // Store original checkbox field values before conversion
    const originalCheckboxValues = {};
    const mainTabFields = retrieveApiRes?.MAIN_DETAIL;
    checkBoxFields?.forEach((checkBoxfield) => {
      if (Object.hasOwn(mainTabFields, checkBoxfield)) {
        // Store original value before conversion
        originalCheckboxValues[checkBoxfield] = mainTabFields[checkBoxfield];

        retrieveApiRes.MAIN_DETAIL[checkBoxfield] = Boolean(
          retrieveApiRes.MAIN_DETAIL[checkBoxfield] &&
            retrieveApiRes.MAIN_DETAIL[checkBoxfield] === "Y"
        )
          ? true
          : false;
      }
    });
    if (retrieveApiRes?.MAIN_DETAIL) {
      retrieveApiRes.MAIN_DETAIL._ORIGINAL_CHECKBOX_VALUES =
        originalCheckboxValues;
    }

    const mobileRegDtl = retrieveApiRes?.MOBILE_REG_DTL;
    // mobileRegDtl?.forEach((row) => {
    //   checkBoxFields.forEach((field) => {
    //     if (Object.hasOwn(row, field)) {
    //       row[field] = Boolean(row[field] && row[field] === "Y") ? true : false;
    //     }
    //   });
    // });

    mobileRegDtl?.forEach((row) => {
      checkBoxFields.forEach((field) => {
        if (Object.hasOwn(row, field)) {
          const value = row[field];
          row[field] =
            value === "" ? "" : value === true || value === "Y" ? true : false;
        }
      });
    });

    const relativeDtl = retrieveApiRes?.RELATIVE_DTL;
    relativeDtl?.forEach((row) => {
      checkBoxFields.forEach((field) => {
        if (Object.hasOwn(row, field)) {
          const value = row[field];
          row[field] =
            value === "" ? "" : value === true || value === "Y" ? true : false;
        }
      });
    });

    const otherAddDtlField = retrieveApiRes?.OTHER_ADDRESS_DTL;
    otherAddDtlField?.forEach((row) => {
      checkBoxFields.forEach((field) => {
        if (Object.hasOwn(row, field)) {
          const value = row[field];
          row[field] =
            value === "" ? "" : value === true || value === "Y" ? true : false;
        }
      });
    });

    const jointAcctDtl = retrieveApiRes?.JOINT_ACCOUNT_DTL;
    jointAcctDtl?.forEach((row) => {
      checkBoxFields.forEach((field) => {
        if (Object.hasOwn(row, field)) {
          const value = row[field];
          row[field] =
            value === "" ? "" : value === true || value === "Y" ? true : false;
        }
      });
    });

    const docDtl = retrieveApiRes?.DOC_MST;
    docDtl?.forEach((row) => {
      ["ACTIVE", "SUBMIT"].forEach((field) => {
        if (Object.hasOwn(row, field)) {
          const value = row[field];
          row[field] =
            value === "" ? "" : value === true || value === "Y" ? true : false;
        }
      });
    });

    let payload = {
      allowEditctx: allowEdit,
      allowReopenAcctctx: allowReopenAcct,
      allowCloseAcctctx: allowCloseAcct,
    };
    if (Boolean(data?.MAIN_DETAIL)) {
      payload["parentCodectx"] = data?.MAIN_DETAIL?.PARENT_CODE ?? "";
      payload["acctModectx"] = data?.MAIN_DETAIL?.ACCT_MODE ?? "";
    }
    if (
      Array.isArray(data?.JOINT_ACCOUNT_DTL) &&
      data?.JOINT_ACCOUNT_DTL?.length > 0
    ) {
      data?.JOINT_ACCOUNT_DTL.forEach((jointRow) => {
        if (jointRow?.J_TYPE) {
          // J, I, N, G, M, U, S
          if (jointRow?.J_TYPE === "J   ") {
            // Joint Holder
            if (retrieveApiRes["JOINT_HOLDER_DTL"]) {
              retrieveApiRes["JOINT_HOLDER_DTL"] = [
                ...retrieveApiRes["JOINT_HOLDER_DTL"],
                jointRow,
              ];
            } else {
              retrieveApiRes["JOINT_HOLDER_DTL"] = [jointRow];
            }
          } else if (jointRow?.J_TYPE === "I   ") {
            // Introductor
            if (retrieveApiRes["JOINT_INTRODUCTOR_DTL"]) {
              retrieveApiRes["JOINT_INTRODUCTOR_DTL"] = [
                ...retrieveApiRes["JOINT_INTRODUCTOR_DTL"],
                jointRow,
              ];
            } else {
              retrieveApiRes["JOINT_INTRODUCTOR_DTL"] = [jointRow];
            }
          } else if (jointRow?.J_TYPE === "N   ") {
            // Nominee
            if (retrieveApiRes["JOINT_NOMINEE_DTL"]) {
              retrieveApiRes["JOINT_NOMINEE_DTL"] = [
                ...retrieveApiRes["JOINT_NOMINEE_DTL"],
                jointRow,
              ];
            } else {
              retrieveApiRes["JOINT_NOMINEE_DTL"] = [jointRow];
            }
          } else if (jointRow?.J_TYPE === "G   ") {
            // Guarantor
            if (retrieveApiRes["JOINT_GUARANTOR_DTL"]) {
              retrieveApiRes["JOINT_GUARANTOR_DTL"] = [
                ...retrieveApiRes["JOINT_GUARANTOR_DTL"],
                jointRow,
              ];
            } else {
              retrieveApiRes["JOINT_GUARANTOR_DTL"] = [jointRow];
            }
          } else if (jointRow?.J_TYPE === "M   ") {
            // Hypothication
            if (retrieveApiRes["JOINT_HYPOTHICATION_DTL"]) {
              retrieveApiRes["JOINT_HYPOTHICATION_DTL"] = [
                ...retrieveApiRes["JOINT_HYPOTHICATION_DTL"],
                jointRow,
              ];
            } else {
              retrieveApiRes["JOINT_HYPOTHICATION_DTL"] = [jointRow];
            }
          } else if (jointRow?.J_TYPE === "U   ") {
            // Guardian
            if (retrieveApiRes["JOINT_GUARDIAN_DTL"]) {
              retrieveApiRes["JOINT_GUARDIAN_DTL"] = [
                ...retrieveApiRes["JOINT_GUARDIAN_DTL"],
                jointRow,
              ];
            } else {
              retrieveApiRes["JOINT_GUARDIAN_DTL"] = [jointRow];
            }
          } else if (jointRow?.J_TYPE === "S   ") {
            // Signatory
            if (retrieveApiRes["JOINT_SIGNATORY_DTL"]) {
              retrieveApiRes["JOINT_SIGNATORY_DTL"] = [
                ...retrieveApiRes["JOINT_SIGNATORY_DTL"],
                jointRow,
              ];
            } else {
              retrieveApiRes["JOINT_SIGNATORY_DTL"] = [jointRow];
            }
          }
        } else {
          console.log("joint type not found");
        }
      });
    }

    payload["retrieveFormDataApiRes"] = { ...retrieveApiRes };
    dispatch({
      type: "update_retrieveFormData",
      payload: payload,
    });
  };
  const handleBtnDataonRetrievectx = (data, buttonNm = "") => {
    let retrieveApiRes = {};
    let payload = {};
    let isVehicle = data?.J_TYPE === "V   ";
    let sectionKey;
    let newData = {};
    if (buttonNm === "ORNAMENT") {
      newData["ORNAMENT_BUTTON_DTL"] = data;
    } else {
      sectionKey = isVehicle ? "TERMLOAN_BTN_VEH" : "TERMLOAN_BTN_MAC";
      newData = {
        ...state?.retrievebtnDataApiRes,
        [sectionKey]: {
          ...(state?.retrievebtnDataApiRes?.[sectionKey] || {}),
          ...data,
        },
      };
    }
    // Create newData by merging existing state with incoming data for the section
    retrieveApiRes = newData;
    payload["retrievebtnDataApiRes"] = { ...retrieveApiRes };
    dispatch({
      type: "update_retrieveBtnData",
      payload: payload,
    });
  };

  const handleSavectx = (e, refs) => {
    // ref(e, "save")
    Promise.all([refs])
      .then((response) => {
        console.log("evalSave in success ", response);
      })
      .catch((err) => {
        console.log("evalSave out catch", err.message);
      });
  };
  //Function definition to deep remove keys if they exist in the object
  //This function will remove use for remove non-required keys from the API request
  function deepRemoveKeysIfExist(obj, flag) {
    // Defined keys to remove based on the flag
    const keysToRemoveJointTab = [
      // "CITY_CD",
      "STATE_CD",
      "COUNTRY_CD",
      "DIST_CD",
      "ACCT_NM",
      "MASKED_MOBILE_NO",
      "MASKED_PHONE",
      "MASKED_PAN_NO",
      "MASKED_UNIQUE_ID",
      "CKYC_NUMBER",
      "MASKED_CONTACT1",
      "MASKED_CONTACT2",
      "MASKED_CONTACT3",
      "MASKED_CONTACT4",
      "MASKED_PASSPORT_NO",
      "FLAG",
    ];
    const keysToRemoveMainTab = [
      "STATE_CD",
      "COUNTRY_CD",
      "MASKED_CONTACT2",
      "MASKED_PAN_NO",
      "LF_NO_1",
      "PATH_PHOTO",
      "STATUS_DISP",
      "MASKED_CONTACT1",
      "MASKED_CONTACT3",
      "MASKED_CONTACT4",
      "MASKED_PASSPORT_NO",
      "AGE",
      "DIST_CD",
      "MASKED_UNIQUE_ID",
      "PARENT_CODE",
      "CUST_RISK_CATEG",
      "RATING_CD",
      "CKYC_NUMBER",
      "CITY",
      "DISTRICT",
      "STATE",
      "COUNTRY",
      "DISABLE_MOB_REG",
      "ALLOW_CLOSE",
      "ALLOW_REOPEN",
      "STATUS_DDDW",
      "ALLOW_EDIT",
      "ALLOW_STATUS_EDIT",
      "NEW_CATEG_CD",
      "FLAG",
      "REF_ACCT_NM",
      "DESCRIPTION",
      "WIDTH_BAL",
    ];
    const keysToRemove =
      flag === "JOINT" ? keysToRemoveJointTab : keysToRemoveMainTab;
    function shouldRemove(obj) {
      if (Array.isArray(obj)) {
        return obj.some((item) => shouldRemove(item));
      }
      if (typeof obj === "object" && obj !== null) {
        for (const key in obj) {
          if (keysToRemove.includes(key)) return true;
          if (key === "_UPDATEDCOLUMNS" && Array.isArray(obj[key])) {
            if (obj[key].some((col) => keysToRemove.includes(col))) return true;
          }
          if (shouldRemove(obj[key])) return true;
        }
      }
      return false;
    }

    function deepRemove(obj) {
      if (Array.isArray(obj)) {
        return obj.map((item) => deepRemove(item));
      }
      if (typeof obj === "object" && obj !== null) {
        const newObj = {};
        for (const key in obj) {
          if (keysToRemove.includes(key)) continue;
          if (key === "_UPDATEDCOLUMNS" && Array.isArray(obj[key])) {
            newObj[key] = obj[key].filter((col) => !keysToRemove.includes(col));
          } else {
            newObj[key] = deepRemove(obj[key]);
          }
        }
        return newObj;
      }
      return obj;
    }

    return shouldRemove(obj) ? deepRemove(obj) : obj;
  }

  const handleUpdatectx = async ({
    COMP_CD,
    BRANCH_CD,
    ACCT_TYPE,
    ACCT_CD,
  }) => {
    let updated_tabs = Object.keys(state?.modifiedFormCols ?? {});
    // let updated_tab_format:any = {}
    let updated_tab_format: any = {};
    // console.log(state?.modifiedFormCols, ":qweewqasdcde1", updated_tabs.length, updated_tabs)
    if (updated_tabs.length > 0) {
      // console.log(":qweewqasdcde2", "reqcd", state?.req_cd_ctx)
      const jointTabsTypes = {
        JOINT_HOLDER_DTL: "J   ",
        JOINT_NOMINEE_DTL: "N   ",
        JOINT_GUARDIAN_DTL: "U   ",
        JOINT_GUARANTOR_DTL: "G   ",
        JOINT_HYPOTHICATION_DTL: "M   ",
        JOINT_SIGNATORY_DTL: "S   ",
        JOINT_INTRODUCTOR_DTL: "I   ",
      };
      const jointTabs = Object.keys(jointTabsTypes);
      let other_data = {
        IsNewRow: false,
        REQ_CD: state?.req_cd_ctx ?? "",
        COMP_CD: COMP_CD ?? "",
        BRANCH_CD: BRANCH_CD ?? "",
        ACCT_TYPE: ACCT_TYPE ?? "",
      };
      let jointOtherData = {};
      if (!Boolean(ACCT_CD)) {
      } else {
        if (!Boolean(other_data?.REQ_CD)) {
          jointOtherData = {
            IS_FROM_JOINT_ACCOUNT_DTL: "Y",
          };
        } else {
          jointOtherData = {
            IS_FROM_JOINT_ACCOUNT_DTL: "N",
          };
        }
      }
      // console.log("feiuqwdwqduyqewd",updated_tabs)
      let dataa = updated_tabs.map(async (TAB, i) => {
        return new Promise((res, rej) => {
          const checkBoxFields: string[] = [
            "SALARIED",
            "HANDICAP_FLAG",
            "MOBILE_REG",
            "INT_SKIP_FLAG",
            "MOBILE_REG_FLAG",
            "SELF_EMPLOYED",
            "ACTIVE",
            "SUBMIT",
            "ACTIVE_FLAG",
            "ACTIVE_FLAG_HIDDEN",
          ];
          let upd;
          if (
            TAB == "RELATIVE_DTL" ||
            TAB == "OTHER_ADDRESS_DTL" ||
            TAB == "DOC_MST" ||
            TAB == "ADVANCE_CONFIG_DTL" ||
            TAB == "MOBILE_REG_DTL" ||
            jointTabs.includes(TAB)
            // TAB == "JOINT_ACCOUNT_DTL"
          ) {
            let oldRow: any[] = [];
            let newRow: any[] = [];
            oldRow =
              state?.retrieveFormDataApiRes[TAB] &&
              state?.retrieveFormDataApiRes[TAB].length > 0
                ? state?.retrieveFormDataApiRes[TAB].map((formRow, i) => {
                    // comment this code due to delete case did'nt work.
                    // let filteredRow = _.pick(
                    //   formRow ?? {},
                    //   state?.modifiedFormCols[TAB] ?? []
                    // );
                    let filteredRow = formRow ?? {};
                    if (TAB == "DOC_MST") {
                      filteredRow["SUBMIT"] = Boolean(filteredRow.SUBMIT)
                        ? "Y"
                        : "N";

                      // filteredRow = filteredRow.map((doc) => ({
                      //   ...doc,
                      //   SUBMIT: Boolean(doc.SUBMIT) ? "Y" : "N",
                      //   IsNewRow: false,
                      // }));
                    }
                    checkBoxFields.forEach((field) => {
                      if (Object.hasOwn(filteredRow, field)) {
                        filteredRow[field] =
                          typeof filteredRow[field] === "boolean"
                            ? Boolean(filteredRow[field])
                              ? "Y"
                              : "N"
                            : filteredRow[field];
                      }
                    });
                    return filteredRow;
                  })
                : [];
            // console.log(oldRow, "wadqwdwq. asdasdawdawqqqqqq", state?.retrieveFormDataApiRes[TAB])

            newRow =
              state?.formDatactx[TAB] && state?.formDatactx[TAB].length > 0
                ? state?.formDatactx[TAB].map((formRow, i) => {
                    let filteredRow = _.pick(
                      formRow ?? {},
                      state?.modifiedFormCols[TAB] ?? []
                    );
                    checkBoxFields.forEach((field) => {
                      if (Object.hasOwn(filteredRow, field)) {
                        filteredRow[field] =
                          typeof filteredRow[field] === "boolean"
                            ? Boolean(filteredRow[field])
                              ? "Y"
                              : "N"
                            : filteredRow[field];
                      }
                    });
                    return filteredRow;
                  })
                : [];
            // console.log(newRow, "wadqwdwq. asdasdawdawqqqqqq new", state?.formDatactx[TAB])
            // console.log("feiuqwdwqduyqewd", TAB)
            const cleanedData = deepRemoveKeysIfExist(newRow, "JOINT");
            if (jointTabs.includes(TAB)) {
              upd = utilFunction.transformDetailDataForDML(
                oldRow ?? [],
                cleanedData ?? [],
                ["SR_CD", jointTabsTypes[TAB]]
              );
              // console.log(oldRow, "iwuefhiwhfew", newRow, upd);
            } else {
              upd = utilFunction.transformDetailDataForDML(
                oldRow ?? [],
                cleanedData ?? [],
                ["SR_CD"]
              );
            }
          } else {
            let oldFormData = _.pick(
              state?.retrieveFormDataApiRes[TAB] ?? {},
              state?.modifiedFormCols[TAB] ?? []
            );
            let newFormData = _.pick(
              state?.formDatactx[TAB] ?? {},
              state?.modifiedFormCols[TAB] ?? []
            );
            checkBoxFields.forEach((field) => {
              if (Object.hasOwn(oldFormData, field)) {
                // Use original value if available, otherwise convert boolean to Y/N
                const originalValue =
                  state?.retrieveFormDataApiRes[TAB]
                    ?._ORIGINAL_CHECKBOX_VALUES?.[field];
                if (originalValue !== undefined) {
                  oldFormData[field] = originalValue;
                } else {
                  oldFormData[field] =
                    typeof oldFormData[field] === "boolean"
                      ? Boolean(oldFormData[field])
                        ? "Y"
                        : "N"
                      : oldFormData[field];
                }
              }
              if (Object.hasOwn(newFormData, field)) {
                newFormData[field] =
                  typeof newFormData[field] === "boolean"
                    ? Boolean(newFormData[field])
                      ? "Y"
                      : "N"
                    : newFormData[field];
              }
            });
            const cleanedData = deepRemoveKeysIfExist(newFormData, "MAIN");
            upd = utilFunction.transformDetailsData(cleanedData, oldFormData);
            // console.log(":qweewqasdcde3", "upd else", upd )
          }
          if (Object.keys(updated_tab_format).includes(TAB)) {
            if (TAB == "DOC_MST") {
              updated_tab_format[TAB] = [
                ...state?.formDatactx[TAB]?.doc_mst_payload,
              ];
            } else if (
              TAB == "RELATIVE_DTL" ||
              TAB == "OTHER_ADDRESS_DTL" ||
              TAB == "ADVANCE_CONFIG_DTL" ||
              TAB == "JOINT_ACCOUNT_DTL" ||
              TAB == "MOBILE_REG_DTL"
            ) {
              updated_tab_format[TAB] = [
                {
                  ...updated_tab_format.TAB,
                  ...upd,
                  ..._.pick(state?.formDatactx[TAB], upd._UPDATEDCOLUMNS),
                  ...other_data,
                },
              ];
            } else {
              updated_tab_format[TAB] = {
                ...updated_tab_format.TAB,
                ...upd,
                ..._.pick(state?.formDatactx[TAB], upd._UPDATEDCOLUMNS),
                ...other_data,
              };
            }
          } else {
            if (TAB == "DOC_MST") {
              // Implement Keys as per Update request in Document.
              // updated_tab_format[TAB] = [
              //     ...state?.formDatactx[TAB]?.doc_mst_payload,
              //   ];
              updated_tab_format[TAB] = state?.formDatactx[
                TAB
              ]?.doc_mst_payload?.map((item) => {
                return {
                  ...item,
                  IS_FROM_MAIN: !Boolean(ACCT_CD)
                    ? ""
                    : !Boolean(item?.REQ_CD)
                    ? "Y"
                    : "N",
                  NEW_FLAG: item?._isNewRow || item?.IsNewRow ? "Y" : "N",
                  _isNewRow: item?._isDeleteRow
                    ? undefined
                    : item?.IsNewRow || item?._isNewRow
                    ? true
                    : false,
                };
              });
            } else if (TAB == "ADVANCE_CONFIG_DTL") {
              updated_tab_format[TAB] = state?.formDatactx[TAB];
            } else if (
              TAB == "RELATIVE_DTL" ||
              TAB == "OTHER_ADDRESS_DTL" ||
              TAB == "ADVANCE_CONFIG_DTL" ||
              TAB == "JOINT_ACCOUNT_DTL" ||
              TAB == "MOBILE_REG_DTL" ||
              jointTabs.includes(TAB)
            ) {
              // Provide Key in request logic.
              let other_data = {
                IsNewRow: false,
                REQ_CD: state?.req_cd_ctx ?? "",
                COMP_CD: COMP_CD ?? "",
                BRANCH_CD: BRANCH_CD ?? "",
                ACCT_TYPE: ACCT_TYPE ?? "",
              };
              let remaningData = {};
              const tabKeyMapping = {
                RELATIVE_DTL: "IS_FROM_RELATIVE_DTL",
                OTHER_ADDRESS_DTL: "IS_FROM_OTH_ADD",
                ADVANCE_CONFIG_DTL: "ADV_CONFIG_MAIN_TABLE",
                MOBILE_REG_DTL: "IS_FROM_MOBILE_REG_DTL",
                JOINT_ACCOUNT_DTL: "IS_FROM_JOINT_ACCOUNT_DTL",
              };
              const tabKey = tabKeyMapping[TAB];
              if (!Boolean(ACCT_CD)) {
              } else {
                if (!Boolean(other_data?.REQ_CD)) {
                  remaningData = {
                    [tabKey]: "Y",
                  };
                } else {
                  remaningData = {
                    [tabKey]: "N",
                  };
                }
              }
              // console.log("asdqwezxc arraytabupdate", TAB, upd)
              // if(Array.isArray(upd._UPDATEDCOLUMNS) && upd._UPDATEDCOLUMNS?.length>0) {
              if (
                (Array.isArray(upd.isDeleteRow) &&
                  upd.isDeleteRow?.length > 0) ||
                (Array.isArray(upd.isNewRow) && upd.isNewRow?.length > 0) ||
                (Array.isArray(upd.isUpdatedRow) &&
                  upd.isUpdatedRow?.length > 0)
              )
                updated_tab_format[TAB] = [
                  {
                    ...upd,
                    ..._.pick(state?.formDatactx[TAB], upd._UPDATEDCOLUMNS),
                    ...other_data,
                    ...remaningData,
                  },
                ];
              // }
            } else {
              // console.log("asdqwezxc other", TAB, upd)
              if (
                Array.isArray(upd._UPDATEDCOLUMNS) &&
                upd._UPDATEDCOLUMNS?.length > 0
              ) {
                let pickedData = _.pick(
                  state?.formDatactx[TAB],
                  upd._UPDATEDCOLUMNS
                );
                checkBoxFields.forEach((field) => {
                  if (Object.hasOwn(pickedData, field)) {
                    pickedData[field] =
                      typeof pickedData[field] === "boolean"
                        ? pickedData[field]
                          ? "Y"
                          : "N"
                        : pickedData[field];
                  }
                });
                updated_tab_format[TAB] = {
                  ...upd,
                  ...pickedData,
                  ...other_data,
                };
              }
            }
          }
          // console.log(":qweewqasdcde3", "updated_tab_format", updated_tab_format )
          // console.log("updated_tab_format[TAB]", updated_tab_format[TAB])
          res(1);
        });
      });
      let isJointTabUpdated: boolean = jointTabs.some(
        (key) => key in updated_tab_format
      );
      if (isJointTabUpdated) {
        let isNewRow: any[] = [],
          isUpdatedRow: any[] = [],
          isDeleteRow: any[] = [];
        jointTabs.forEach((jointTab) => {
          if (Object.hasOwn(updated_tab_format, jointTab)) {
            const {
              isUpdatedRow: updatedRow,
              isNewRow: newRow,
              isDeleteRow: deletedRow,
            } = updated_tab_format[jointTab]?.[0];
            isNewRow = [
              ...isNewRow,
              ...newRow.map((row) => ({ ...row, ACTIVE_FLAG: "Y" })),
            ];
            isUpdatedRow = [...isUpdatedRow, ...updatedRow];
            isDeleteRow = [...isDeleteRow, ...deletedRow];
          }
          delete updated_tab_format?.[jointTab];
        });
        updated_tab_format["JOINT_ACCOUNT_DTL"] = [
          {
            isNewRow,
            isUpdatedRow,
            isDeleteRow,
            ...other_data,
            ...jointOtherData,
          },
        ];
      }
      if (Object.keys(state?.btnDatactx)?.length > 0) {
        const btnDataList: Record<string, any>[] = [];

        if (
          state?.btnDatactx?.["TERMLOAN_BTN_MAC"] &&
          Object.keys(state?.btnDatactx?.["TERMLOAN_BTN_MAC"]).length > 0
        ) {
          btnDataList.push({
            ...state?.btnDatactx?.["TERMLOAN_BTN_MAC"],
          });
        }
        if (
          state?.btnDatactx?.["TERMLOAN_BTN_VEH"] &&
          Object.keys(state?.btnDatactx?.["TERMLOAN_BTN_VEH"]).length > 0
        ) {
          btnDataList.push({
            ...state?.btnDatactx?.["TERMLOAN_BTN_VEH"],
          });
        }
        if (
          state?.btnDatactx?.["ORNAMENT_BUTTON_DTL"] &&
          Object.keys(state?.btnDatactx?.["ORNAMENT_BUTTON_DTL"]).length > 0
        ) {
          updated_tab_format["ORNAMENT_BUTTON_DTL"] =
            state?.btnDatactx?.["ORNAMENT_BUTTON_DTL"];
        }
        if (btnDataList.length > 0) {
          updated_tab_format["TERMLOAN_BTN_DTL"] = btnDataList;
        }
      }
      if (Object.keys(state?.colBtnDatactx)?.length > 0) {
        updated_tab_format["COLLATERAL_BUTTON_DTL"] =
          state?.formDatactx?.COLLATERAL_BUTTON_DTL;
      }
      return { updated_tab_format };
    }
    return { updated_tab_format: {} };
  };

  const handleCloseAcctStatus = (data) => {
    dispatch({
      type: "handle_closeAcctStatus",
      payload: {
        closeAcctStatus: data,
      },
    });
  };
  const handleJointTypeDetails = (data) => {
    dispatch({
      type: "joint_type_dtl",
      payload: {
        jointTypeDtl: data,
      },
    });
  };

  const floatedValue = (keys, data) => {
    for (const key of keys) {
      const raw = data[key];
      // Check if the value is a number-like string
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        data[key] = String(num);
      }
      // If NaN, skip without changing the original value
    }
    return data;
  };

  const handleTabIconDisable = (value) => {
    dispatch({
      type: "buttonDisable",
      payload: {
        isTabDisable: value,
      },
    });
  };

  const handleColBtnData = (data) => {
    dispatch({
      type: "update_colBtnData",
      payload: {
        colBtnDatactx: Array.isArray(data) ? [...data] : data,
      },
    });
  };
  const handleRetrieveColBtnData = (data) => {
    dispatch({
      type: "retrieve_colBtnData",
      payload: {
        retrievecolBtnDatactx: Array.isArray(data) ? [...data] : data,
      },
    });
  };
  const handleOldColBtnData = (data) => {
    dispatch({
      type: "retrieve_oldColBtnData",
      payload: {
        colOldBtnDatactx: Array.isArray(data) ? [...data] : data,
      },
    });
  };
  return (
    <AcctMSTContext.Provider
      value={{
        AcctMSTState: state,
        handleFormLoading,
        handleFromFormModectx,
        handleFormModalClosectx,
        handleFormModalOpenOnEditctx,
        handleReqCDctx,
        handleSidebarExpansionctx,
        handleHeaderFormSubmit,
        handleAcctTypeValue,
        handleApiRes,
        handleCustFieldsReadOnlyctx,
        handleColTabChangectx,
        handleFormModalOpenctx,
        handleCurrFormctx,
        handleStepStatusctx,
        toNextTab,
        onFinalUpdatectx,
        handleFormDataonSavectx,
        handlecustomerIDctx,
        handleModifiedColsctx,
        handleFormDataonRetrievectx,
        handleBtnDataonRetrievectx,
        handleBtnDataonSavectx,
        UpdBtnDataonSavectx,
        handleSavectx,
        handleUpdatectx,
        handleUpdateDocument,
        handleCloseAcctStatus,
        tabFormRefs,
        handleUpdateAdvConfig,
        handleUpdateLoader,
        submitRefs,
        deepRemoveKeysIfExist,
        floatedValue,
        handleFdDetailParactx,
        handleUpdateViewedTabs,
        handleJointTypeDetails,
        handleTabIconDisable,
        handleIntroAcct,
        handleColBtnData,
        handleRetrieveColBtnData,
        handleOldColBtnData,
      }}
    >
      {children}
    </AcctMSTContext.Provider>
  );
};

export default AcctMSTProvider;
