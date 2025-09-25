export type AdvanceStockEntryBodyProps = {
  dialogState: {
    formMode: string;
    securityCd: string;
    gridData: Record<string, any>[];
    reqData: Record<string, any>[];
    acctDtlViewOpen: boolean;
    isErrorFuncRef: Record<string, any>;
  };
  setDialogState: React.Dispatch<
    React.SetStateAction<{
      formMode: string;
      securityCd: string;
      gridData: Record<string, any>[];
      reqData: Record<string, any>[];
      acctDtlViewOpen: boolean;
      isErrorFuncRef: Record<string, any>;
    }>
  >;
  closeDialog: () => void;
  formData: Record<string, any>;
  detailData: Record<string, any>;
  screenPara: Record<string, any>;
  isLoading: boolean;
  authState: Record<string, any>;
  gridApiRef: React.MutableRefObject<any>;
  docCD: string;
  rows: Record<string, any>;
  onSubmitHandler: (...args: any[]) => void;
  validateMutation: any;
  saveDataMutation: any;
  isErrorFuncRef: React.MutableRefObject<any>;
  screenForUse: any;
  confirmedDataGridMutation: any;
};
export type DialogStateType = {
  formMode: string;
  securityCd: string;
  gridData: Record<string, any>[];
  reqData: Record<string, any>[];
  acctDtlViewOpen: boolean;
  isErrorFuncRef: any;
};
export type EntryGridProps = {
  formMode: string;
  securityCd: string;
  gridData: Record<string, any>;
  screenPara: Record<string, any>;
  gridApiRef: any;
};
export interface HeaderData {
  FROM_DT: string;
  TO_DT: string;
  COMP_CD: string;
  BRANCH_CD: string;
  ENTERED_BRANCH_CD: string;
  WORKING_DATE: string;
  USERNAME: string;
  USERROLE: string;
  DOC_CD: string;
  ACCT_TYPE: string;
  ACCT_CD: string;
  [key: string]: any;
}
export type APIError = {
  error_msg?: string;
  error_detail?: string;
};
