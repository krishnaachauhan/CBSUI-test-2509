import { utilFunction } from "@acuteinfo/common-base";
import { format } from "date-fns";
import _ from "lodash";
import { AuthContext } from "pages_audit/auth";
import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
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

const Reducer = (state, action) => {
  switch (action.type) {
    case "handleFromFormMode":
      return {
        ...state,
        ...action.payload,
      };
    case "handleFormModalOpen":
      return {
        ...state,
        ...action.payload,
      };
    case "handleDraftSave":
      return {
        ...state,
        ...action.payload,
      };
    case "handleFormModalClose":
      return {
        ...state,
        ...action.payload,
      };
    case "update_ApiResctx":
      return {
        ...state,
        ...action.payload,
      };
    // case "update_customerCategoriesctx":
    //     return {
    //         ...state,
    //         ...action.payload
    //     };
    case "handleCategoryChangectx":
      return {
        ...state,
        ...action.payload,
      };
    case "categConstitutionValueUpdate":
      return {
        ...state,
        ...action.payload,
      };
    case "update_accTypeValuectx":
      return {
        ...state,
        ...action.payload,
      };
    case "isMinorOrMajor":
      return {
        ...state,
        ...action.payload,
      };
    case "buttonDisable":
      return {
        ...state,
        ...action.payload,
      };
    case "abortSubmit":
      return {
        ...state,
        ...action.payload,
      };
    case "personalOtherDtlLFno":
      return {
        ...state,
        ...action.payload,
      };
    case "update_kycNoValuectx":
      return {
        ...state,
        ...action.payload,
      };
    case "update_req_cd_ctxctx":
      return {
        ...state,
        ...action.payload,
      };
    case "update_photo_signctx":
      return {
        ...state,
        ...action.payload,
      };
    case "update_isSidebarExpandedctx":
      return {
        ...state,
        ...action.payload,
      };
    case "update_colTabValuectx":
      return {
        ...state,
        ...action.payload,
      };
    case "update_stepStatus":
      return {
        ...state,
        ...action.payload,
      };
    case "update_formData":
      return {
        ...state,
        ...action.payload,
      };
    case "update_formData_NEW":
      return {
        ...state,
        updatedReq: {
          ...state.updatedReq,
          ...action.payload.updatedReq,
        },
      };
    case "save_multiple_ROWS":
      return {
        ...state,
        multipleRows: {
          ...state.multipleRows,
          ...action.payload.multipleRows,
        },
      };
    case "SET_SELECTED_ROW":
      return {
        ...state,
        ...action.payload,
      };

    case "final_update_req":
      return {
        ...state,
        finalUpdatedReq: {
          ...state.finalUpdatedReq,
          ...action.payload.finalUpdatedReq,
        },
      };
    case "other_dtl_final_update_req":
      return {
        ...state,
        updatedOtherDtlReq: {
          ...state.updatedOtherDtlReq,
          ...action.payload.updatedOtherDtlReq,
        },
      };
    case "update_formDataDraft":
      return {
        ...state,
        ...action.payload,
      };
    case "update_retrieveFormData":
      return {
        ...state,
        ...action.payload,
      };
    case "modify_formdata":
      return {
        ...state,
        ...action.payload,
      };
    case "modify_tabCols":
      return {
        ...state,
        ...action.payload,
      };
    case "update_customerIDctx":
      return {
        ...state,
        ...action.payload,
      };
    case "reset_ckyc":
      return {
        ...state,
        ...action.payload,
      };
    case "set_currentFormObj":
      return {
        ...state,
        ...action.payload,
      };
    case "onFinalUpdate":
      return {
        ...state,
        ...action.payload,
      };
    case "panDupReason":
      return {
        ...state,
        ...action.payload,
      };
    case "enable_Contact2_Std2":
      return {
        ...state,
        ...action.payload,
      };
    case "update_loading":
      return {
        ...state,
        ...action.payload,
      };
    case "update_custRetData":
      return {
        ...state,
        ...action.payload,
      };
    case "update_document":
      return {
        ...state,
        ...action.payload,
      };
    case "update_viewedFlag":
      return {
        ...state,
        ...action.payload,
      };
    // case "update_formData_new":
    //   return {
    //     ...state,
    //     formDataCtxNew: {
    //       ...state.formDataCtxNew, // keep existing fields
    //       ...action.payload.formDataCtxNew, // update only passed fields
    //     },
    //   };
    default:
      return state;
  }
};
const useCkycContext = () => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  const { authState } = useContext(AuthContext);
  const stateRef = useRef<any>(state);
  stateRef.current = state;
  const tabFormRefs = useRef<any>([]);
  const headerFormSubmitRef = useRef<any>(false);
  interface handleFromFormModeTyoe {
    formmode?: string | null;
    from?: string | null;
  }
  const handleFromFormModectx = (data: handleFromFormModeTyoe) => {
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
  };
  const handleEnableContactStDFields = (entityType) => {
    dispatch({
      type: "enable_Contact2_Std2",
      payload: {
        isValidateCustCtx: entityType,
      },
    });
  };
  const handleFormModalOpenctx = (entityType) => {
    dispatch({
      type: "handleFormModalOpen",
      payload: {
        entityTypectx: entityType,
        isFreshEntryctx: true,
        formDatactx: {},
      },
    });
  };

  // console.log(state, "state@@@@@@@@");

  const handleFormModalOpenOnEditctx = (recordData) => {
    let payload = {
      // categoryValuectx: recordData[0]?.data?.CATEG_CD ?? null,
      // constitutionValuectx: recordData[0]?.data?.CONSTITUTION_TYPE ?? null,
      entityTypectx: recordData?.[0]?.data?.CUSTOMER_TYPE ?? null,
      isCustActivectx: recordData[0]?.data?.ACTIVE ?? null,
      isFreshEntryctx: false,
      customerIDctx: recordData[0]?.data?.CUSTOMER_ID ?? "",
      kycNoValuectx: recordData[0]?.data?.KYC_NO ?? "",
      inActiveDatectx: recordData[0].data.INACTIVE_DT
        ? format(new Date(recordData[0].data.INACTIVE_DT), "dd/MM/yyyy")
        : "",

      req_cd_ctx: !isNaN(parseInt(recordData[0]?.data?.REQUEST_ID))
        ? parseInt(recordData[0]?.data?.REQUEST_ID)
        : "",
    };
    if (recordData[0]?.data?.CONFIRMED) {
      // A - ALL ,
      // Y - CONFIRMED,
      // M - SENT TO MODIFICATION
      // R - REJECT
      // P - SENT TO CONFIRMATION
      payload["confirmFlagctx"] = recordData[0]?.data?.CONFIRMED;
    }
    if (recordData[0]?.data?.UPD_TAB_FLAG_NM) {
      // D	EXISTING_DOC_MODIFY
      // M	EXISTING_MODIFY
      // O	EXISTING_OTHER_ADD_MODIFY
      // P	EXISTING_PHOTO_MODIFY
      // A	FRESH_MODIFY
      payload["update_casectx"] = recordData[0]?.data?.UPD_TAB_FLAG_NM;
    }
    dispatch({
      type: "handleCategoryChangectx",
      payload: payload,
    });
  };

  const onDraftSavectx = () => {
    dispatch({
      type: "handleDraftSave",
      payload: {
        isFreshEntryctx: false,
        isDraftSavedctx: true,
      },
    });
  };

  const handleFormModalClosectx = () => {
    dispatch({
      type: "handleFormModalClose",
      payload: {
        entityTypectx: null,
        isMinorOrMajor: null,
        personalOtherDtlLFno: null,
        isValidateCustCtx: {},
        colTabValuectx: 0,
        categoryValuectx: null,
        constitutionValuectx: null,
        accTypeValuectx: null,
        kycNoValuectx: "",
        tabsApiResctx: [],
        isFreshEntryctx: false,
        isCustActivectx: null,
        tabNameList: [],
        formDatactx: {},
        steps: {},

        retrieveFormDataApiRes: {},
        req_cd_ctx: "",
        customerIDctx: "",
        inActiveDatectx: "",
        attestatioDtl: {},
        photoBlobctx: null,
        photoBase64ctx: null,
        signBlobctx: null,
        signBase64ctx: null,

        modifiedFormCols: {},
        confirmFlagctx: "",
        update_casectx: "",
        currentFormctx: {
          currentFormRefctx: [],
          currentFormSubmitted: null,
          colTabValuectx: null,
        },
        isFinalUpdatectx: false,
        updatedReq: {},
        multipleRows: {},
        selectedRow: {},
        isAbortSubmit: false,
        isButtonDisable: false,
        finalUpdatedReq: {},
        updatedOtherDtlReq: {},
        panDuplicateReasonctx: "",
        fromctx: "",
        formmodectx: "",
        isDraftSavedctx: false,
        loader: false,
        documentObj: "",
      },
    });
  };

  const handleApiRes = (apiRes) => {
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
    dispatch({
      type: "update_ApiResctx",
      payload: {
        tabsApiResctx: apiRes,
        tabNameList: steps,
      },
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

  // const handleCustCategoryRes = (apiRes) => {
  //     dispatch({
  //         type: "update_customerCategoriesctx",
  //         payload: {
  //             customerCategoriesctx: apiRes
  //         }
  //     })
  // }

  const handleCategoryChangectx = (e, value) => {
    if (value) {
      dispatch({
        type: "handleCategoryChangectx",
        payload: {
          categoryValuectx: value?.value,
          constitutionValuectx: value?.CONSTITUTION_TYPE,
          colTabValuectx: 0,
        },
      });
    } else {
      dispatch({
        type: "handleCategoryChangectx",
        payload: {
          categoryValuectx: null,
          constitutionValuectx: null,
          colTabValuectx: false,
          tabsApiResctx: [],
        },
      });
    }
  };

  const handleAccTypeVal = (value) => {
    dispatch({
      type: "update_accTypeValuectx",
      payload: {
        accTypeValuectx: value,
      },
    });
  };
  const handleMinorMajorVal = (value) => {
    dispatch({
      type: "isMinorOrMajor",
      payload: {
        isMinorOrMajor: value,
      },
    });
  };
  const handleButtonDisable = (value) => {
    dispatch({
      type: "buttonDisable",
      payload: {
        isButtonDisable: value,
      },
    });
  };
  const handleAbortSubmit = (value) => {
    dispatch({
      type: "abortSubmit",
      payload: {
        isAbortSubmit: value,
      },
    });
  };
  const handlepersonalOtherDtlLFno = (value) => {
    dispatch({
      type: "personalOtherDtlLFno",
      payload: {
        personalOtherDtlLFno: value,
      },
    });
  };

  const handleKycNoValctx = (value) => {
    dispatch({
      type: "update_kycNoValuectx",
      payload: {
        kycNoValuectx: value,
      },
    });
  };

  const handleReqCDctx = (value) => {
    dispatch({
      type: "update_req_cd_ctxctx",
      payload: {
        req_cd_ctx: value,
      },
    });
  };

  const handlePhotoOrSignctx = (blob: any, base64: string, img: string) => {
    if (img == "photo") {
      dispatch({
        type: "update_photo_signctx",
        payload: {
          photoBlobctx: blob,
          photoBase64ctx: base64,
        },
      });
    } else if (img === "sign") {
      dispatch({
        type: "update_photo_signctx",
        payload: {
          signBlobctx: blob,
          signBase64ctx: base64,
        },
      });
    }
  };

  const handleSidebarExpansionctx = () => {
    dispatch({
      type: "update_isSidebarExpandedctx",
      payload: {
        isSidebarExpandedctx: !state.isSidebarExpandedctx,
      },
    });
  };

  const handleColTabChangectx = (value: any) => {
    // const {colTabValuectx} = state
    // let tabVal = (value === "INC")
    //             ? parseInt(colTabValuectx+1)
    //             : value === "PRV"
    //                 ? colTabValuectx - 1
    //                 : value
    dispatch({
      type: "update_colTabValuectx",
      payload: {
        // colTabValuectx: (value === "INC") ? parseInt(state.colTabValuectx + 1) : value
        colTabValuectx: value,
      },
      // payload: tabVal
    });
  };

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

  const toPrevTab = () => {
    if (state?.colTabValuectx > 0) {
      handleCurrFormctx({
        colTabValuectx: state?.colTabValuectx - 1,
      });
      handleColTabChangectx(state?.colTabValuectx - 1);
    }
  };

  const handleFormDataonSavectx = (data) => {
    dispatch({
      type: "update_formData",
      payload: {
        formDatactx: { ...data },
      },
    });
  };
  const handleFormDataonSavectxNew = (data) => {
    dispatch({
      type: "update_formData_NEW",
      payload: {
        updatedReq: data,
      },
    });
  };
  const handleSaveMultipleRowctx = (data) => {
    dispatch({
      type: "save_multiple_ROWS",
      payload: {
        multipleRows: data,
      },
    });
  };
  const handleSaveSelectedRowctx = (data) => {
    dispatch({
      type: "SET_SELECTED_ROW",
      payload: {
        selectedRow: data,
      },
    });
  };
  const handleFinalUpdateReq = (data) => {
    dispatch({
      type: "final_update_req",
      payload: {
        finalUpdatedReq: data,
      },
    });
  };

  const handleFormOtherDtlData = (data) => {
    dispatch({
      type: "other_dtl_final_update_req",
      payload: {
        updatedOtherDtlReq: data,
      },
    });
  };

  // const handleFormDataonSavectxNew = (data) => {
  //   dispatch({
  //     type: "update_formData_new",
  //     payload: {
  //       formDataCtxNew: { ...data },
  //     },
  //   });
  // };
  const handleOtherExtDtlctx = (data) => {
    dispatch({
      type: "update_formData",
      payload: {
        otherExtDetailsctx: { ...data },
      },
    });
  };

  const handlePanDupReason = (data) => {
    dispatch({
      type: "panDupReason",
      payload: {
        panDuplicateReasonctx: data,
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
    let payload = {
      // retrieveFormDataApiRes: {...retrieveApiRes},
      accTypeValuectx: data?.["PERSONAL_DETAIL"]?.ACCT_TYPE ?? "", //ACCT_TYPE
    };
    // retrieved-entry/fresh, but not saved as draft
    if (!Boolean(state?.isFreshEntryctx) || !Boolean(state?.isDraftSavedctx)) {
      if (
        data &&
        data.PERSONAL_DETAIL &&
        Object?.keys(data?.PERSONAL_DETAIL)?.length > 0
      ) {
        let personalDtl = data.PERSONAL_DETAIL;
        const personalDtlDateFields: string[] = [
          "BIRTH_DT",
          "KYC_REVIEW_DT",
          "RISK_REVIEW_DT",
          "DATE_OF_DEATH",
          "INACTIVE_DT",
          "LEI_EXPIRY_DATE",
          "PASSPORT_ISSUE_DT",
          "PASSPORT_EXPIRY_DT",
          "DRIVING_LICENSE_ISSUE_DT",
          "DRIVING_LICENSE_EXPIRY_DT",
          "COMMENCEMENT_DT",
          "LIQUIDATION_DT",
          "FATCA_DT",
          "DATE_OF_COMMENCEMENT",
        ];
        const personalDtlCheckBoxFields: string[] = [
          "SAME_AS_PER",
          "ADHAR_PAN_LINK",
          "ACTIVE_FLAG",
        ];
        personalDtlDateFields.forEach((fieldNm) => {
          if (Boolean(personalDtl[fieldNm])) {
            personalDtl[fieldNm] = format(
              utilFunction.getParsedDate(personalDtl[fieldNm]),
              "dd-MMM-yyyy"
            );
          }
        });

        personalDtlCheckBoxFields.forEach((fieldNm) => {
          if (Object.prototype.hasOwnProperty.call(personalDtl, fieldNm)) {
            if (personalDtl[fieldNm] === "Y") {
              personalDtl[fieldNm] = true;
            } else if (personalDtl[fieldNm] === "N") {
              personalDtl[fieldNm] = false;
            } else if (typeof personalDtl[fieldNm] !== "boolean") {
              personalDtl[fieldNm] = false;
            }
          }
        });
        personalDtl.PAN_NO_HIDDEN = personalDtl?.PAN_NO ?? "";
        data["PERSONAL_DETAIL"] = personalDtl;
        const setCategData = {
          CONSTITUTION_TYPE: data?.PERSONAL_DETAIL?.CONSTITUTION_TYPE,
          value: data?.PERSONAL_DETAIL?.CATEG_CD,
        };

        handleCategoryChangectx("", setCategData);
      }

      // PHOTO_MST - getting photo sign on retrieve form data to populate images
      if (data && data.PHOTO_MST) {
        // photoBase64ctx
        // signBase64ctx
        // if(data.PHOTO_MST) {
        payload["photoBase64ctx"] = data.PHOTO_MST.CUST_PHOTO;
        payload["signBase64ctx"] = data.PHOTO_MST.CUST_SIGN;
        // }
      }

      if (data && data?.RELATED_PERSON_DTL) {
        let relPersonDtl = data?.RELATED_PERSON_DTL;
        const relPersonDateFields: string[] = [
          "DRIVING_LICENSE_EXPIRY_DT",
          "PASSPORT_EXPIRY_DT",
        ];
        if (Array.isArray(relPersonDtl) && relPersonDtl.length > 0) {
          relPersonDtl = relPersonDtl.map((row) => {
            relPersonDateFields.forEach((fieldNm) => {
              if (Boolean(row[fieldNm])) {
                row[fieldNm] = format(
                  utilFunction.getParsedDate(row[fieldNm]),
                  "dd-MMM-yyyy"
                );
              }
            });
            if (row?.hasOwnProperty("ACTIVE")) {
              row.ACTIVE = row?.ACTIVE === "Y" ? true : false;
            }
            if (row?.hasOwnProperty("CONFIRMED")) {
              row.CONFIRMED = row?.CONFIRMED === "Y" ? true : false;
            }
            row.HIDE_CHECK = true;
            row.ROW_EXIST = "Y";
            return row;
          });
        }
        data["RELATED_PERSON_DTL"] = relPersonDtl;
        handleSaveMultipleRowctx({
          RELATED_PERSON_DTL: relPersonDtl ?? [],
        });
      }
      if (data && data?.OTHER_ADDRESS) {
        let othAddDtl = data?.OTHER_ADDRESS;

        if (Array.isArray(othAddDtl) && othAddDtl.length > 0) {
          othAddDtl = othAddDtl.map((row) => {
            if (row?.hasOwnProperty("ACTIVE")) {
              row.ACTIVE = row?.ACTIVE === "Y" ? true : false;
            }
            if (row?.hasOwnProperty("CONFIRMED")) {
              row.CONFIRMED = row?.CONFIRMED === "Y" ? true : false;
            }
            row.HIDE_CHECK = true;
            return row;
          });
        }
        data["OTHER_ADDRESS"] = othAddDtl;
        handleSaveMultipleRowctx({
          OTHER_ADDRESS: othAddDtl ?? [],
        });
      }

      if (
        data &&
        data?.OTHER_DTL &&
        Object?.keys(data?.OTHER_DTL)?.length > 0
      ) {
        let otherDtl = data?.OTHER_DTL;
        const otherDtlDateFields: string[] = ["JOINING_DT", "RETIREMENT_DT"];
        otherDtlDateFields.forEach((fieldNm) => {
          if (Boolean(otherDtl[fieldNm])) {
            otherDtl[fieldNm] = format(
              utilFunction.getParsedDate(otherDtl[fieldNm]),
              "dd-MMM-yyyy"
            );
          }
        });
        const otherDtlCheckboxes = [
          "POLITICALLY_CONNECTED",
          "BLINDNESS",
          "REFERRED_BY_STAFF",
        ];
        otherDtlCheckboxes.forEach((fieldNm) => {
          if (Object.prototype.hasOwnProperty.call(otherDtl, fieldNm)) {
            if (otherDtl[fieldNm] === "Y") {
              otherDtl[fieldNm] = true;
            } else if (otherDtl[fieldNm] === "N") {
              otherDtl[fieldNm] = false;
            } else if (typeof otherDtl[fieldNm] !== "boolean") {
              otherDtl[fieldNm] = false;
            }
          }
        });
        otherDtl.SOURCE_OF_INCOME_DDW = otherDtl.SOURCE_OF_INCOME;
        otherDtl.COMPANY_NM_OPTION = otherDtl.COMPANY_NM;
        data["OTHER_DTL"] = otherDtl;
      }

      if (data && data.DOC_MST) {
        let resData = data?.DOC_MST;
        if (resData?.length > 0) {
          resData = resData?.map((doc, index) => {
            let newDoc = doc;
            newDoc["SUBMIT"] = doc.SUBMIT === "Y" ? true : false;
            newDoc["UNIQUE_ID"] = index + 1;
            return newDoc;
          });
        }

        data = { ...data, DOC_MST: resData };
      }

      if (data && data.NRI_DTL && Object?.keys(data?.NRI_DTL)?.length > 0) {
        let nriDtl = data.NRI_DTL;
        const nriDateFields: string[] = ["VISA_ISSUE_DT", "VISA_EXPIRY_DT"];
        nriDateFields.forEach((fieldNm) => {
          if (Boolean(nriDtl[fieldNm])) {
            nriDtl[fieldNm] = format(
              utilFunction.getParsedDate(nriDtl[fieldNm]),
              "dd-MMM-yyyy"
            );
          }
        });
        data["NRI_DTL"] = nriDtl;
      }
    }

    payload["retrieveFormDataApiRes"] = { ...data };
    dispatch({
      type: "update_retrieveFormData",
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

  const onFinalUpdatectx = (val: boolean) => {
    dispatch({
      type: "onFinalUpdate",
      payload: {
        isFinalUpdatectx: val,
      },
    });
  };

  const handleFormDataonDraftctx = (data) => {
    dispatch({
      type: "update_formDataDraft",
      // payload: {
      //     formDataDraftctx: {
      //         // ...state.formDataDraftctx ,
      //         personal_details: {...state.formDataDraftctx.personal_details, ...data}
      //     }
      // }
      payload: data,
    });
  };

  const handleSaveAsDraft = () => {
    const remainingData = {
      IsNewRow: true,
      REQ_CD: "",
      REQ_FLAG: "F",
      SAVE_FLAG: "D",
      ENTRY_TYPE: "F",
      CUSTOMER_ID: "",
    };
    const remainingPD = {
      IsNewRow: true,
      CUSTOMER_TYPE: state?.entityTypectx,
      CATEGORY_CD: state?.categoryValuectx,
      COMP_CD: "132 ",
      BRANCH_CD: "099 ",
      ACCT_TYPE: state?.accTypeValuectx,
      REQ_FLAG: "",
      CONSTITUTION_TYPE: "I",
    };
  };

  const resetCkycctx = () => {
    // dispatch({
    //     type: "reset_ckyc",
    //     payload: {
    //     }
    // })
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

  const handleUpdatectx = async ({ COMP_CD }) => {
    let update_type = "";
    const modifiedCols = stateRef?.current?.modifiedFormCols ?? {};
    const updated_tabs = Object.keys(modifiedCols);
    const { formDatactx, retrieveFormDataApiRes, req_cd_ctx } =
      stateRef.current;

    let updated_tab_format: any = {};
    if (updated_tabs.length === 0) {
      return { updated_tab_format: {}, update_type: "full_save" };
    }

    const other_data = {
      IsNewRow: !req_cd_ctx,
      REQ_CD: req_cd_ctx ?? "",
      COMP_CD: COMP_CD ?? "",
    };

    // Helper for array tabs
    const processArrayTab = (tab) => {
      const oldRows = Array.isArray(retrieveFormDataApiRes[tab])
        ? retrieveFormDataApiRes[tab].map((row) => {
            let filteredRow = _.pick(row ?? {}, modifiedCols[tab] ?? []);
            // Convert CONFIRMED and ACTIVE boolean to "Y"/"N"
            // if ("CONFIRMED" in filteredRow) {
            //   filteredRow.CONFIRMED = Boolean(row.CONFIRMED) ? "Y" : "N";
            // }
            // if ("ACTIVE" in filteredRow) {
            //   filteredRow.ACTIVE = Boolean(row.ACTIVE) ? "Y" : "N";
            // }
            return filteredRow;
          })
        : [];
      const newRows = Array.isArray(formDatactx[tab])
        ? formDatactx[tab].map((row) => {
            let filteredRow = _.pick(row ?? {}, modifiedCols[tab] ?? []);
            // Convert CONFIRMED and ACTIVE boolean to "Y"/"N"
            // if ("CONFIRMED" in filteredRow) {
            //   filteredRow.CONFIRMED = Boolean(row.CONFIRMED) ? "Y" : "N";
            // }
            // if ("ACTIVE" in filteredRow) {
            //   filteredRow.ACTIVE = Boolean(row.ACTIVE) ? "Y" : "N";
            // }
            return filteredRow;
          })
        : [];
      return utilFunction.transformDetailDataForDML(oldRows, newRows, [
        "SR_CD",
      ]);
    };

    // Helper for object tabs
    const processObjectTab = (tab) => {
      const oldData = _.pick(
        retrieveFormDataApiRes[tab] ?? {},
        modifiedCols[tab] ?? []
      );
      const newData = _.pick(formDatactx[tab] ?? {}, modifiedCols[tab] ?? []);
      return utilFunction.transformDetailsData(newData, oldData);
    };

    for (const TAB of updated_tabs) {
      let upd;
      if (TAB === "DOC_MST") {
        updated_tab_format[TAB] = [
          ...(formDatactx[TAB]?.doc_mst_payload ?? []),
        ];
        continue;
      }

      if (TAB === "OTHER_ADDRESS" || TAB === "RELATED_PERSON_DTL") {
        upd = processArrayTab(TAB);

        if (
          (Array.isArray(upd.isDeleteRow) && upd.isDeleteRow.length > 0) ||
          (Array.isArray(upd.isNewRow) && upd.isNewRow.length > 0) ||
          (Array.isArray(upd.isUpdatedRow) && upd.isUpdatedRow.length > 0) ||
          (Array.isArray(upd._UPDATEDCOLUMNS) && upd._UPDATEDCOLUMNS.length > 0)
        ) {
          if (Boolean(state?.req_cd_ctx) && Boolean(state?.customerIDctx)) {
            updated_tab_format[TAB] = {
              DETAILS_DATA: {
                ...upd,
                ..._.pick(formDatactx[TAB], upd._UPDATEDCOLUMNS),
                ...other_data,
              },
            };
          } else if (
            Boolean(state?.req_cd_ctx) &&
            !Boolean(state?.customerIDctx)
          ) {
            updated_tab_format[TAB] = [
              {
                ...upd,
                ..._.pick(formDatactx[TAB], upd._UPDATEDCOLUMNS),
                ...other_data,
              },
            ];
          }
        }
        continue;
      }

      if (TAB === "PHOTO_MST") {
        upd = processObjectTab(TAB);
        if (
          Array.isArray(upd._UPDATEDCOLUMNS) &&
          upd._UPDATEDCOLUMNS.length > 0
        ) {
          updated_tab_format[TAB] = {
            ...upd,
            ..._.pick(formDatactx[TAB], upd._UPDATEDCOLUMNS),
            ...other_data,
            SR_CD: retrieveFormDataApiRes[TAB]?.SR_CD ?? "",
          };
        }
        continue;
      }

      // Default: object tab
      upd = processObjectTab(TAB);
      if (
        Array.isArray(upd._UPDATEDCOLUMNS) &&
        upd._UPDATEDCOLUMNS.length > 0
      ) {
        updated_tab_format[TAB] = {
          ...upd,
          ..._.pick(formDatactx[TAB], upd._UPDATEDCOLUMNS),
          ...other_data,
        };
      }
    }

    // Set update_type
    if (typeof updated_tab_format === "object") {
      if (
        Object.keys(updated_tab_format).length === 1 &&
        Object.keys(updated_tab_format).includes("PERSONAL_DETAIL")
      ) {
        update_type = "save_as_draft";
      } else if (Object.keys(updated_tab_format).length > 0) {
        update_type = "full_save";
      }
    }

    return { updated_tab_format, update_type };
  };

  const handleUpdateLoader = (loading: boolean) => {
    dispatch({
      type: "update_loading",
      payload: { loader: loading },
    });
  };
  const handleUpdCustRetData = (data) => {
    dispatch({
      type: "update_custRetData",
      payload: { custRetData: data },
    });
  };
  const mergePersonalDetailsInUpdatedReq = (updatedReq) => {
    const sections = [
      "PERSONAL_DETAIL_PD",
      "PERSONAL_DETAIL_OD",
      "PERSONAL_DETAIL_KYC_POI",
      "PERSONAL_DETAIL_KYC_POA",
      "PERSONAL_DETAIL_DEC",
      "PERSONAL_ENTITY_REF",
      "PERSONAL_DETAIL_HEADER_FORM",
    ];

    const mergedDetail = {};
    const mergedOldRowValue = {};
    const mergedUpdatedColumns = new Set(); // Use Set to avoid duplicates

    for (const section of sections) {
      const data = updatedReq?.[section];
      if (!data) continue;

      if (data) {
        // Merge main fields except _OLDROWVALUE and _UPDATEDCOLUMNS
        for (const [key, value] of Object.entries(data)) {
          if (key !== "_OLDROWVALUE" && key !== "_UPDATEDCOLUMNS") {
            mergedDetail[key] = value;
          }
        }

        // Merge _OLDROWVALUE
        if (data._OLDROWVALUE && Object.keys(data._OLDROWVALUE).length > 0) {
          Object.assign(mergedOldRowValue, data._OLDROWVALUE);
        }

        // Merge _UPDATEDCOLUMNS
        if (
          Array.isArray(data._UPDATEDCOLUMNS) &&
          data._UPDATEDCOLUMNS.length > 0
        ) {
          data._UPDATEDCOLUMNS.forEach((col) => mergedUpdatedColumns.add(col));
        }
      }
    }

    // Conditionally add _OLDROWVALUE and _UPDATEDCOLUMNS
    if (Object.keys(mergedOldRowValue).length > 0) {
      mergedDetail["_OLDROWVALUE"] = mergedOldRowValue;
    }

    if (mergedUpdatedColumns.size > 0) {
      mergedDetail["_UPDATEDCOLUMNS"] = Array.from(mergedUpdatedColumns);
    }
    if (!Boolean(state?.req_cd_ctx) && !Boolean(state?.customerIDctx)) {
      delete mergedDetail["_OLDROWVALUE"];
      delete mergedDetail["_UPDATEDCOLUMNS"];
    }

    const {
      PERSONAL_DETAIL_PD,
      PERSONAL_DETAIL_OD,
      PERSONAL_DETAIL_KYC_POI,
      PERSONAL_DETAIL_KYC_POA,
      PERSONAL_DETAIL_DEC,
      PERSONAL_ENTITY_REF,
      PERSONAL_DETAIL_HEADER_FORM,
      ...rest
    } = updatedReq;

    const commonDataAdded = {
      ...mergedDetail,
      IsNewRow: Boolean(stateRef?.current?.customerIDctx)
        ? !Boolean(stateRef?.current?.req_cd_ctx)
        : !Boolean(
            Object?.keys(
              state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
            )?.length > 0
          ),
      CUSTOMER_TYPE: stateRef?.current?.entityTypectx,
      CONSTITUTION_TYPE: stateRef?.current?.constitutionValuectx,
      COMP_CD: !Boolean(stateRef?.current?.customerIDctx)
        ? authState?.companyID
        : stateRef?.current?.retrieveFormDataApiRes["PERSONAL_DETAIL"]
            ?.COMP_CD ?? "",
      BRANCH_CD: !Boolean(stateRef?.current?.customerIDctx)
        ? authState?.user?.branchCode
        : stateRef?.current?.retrieveFormDataApiRes["PERSONAL_DETAIL"]
            ?.BRANCH_CD ?? "",
      REQ_FLAG: Boolean(stateRef?.current?.customerIDctx) ? "E" : "F",
      CATEG_CD: stateRef?.current?.categoryValuectx,
      KYC_NUMBER: stateRef?.current?.kycNoValuectx ?? "",
      APPLICATION_TYPE: "01",
      ENT_COMP_CD: authState?.companyID ?? "",
      ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
    };
    // if (Object?.keys(mergedDetail)?.length > 0) {
    //   return {
    //     ...rest,
    //     PERSONAL_DETAIL: {
    //       ...mergedDetail,
    //       ...commonDataAdded,
    //     },
    //   };
    // }
    // return { ...rest };
    if (
      Boolean(Object?.keys(mergedDetail)?.length > 0) &&
      (Boolean(state?.req_cd_ctx) || Boolean(state?.customerIDctx))
    ) {
      if (
        Object?.keys(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {})
          ?.length > 0
      ) {
        if (
          commonDataAdded["_OLDROWVALUE"] &&
          Object.keys(commonDataAdded["_OLDROWVALUE"]).length > 0 &&
          Array.isArray(commonDataAdded["_UPDATEDCOLUMNS"]) &&
          commonDataAdded["_UPDATEDCOLUMNS"].length > 0
        ) {
          return {
            ...rest,
            PERSONAL_DETAIL: commonDataAdded,
          };
        } else {
          return {};
        }
      } else {
        return {
          ...rest,
          PERSONAL_DETAIL: commonDataAdded,
        };
      }
    } else if (
      Boolean(Object?.keys(mergedDetail)?.length > 0) &&
      !Boolean(state?.req_cd_ctx) &&
      !Boolean(state?.customerIDctx)
    ) {
      return {
        ...rest,
        PERSONAL_DETAIL: commonDataAdded,
      };
    }

    // if (
    //   Boolean(Object?.keys(mergedDetail)?.length > 0) &&
    //   (Boolean(state?.req_cd_ctx) || Boolean(state?.customerIDctx)) &&
    //   commonDataAdded["_OLDROWVALUE"] &&
    //   Object.keys(commonDataAdded["_OLDROWVALUE"]).length > 0 &&
    //   Array.isArray(commonDataAdded["_UPDATEDCOLUMNS"]) &&
    //   commonDataAdded["_UPDATEDCOLUMNS"].length > 0
    // ) {
    //   return {
    //     ...rest,
    //     PERSONAL_DETAIL: commonDataAdded,
    //   };
    // } else if (
    //   Boolean(Object?.keys(mergedDetail)?.length > 0) &&
    //   !Boolean(state?.req_cd_ctx) &&
    //   !Boolean(state?.customerIDctx)
    // ) {
    //   return {
    //     ...rest,
    //     PERSONAL_DETAIL: commonDataAdded,
    //   };
    // } else if (
    //   (Boolean(Object?.keys(mergedDetail)?.length > 0) &&
    //     Boolean(state?.req_cd_ctx)) ||
    //   Boolean(state?.customerIDctx)
    // ) {
    //   return {
    //     ...rest,
    //     PERSONAL_DETAIL: commonDataAdded,
    //   };
    // } else {
    //   return {};
    // }
  };

  const mergeOtherDtlFn = (updatedReq) => {
    const sections = ["COMPANY_INFO", "MORE_DTL"];

    const mergedDetail = {};
    const mergedOldRowValue = {};
    const mergedUpdatedColumns = new Set(); // Use Set to avoid duplicates

    for (const section of sections) {
      const data = updatedReq?.[section];
      if (!data) continue;

      if (data) {
        // Merge main fields except _OLDROWVALUE and _UPDATEDCOLUMNS
        for (const [key, value] of Object.entries(data)) {
          if (key !== "_OLDROWVALUE" && key !== "_UPDATEDCOLUMNS") {
            mergedDetail[key] = value;
          }
        }

        // Merge _OLDROWVALUE
        if (data._OLDROWVALUE && Object.keys(data._OLDROWVALUE).length > 0) {
          Object.assign(mergedOldRowValue, data._OLDROWVALUE);
        }

        // Merge _UPDATEDCOLUMNS
        if (
          Array.isArray(data._UPDATEDCOLUMNS) &&
          data._UPDATEDCOLUMNS.length > 0
        ) {
          data._UPDATEDCOLUMNS.forEach((col) => mergedUpdatedColumns.add(col));
        }
      }
    }

    // Conditionally add _OLDROWVALUE and _UPDATEDCOLUMNS
    if (Object.keys(mergedOldRowValue).length > 0) {
      mergedDetail["_OLDROWVALUE"] = mergedOldRowValue;
    }

    if (mergedUpdatedColumns.size > 0) {
      mergedDetail["_UPDATEDCOLUMNS"] = Array.from(mergedUpdatedColumns);
    }
    if (!Boolean(state?.req_cd_ctx) && !Boolean(state?.customerIDctx)) {
      delete mergedDetail["_OLDROWVALUE"];
      delete mergedDetail["_UPDATEDCOLUMNS"];
    }

    const { COMPANY_INFO, MORE_DTL, ...rest } = updatedReq;

    const commonDataAdded = {
      ...mergedDetail,
      IsNewRow: Boolean(stateRef?.current?.customerIDctx)
        ? !Boolean(stateRef?.current?.req_cd_ctx)
        : !Boolean(
            Object?.keys(state?.retrieveFormDataApiRes?.["OTHER_DTL"] ?? {})
              ?.length > 0
          ),
      COMP_CD: !Boolean(stateRef?.current?.customerIDctx)
        ? authState?.companyID
        : stateRef?.current?.retrieveFormDataApiRes["PERSONAL_DETAIL"]
            ?.COMP_CD ?? "",
      BRANCH_CD: !Boolean(stateRef?.current?.customerIDctx)
        ? authState?.user?.branchCode
        : stateRef?.current?.retrieveFormDataApiRes["PERSONAL_DETAIL"]
            ?.BRANCH_CD ?? "",
      REQ_FLAG: Boolean(stateRef?.current?.customerIDctx) ? "E" : "F",
      ENT_COMP_CD: authState?.companyID ?? "",
      ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
    };

    // if (Object?.keys(mergedDetail)?.length > 0) {
    //   return {
    //     ...rest,
    //     OTHER_DTL: {
    //       ...mergedDetail,
    //       ...commonDataAdded,
    //     },
    //   };
    // }
    // return { ...rest };

    if (
      Boolean(Object?.keys(mergedDetail)?.length > 0) &&
      (Boolean(state?.req_cd_ctx) || Boolean(state?.customerIDctx))
    ) {
      if (
        Object?.keys(state?.retrieveFormDataApiRes?.["OTHER_DTL"] ?? {})
          ?.length > 0
      ) {
        if (
          commonDataAdded["_OLDROWVALUE"] &&
          Object.keys(commonDataAdded["_OLDROWVALUE"]).length > 0 &&
          Array.isArray(commonDataAdded["_UPDATEDCOLUMNS"]) &&
          commonDataAdded["_UPDATEDCOLUMNS"].length > 0
        ) {
          return {
            ...rest,
            OTHER_DTL: commonDataAdded,
          };
        } else {
          return {};
        }
      } else {
        return {
          ...rest,
          OTHER_DTL: commonDataAdded,
        };
      }
    } else if (
      Boolean(Object?.keys(mergedDetail)?.length > 0) &&
      !Boolean(state?.req_cd_ctx) &&
      !Boolean(state?.customerIDctx)
    ) {
      return {
        ...rest,
        OTHER_DTL: commonDataAdded,
      };
    }

    // if (
    //   Boolean(Object?.keys(mergedDetail)?.length > 0) &&
    //   (Boolean(state?.req_cd_ctx) || Boolean(state?.customerIDctx)) &&
    //   commonDataAdded["_OLDROWVALUE"] &&
    //   Object.keys(commonDataAdded["_OLDROWVALUE"]).length > 0 &&
    //   Array.isArray(commonDataAdded["_UPDATEDCOLUMNS"]) &&
    //   commonDataAdded["_UPDATEDCOLUMNS"].length > 0
    // ) {
    //   return {
    //     ...rest,
    //     OTHER_DTL: commonDataAdded,
    //   };
    // } else if (
    //   Boolean(Object?.keys(mergedDetail)?.length > 0) &&
    //   !Boolean(state?.req_cd_ctx) &&
    //   !Boolean(state?.customerIDctx)
    // ) {
    //   return {
    //     ...rest,
    //     OTHER_DTL: commonDataAdded,
    //   };
    // } else if (
    //   (Boolean(Object?.keys(mergedDetail)?.length > 0) &&
    //     Boolean(state?.req_cd_ctx)) ||
    //   Boolean(state?.customerIDctx)
    // ) {
    //   return {
    //     ...rest,
    //     OTHER_DTL: commonDataAdded,
    //   };
    // } else {
    //   return {};
    // }
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

  const checkArrFieldLength = (data, reqCd, customerId) => {
    if (!data) return false;

    if (!reqCd && !customerId) {
      return Array.isArray(data) && data?.length > 0;
    }

    const entries = Array.isArray(data) ? data : [data?.DETAILS_DATA ?? {}];

    return entries.some(
      (entry) =>
        (entry?.isNewRow?.length ?? 0) > 0 ||
        (entry?.isUpdatedRow?.length ?? 0) > 0 ||
        (entry?.isDeleteRow?.length ?? 0) > 0
    );
  };

  const addArrCommonData = (data, state, reqCd, customerId) => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data.map((group) => {
        const hasNew =
          Array?.isArray(group?.isNewRow) && group?.isNewRow?.length > 0;
        const hasUpdated =
          Array?.isArray(group?.isUpdatedRow) &&
          group?.isUpdatedRow?.length > 0;
        const hasDeleted =
          Array?.isArray(group?.isDeleteRow) && group?.isDeleteRow?.length > 0;

        return {
          ...group,
          isNewRow: hasNew
            ? group?.isNewRow?.map((row) => ({
                ...row,
                IsNewRow: false,
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                REQ_FLAG: Boolean(state?.customerIDctx) ? "E" : "F",
                REQ_CD: reqCd,
                CUSTOMER_ID: customerId ?? "",
                SAVE_FLAG:
                  Boolean(state?.finalUpdatedReq?.PERSONAL_DETAIL) &&
                  Object?.keys(state?.finalUpdatedReq)?.length === 1
                    ? "D"
                    : "F",
              }))
            : [],
          isUpdatedRow: hasUpdated
            ? group?.isUpdatedRow?.map((row) => ({
                ...row,
                IsNewRow: false,
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                REQ_FLAG: Boolean(state?.customerIDctx) ? "E" : "F",
                REQ_CD: reqCd,
                CUSTOMER_ID: customerId ?? "",
                SAVE_FLAG:
                  Boolean(state?.finalUpdatedReq?.PERSONAL_DETAIL) &&
                  Object?.keys(state?.finalUpdatedReq)?.length === 1
                    ? "D"
                    : "F",
              }))
            : [],
          isDeleteRow: hasDeleted
            ? group?.isDeleteRow?.map((row) => ({
                ...row,
                IsNewRow: false,
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                REQ_FLAG: Boolean(state?.customerIDctx) ? "E" : "F",
                REQ_CD: reqCd,
                CUSTOMER_ID: customerId ?? "",
                SAVE_FLAG:
                  Boolean(state?.finalUpdatedReq?.PERSONAL_DETAIL) &&
                  Object?.keys(state?.finalUpdatedReq)?.length === 1
                    ? "D"
                    : "F",
              }))
            : [],
        };
      });
    }

    // Format 3: Object with DETAILS_DATA
    if ("DETAILS_DATA" in data) {
      const detailsData = data?.DETAILS_DATA;
      const hasNew =
        Array?.isArray(detailsData?.isNewRow) &&
        detailsData?.isNewRow?.length > 0;
      const hasUpdated =
        Array?.isArray(detailsData?.isUpdatedRow) &&
        detailsData?.isUpdatedRow?.length > 0;
      const hasDeleted =
        Array?.isArray(detailsData?.isDeleteRow) &&
        detailsData?.isDeleteRow?.length > 0;

      return {
        ...data,
        DETAILS_DATA: {
          ...detailsData,
          isNewRow: hasNew
            ? detailsData?.isNewRow?.map((row) => ({
                ...row,
                IsNewRow: true,
                COMP_CD:
                  state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.COMP_CD ?? "",
                BRANCH_CD:
                  state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.BRANCH_CD ??
                  "",
                REQ_FLAG: Boolean(state?.customerIDctx) ? "E" : "F",
                REQ_CD: reqCd,
                CUSTOMER_ID: customerId ?? "",
                SAVE_FLAG:
                  Boolean(state?.finalUpdatedReq?.PERSONAL_DETAIL) &&
                  Object?.keys(state?.finalUpdatedReq)?.length === 1
                    ? "D"
                    : "F",
              }))
            : [],
          isUpdatedRow: hasUpdated
            ? detailsData?.isUpdatedRow?.map((row) => ({
                ...row,
                IsNewRow: false,
                COMP_CD:
                  state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.COMP_CD ?? "",
                BRANCH_CD:
                  state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.BRANCH_CD ??
                  "",
                REQ_FLAG: Boolean(state?.customerIDctx) ? "E" : "F",
                REQ_CD: reqCd,
                CUSTOMER_ID: customerId ?? "",
                SAVE_FLAG:
                  Boolean(state?.finalUpdatedReq?.PERSONAL_DETAIL) &&
                  Object?.keys(state?.finalUpdatedReq)?.length === 1
                    ? "D"
                    : "F",
              }))
            : [],
          isDeleteRow: hasDeleted
            ? detailsData?.isDeleteRow?.map((row) => ({
                ...row,
                IsNewRow: false,
                COMP_CD:
                  state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.COMP_CD ?? "",
                BRANCH_CD:
                  state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.BRANCH_CD ??
                  "",
                REQ_FLAG: Boolean(state?.customerIDctx) ? "E" : "F",
                REQ_CD: reqCd,
                CUSTOMER_ID: customerId ?? "",
                SAVE_FLAG:
                  Boolean(state?.finalUpdatedReq?.PERSONAL_DETAIL) &&
                  Object?.keys(state?.finalUpdatedReq)?.length === 1
                    ? "D"
                    : "F",
              }))
            : [],
        },
      };
    }
    return data;
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

  //Function definition to deep remove keys if they exist in the object
  //This function will remove use for remove non-required keys from the API request
  function deepRemoveKeysIfExist(obj, keysToRemove) {
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

  const deepUpdateKeys = (obj, keysToUpdate, updateCallback) => {
    if (Array.isArray(obj)) {
      return obj.map((item) =>
        deepUpdateKeys(item, keysToUpdate, updateCallback)
      );
    }

    if (typeof obj === "object" && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          if (keysToUpdate.has(key)) {
            return [key, updateCallback(key, value)];
          } else if (typeof value === "object") {
            return [key, deepUpdateKeys(value, keysToUpdate, updateCallback)];
          } else {
            return [key, value];
          }
        })
      );
    }
    return obj;
  };

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return {
    state,
    dispatch,
    handleFromFormModectx,
    handleFormModalOpenctx,
    handleFormModalClosectx,
    handleFormModalOpenOnEditctx,
    onDraftSavectx,
    handleApiRes,
    // handleCustCategoryRes,
    handleCategoryChangectx,
    handleAccTypeVal,
    handleMinorMajorVal,
    handleKycNoValctx,
    handleReqCDctx,
    handlePhotoOrSignctx,
    handleSidebarExpansionctx,
    handleColTabChangectx,
    handleFormDataonSavectx,
    handleFormDataonSavectxNew,
    handleFormDataonDraftctx,
    handleFormDataonRetrievectx,
    handleModifiedColsctx,
    handlecustomerIDctx,
    handleStepStatusctx,
    toNextTab,
    toPrevTab,
    resetCkycctx,
    handleSavectx,
    handleUpdatectx,
    handleCurrFormctx,
    onFinalUpdatectx,
    handlePanDupReason,
    handleOtherExtDtlctx,
    handleEnableContactStDFields,
    handlepersonalOtherDtlLFno,
    tabFormRefs,
    headerFormSubmitRef,
    handleUpdateLoader,
    handleUpdCustRetData,
    mergePersonalDetailsInUpdatedReq,
    handleFinalUpdateReq,
    mergeOtherDtlFn,
    handleFormOtherDtlData,
    floatedValue,
    checkArrFieldLength,
    addArrCommonData,
    handleUpdateDocument,
    deepRemoveKeysIfExist,
    handleSaveMultipleRowctx,
    handleSaveSelectedRowctx,
    deepUpdateKeys,
    handleButtonDisable,
    handleAbortSubmit,
    handleUpdateViewedTabs,
  };
};

export default useCkycContext;
