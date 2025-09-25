import { AuthSDK } from "./fns/auth";
// import "./yup";

// AuthSDK.inititateAPI(
//   `${new URL("./", process.env.REACT_APP_API_URL).href}` ?? "",
//   process?.env?.REACT_APP_API_PROJECT_NAME ?? ""
// );
// CryptoSDK.inititateKey(process?.env?.REACT_APP_PUBLIC_KEY);
String.prototype["getBytes"] = function () {
  var bytes: any = [];
  for (var i = 0; i < this.length; i++) {
    bytes.push(this.charCodeAt(i));
  }
  return bytes;
};
