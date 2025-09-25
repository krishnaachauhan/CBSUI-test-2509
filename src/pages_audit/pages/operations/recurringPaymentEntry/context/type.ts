export interface RecurPaymtStateType {
  activeStep: number;
  recurPmtEntryData: object;
  recurPmtTransferData: object;
  payslipAndDDData: object;
  beneficiaryAcctData: object;
  recurPmtEntryGridData: [];
  isBackButton: boolean;
  disableButton: boolean;
  getAcctData: object;
  onSaveValidationData: object;
  dataForJasperParam: object;
}

export interface ActionType {
  type: string;
  payload: any;
}

export interface ContextType {
  userState: RecurPaymtStateType;
  setActiveStep: any;
}
