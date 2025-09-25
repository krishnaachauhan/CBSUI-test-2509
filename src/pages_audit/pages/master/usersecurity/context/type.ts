export interface StateType {
  activeStep: number;
  form1Data: object;
  oldformData: object;
  formData: object;
  appContextData: object[];
  branchContextData: object[];
  productContextData: object[];
  grid4: object;
  grid5: object[];
  appUpdatedData: object[];
  branchUpdatedData: object[];
  productUpdatedData: object[];
  oldappContextData: object[];
  oldbranchContextData: object[];
  oldproductContextData: object[];
  oldData3: object[];
  oldData4: object;
  isBackButton: boolean;
}

export interface ActionType {
  type: string;
  payload: any;
}

export interface ContextType {
  userState: StateType;
  setActiveStep: any;
}
