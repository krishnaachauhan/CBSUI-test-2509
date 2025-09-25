export interface AuthStateType {
  access_token: any;
  isLoggedIn: any;
  isBranchSelect: boolean;
  role: string;
  roleName: string;
  access: any;
  companyName: string;
  workingDate: string;
  minDate: string;
  companyID: string;
  baseCompanyID: string;
  groupName: string;
  menulistdata: any;
  uniqueAppId: string;
  user: {
    branch: string;
    branchCode: string;
    defaultSelectBranch: string;
    baseBranchCode: string;
    isUpdDefBranch: string;
    lastLogin: string;
    name: string;
    //type: string;
    id: string;
    employeeID: any;
    allowChat: string;
  };
  hoLogin: string;
  idealTimer: string;
  totpReg?: string;
  secretTocken?: string;
  secretTockenQR?: string;
}

export interface BranchSelectData {
  menulistdata: any;
  branch: string;
  branchCode: string;
  baseBranchCode: string;
}

export interface ActionType {
  type: string;
  payload: any;
}

export interface AuthContextType {
  authState: AuthStateType;
  login: any;
  logout: any;
  isLoggedIn: any;
  isBranchSelected: any;
  branchSelect: any;
  getProfileImage: any;
  setProfileImage: any;
  MessageBox: any;
  closeMessageBox: any;
  message: any;
}
