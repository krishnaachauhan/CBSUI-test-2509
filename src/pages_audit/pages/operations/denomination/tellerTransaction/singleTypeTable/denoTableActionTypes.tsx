export const SingleTableInititalState = {
  inputVal: {},
  displayTable: false,
  amount: [],
  totalAmount: "",
  availNote: [],
  fieldsData: {},
  balance: [],
  singleDenoShow: false,
  viewAcctDetails: false,
  columnTotal: {},
  remainExcess: "0",
  confirmation: false,
  openAcctDtl: false,
  acctValidMsg: false,
  acctValidBox: false,
  displayError: [],
  displayTotal: [],
  totalInputAmount: "",
  retData: {},
  openDeno: false,
  isDisableField: false,
  referData: "",
  secondReferData: "",
  thirdReferData: "",
  formData: {},
  viewTRN: false,
  manageOperator: false,
};

export const SingleTableActionTypes = {
  SET_OPEN_DENO: "SET_OPEN_DENO",
  SET_DISP_TABLE: "SET_DISP_TABLE",
  SET_INPUT_VAL: "SET_INPUT_VAL",
  SET_AMOUNT_VAL: "SET_AMOUNT_VAL",
  SET_AVAIL_NOTE: "SET_AVAIL_NOTE",
  SET_FIELDS_DATA: "SET_FIELDS_DATA",
  SET_BAL_VAL: "SET_BAL_VAL",
  SET_SINGLEDENO_SHOW: "SET_SINGLEDENO_SHOW",
  SET_VIEWACCTDETAILS_VAL: "SET_VIEWACCTDETAILS_VAL",
  SET_TOTAL_VAL: "SET_TOTAL_VAL",
  SET_REMAINEXCESS_VAL: "SET_REMAINEXCESS_VAL",
  SET_CONFIRMATION_VAL: "SET_CONFIRMATION_VAL",
  SET_OPENACCTDTL_VAL: "SET_OPENACCTDTL_VAL",
  SET_ACCTVALIDMSG_VAL: "SET_ACCTVALIDMSG_VAL",
  SET_ACCTVALIDMSGBOX_VAL: "SET_ACCTVALIDMSGBOX_VAL",
  SET_DIS_ERR_VAL: "SET_DIS_ERR_VAL",
  SET_DISP_TABLE_DUAL: "SET_DISP_TABLE_DUAL",
};

export const SingleTableDataReducer = (state, action) => {
  switch (action.type) {
    case SingleTableActionTypes?.SET_OPEN_DENO:
      return { ...state, openDeno: action?.payload };
    case SingleTableActionTypes?.SET_DISP_TABLE:
      return { ...state, displayTable: action?.payload };
    case SingleTableActionTypes?.SET_INPUT_VAL:
      return { ...state, inputVal: action?.payload };
    case SingleTableActionTypes?.SET_AMOUNT_VAL:
      return { ...state, amount: action?.payload };
    case SingleTableActionTypes?.SET_AVAIL_NOTE:
      return { ...state, availNote: action?.payload };
    case SingleTableActionTypes?.SET_FIELDS_DATA:
      return { ...state, fieldsData: action?.payload };
    case SingleTableActionTypes?.SET_BAL_VAL:
      return { ...state, balance: action?.payload };
    case SingleTableActionTypes?.SET_SINGLEDENO_SHOW:
      return { ...state, singleDenoShow: action?.payload };
    case SingleTableActionTypes?.SET_VIEWACCTDETAILS_VAL:
      return { ...state, viewAcctDetails: action?.payload };
    case SingleTableActionTypes?.SET_TOTAL_VAL:
      return { ...state, columnTotal: action?.payload };
    case SingleTableActionTypes?.SET_REMAINEXCESS_VAL:
      return { ...state, remainExcess: action?.payload };
    case SingleTableActionTypes?.SET_CONFIRMATION_VAL:
      return { ...state, confirmation: action?.payload };
    case SingleTableActionTypes?.SET_OPENACCTDTL_VAL:
      return { ...state, openAcctDtl: action?.payload };
    case SingleTableActionTypes?.SET_ACCTVALIDMSG_VAL:
      return { ...state, acctValidMsg: action?.payload };
    case SingleTableActionTypes?.SET_ACCTVALIDMSGBOX_VAL:
      return { ...state, acctValidBox: action?.payload };
    case SingleTableActionTypes?.SET_DISP_TABLE_DUAL:
      return { ...state, displayTableDual: action?.payload };
    case SingleTableActionTypes?.SET_DIS_ERR_VAL:
      return {
        ...state,
        displayError: {
          ...state.displayError,
          [action.payload.index]: action?.payload?.message,
        },
      };
    default:
      return state;
  }
};
