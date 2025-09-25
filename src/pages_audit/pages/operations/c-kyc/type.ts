export interface CkycStateType {
    access_token: any;
    isLoggedIn: any;
    isBranchSelect: boolean;
    role: string;
    roleName: string;
    access: any;
    companyName: string;
    workingDate: string;
    companyID: string;
    baseCompanyID: string;
    menulistdata: any;
    user: {
      branch: string;
      branchCode: string;
      baseBranchCode: string;
      isUpdDefBranch: string;
      lastLogin: string;
      name: string;
      //type: string;
      id: string;
      employeeID: any;
    };
  }