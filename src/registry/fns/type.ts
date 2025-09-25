export interface CommonFetcherResponse {
  data: any;
  status: any; //"0" | "99" | "999" | "failure" | "success";
  message?: any;
  messageDetails?: any;
  isPrimaryKeyError?: boolean;
}
export interface CommonFetcherPreLoginResponse {
  data: any;
  status: any; //"0" | "99" | "999" | "failure" | "success";
  message?: any;
  messageDetails?: any;
  responseType?: any;
  access_token?: any;
}
export interface sessionObjType {
  baseURL?: URL;
  loginStatus: boolean;
  token?: any;
}
