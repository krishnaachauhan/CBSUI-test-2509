import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router";
import {
  AuthContextType,
  AuthStateType,
  ActionType,
  BranchSelectData,
} from "./type";
import * as API from "./api";
import { AuthSDK } from "registry/fns/auth";
import { RefreshTokenData } from "./api";
import {
  utilFunction,
  queryClient,
  usePopupContext,
  useWorkerContext,
} from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import CRC32C from "crc-32";
import { LinearProgress } from "@mui/material";
const inititalState: AuthStateType = {
  access_token: {},
  isLoggedIn: false,
  isBranchSelect: false,
  role: "",
  roleName: "",
  companyID: "",
  baseCompanyID: "",
  companyName: "",
  workingDate: "",
  minDate: "",
  groupName: "",
  access: {},
  menulistdata: [],
  uniqueAppId: "",
  user: {
    branch: "",
    branchCode: "",
    defaultSelectBranch: "",
    baseBranchCode: "",
    isUpdDefBranch: "",
    name: "",
    lastLogin: "",
    id: "",
    employeeID: "",
    allowChat: "",
  },
  hoLogin: "",
  idealTimer: "",
};

const authReducer = (
  state: AuthStateType,
  action: ActionType
): AuthStateType => {
  switch (action.type) {
    case "login": {
      return action.payload;
    }
    case "logout": {
      return inititalState;
    }
    case "branchselect": {
      return {
        ...state,
        isBranchSelect: true,
        menulistdata: action.payload?.menulistdata,
      };
    }
    default: {
      return state;
    }
  }
};
let timeoutID: any = null;
let timeoutLogout: any = null;
export const AuthContext = createContext<AuthContextType>({
  login: () => true,
  logout: () => true,
  isLoggedIn: () => false,
  authState: inititalState,
  isBranchSelected: () => false,
  branchSelect: () => true,
  getProfileImage: "",
  setProfileImage: () => false,
  MessageBox: () => false,
  closeMessageBox: () => false,
  message: {
    isOpen: false,
    messageTitle: "",
    message: "",
    icon: "",
    buttonNames: "",
  },
});

export const AccDetailContext = createContext<any>({
  setTempStore: () => false,
  setCardStore: () => false,
});

export const AuthProvider = ({ children }) => {
  const { CloseMessageBox } = usePopupContext();
  const { setWorkerQueue } = useWorkerContext();
  const [state, dispatch] = useReducer(authReducer, inititalState);
  const [tempStore, setTempStore]: any = useState({});
  const [cardStore, setCardStore]: any = useState({});
  const [message, setMessageBox]: any = useState({});
  const [authenticating, setAuthenticating] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [comingFromRoute, setComingFromRoute] = useState(location.pathname);
  const [profileImage, setProfileImagestate] = useState("");
  const setProfileImage = (imgData) => {
    if (Boolean(imgData)) {
      setProfileImagestate(imgData);
    }
  };

  /*eslint-disable react-hooks/exhaustive-deps*/
  const login = useCallback(
    (payload: AuthStateType, stopNavigation?: boolean) => {
      dispatch({
        type: "login",
        payload: {
          ...payload,
          isLoggedIn: true,
        },
      });
      AuthSDK.setToken(payload.access_token);
      AuthSDK.loginUserDetails(payload);
      RefreshTokenAtExpired(
        payload.access_token?.expires_in,
        payload.access_token?.generateTime,
        payload.access_token?.refresh_token
      );
      setLoginDatainLocalStorage({ ...payload, isLoggedIn: true });
      if (stopNavigation) {
        return;
      }
      if (payload?.totpReg === "Y") {
        navigate("/EnfinityCore/totp-enable", {
          state: {
            secretTocken: payload?.secretTocken,
            secretTockenQR: payload?.secretTockenQR,
          },
          replace: true,
        });
      } else if (comingFromRoute === "/EnfinityCore/login") {
        navigate("/EnfinityCore/branch-selection", {
          replace: true,
        });
      } else {
        navigate(comingFromRoute, {
          replace: true,
        });
      }
    },
    [dispatch, navigate, comingFromRoute]
  );
  const branchSelect = useCallback(
    (payload: BranchSelectData, stopNavigation?: boolean) => {
      dispatch({
        type: "branchselect",
        payload: { menulistdata: payload.menulistdata },
      });
      setLoginDatainLocalStorage({
        ...state,
        isBranchSelect: true,
        hoLogin:
          payload.branchCode === payload.baseBranchCode &&
          state?.companyID === state?.baseCompanyID
            ? "Y"
            : "N",
        user: {
          ...state.user,
          branchCode: payload.branchCode,
          branch: payload.branch,
          baseBranchCode: payload.baseBranchCode,
        },
        menulistdata: payload.menulistdata,
      });
      if (stopNavigation) {
        return;
      }
      if (
        comingFromRoute === "/EnfinityCore/branch-selection" ||
        comingFromRoute === "/EnfinityCore/change-branch"
      ) {
        navigate("/EnfinityCore/dashboard", {
          replace: true,
        });
      } else {
        navigate(comingFromRoute, {
          replace: true,
        });
      }
    },
    [dispatch, navigate, comingFromRoute]
  );
  const logout = useCallback(
    (reqFlag = "N") => {
      let result = sessionStorage.getItem("authDetails");
      if (result !== null && Boolean(result)) {
        let localStorageAuthState: any = JSON.parse(result);
        if (
          Boolean(localStorageAuthState?.isLoggedIn) &&
          Boolean(localStorageAuthState?.user?.id)
        ) {
          API.LogoutAPI({
            USER_ID: localStorageAuthState?.user?.id,
            APP_TRAN_CD: "51",
            REQ_FLAG: reqFlag,
          });
        }
      }
      sessionStorage.removeItem("authDetails");
      sessionStorage.removeItem("tokenchecksum");
      localStorage.removeItem("token_status");
      sessionStorage.removeItem("charchecksum");
      sessionStorage.removeItem("specialChar");
      sessionStorage.removeItem("encReqDecFlag");
      CloseMessageBox();
      setWorkerQueue([]);
      dispatch({
        type: "logout",
        payload: {},
      });
      if (Boolean(timeoutID)) {
        clearTimeout(timeoutID);
      }
      queryClient.clear();
      if (window.location.pathname === "/EnfinityCore/forgotpassword") {
      } else if (window.location.pathname === "/EnfinityCore/forgot-totp") {
      } else {
        setComingFromRoute("/EnfinityCore");
        navigate("/EnfinityCore/login");
      }
    },
    [dispatch, navigate]
  );

  const isLoggedIn = () => {
    return state.isLoggedIn;
  };

  const isBranchSelected = () => {
    return state.isBranchSelect;
  };

  const setLoginDatainLocalStorage = async (payload) => {
    let payloadStr = JSON.stringify(payload);
    sessionStorage.setItem("tokenchecksum", await GenerateCRC32(payloadStr));
    sessionStorage.setItem("authDetails", payloadStr);
  };
  window.addEventListener("storage", async (e) => {
    let localStorageKeys = ["authDetails", "specialChar"];
    localStorageKeys.forEach(async (keyNm) => {
      let result = sessionStorage.getItem(keyNm);
      if (result === null) {
        logout();
      } else {
        let checksumdata: any;
        if (keyNm === "specialChar" || keyNm === "specialChar") {
          checksumdata = sessionStorage.getItem("charchecksum");
        } else if (keyNm === "authDetails") {
          // localStorage.getItem("tokenchecksum");
          checksumdata = sessionStorage.getItem("tokenchecksum");
        }
        let genChecksum = await GenerateCRC32(
          sessionStorage.getItem(keyNm) || ""
        );
        if (checksumdata !== genChecksum) {
          if (Boolean(timeoutLogout)) {
            clearTimeout(timeoutLogout);
          }
          timeoutLogout = setTimeout(() => {
            console.log("logout-due-to localStorage change");
            logout();
          }, 1500);
        }
      }
    });
  });

  useEffect(() => {
    //@ts-ignore
    window.__logout = logout;
    return () => {
      //@ts-ignore
      window.__logout = null;
    };
  }, [logout]);
  // useEffect(() => {
  //   GeneralAPI.putOpenWindowName(window.location.pathname);
  // }, [window.location.pathname]);
  useEffect(() => {
    let result = sessionStorage.getItem("authDetails");
    if (result !== null) {
      let localStorageAuthState: AuthStateType = JSON.parse(result);
      // if (Boolean(localStorageAuthState?.token ?? "")) {
      //   API.verifyToken(localStorageAuthState.token).then((result) => {
      //     if (result.status === "success") {
      login(localStorageAuthState, true);
      //     } else if (result.status === "failure") {
      //       if (result.data instanceof Error) {
      //         navigate("/error/Internet");
      //       } else {
      //         logout();
      //       }
      //     }
      setAuthenticating(false);
      //   });
      // } else {
      //   logout();
      //   setAuthenticating(false);
      // }
    } else {
      console.log("logout-due-to localStorage-authDetails not found");
      logout();
      setAuthenticating(false);
    }
  }, [login, logout, setAuthenticating]);
  const RefreshTokenAtExpired = async (
    expireTime,
    generateTime,
    expireToken
  ) => {
    if (!isNaN(expireTime) && !isNaN(generateTime)) {
      let geneTime = Number.parseInt(generateTime);
      let exTime = Number.parseInt(expireTime);
      let totalTime = (utilFunction.getCurrentDateinLong() - geneTime) / 1000;
      exTime = exTime - totalTime - 10;
      if (exTime > 0) {
        exTime = exTime * 1000;
        if (Boolean(timeoutID)) {
          clearTimeout(timeoutID);
        }
        timeoutID = setTimeout(async () => {
          let accessToken = await RefreshTokenData(expireToken);
          setnewToken(accessToken);
        }, exTime);
      } else {
        let accessToken = await RefreshTokenData(expireToken);
        setnewToken(accessToken);
      }
    }
  };
  const setnewToken = (access_token) => {
    if (!Boolean(access_token)) return;
    let result = sessionStorage.getItem("authDetails");
    if (result !== null) {
      let localStorageAuthState: AuthStateType = JSON.parse(result);
      localStorageAuthState = {
        ...localStorageAuthState,
        access_token: {
          ...localStorageAuthState.access_token,
          ...access_token,
        },
      };
      setLoginDatainLocalStorage(localStorageAuthState);
      AuthSDK.setToken(localStorageAuthState.access_token);
      RefreshTokenAtExpired(
        localStorageAuthState.access_token?.expires_in,
        localStorageAuthState.access_token?.generateTime,
        localStorageAuthState.access_token?.refresh_token
      );
    }
  };
  const GenerateCRC32 = async (str) => {
    let fingerprint = await AuthSDK.Getfingerprintdata();
    return String(CRC32C.str((str || "") + fingerprint));
  };
  const MessageBox = (
    messageTitle: String,
    message: String,
    icon: "INFO" | "ERROR" | "WARNING" = "INFO",
    buttonNames: [String] = ["OK"]
  ) => {
    setMessageBox({
      isOpen: true,
      messageTitle,
      message,
      icon,
      buttonNames: buttonNames ?? ["OK"],
    });
  };
  const closeMessageBox = () => {
    setMessageBox({
      isOpen: false,
      messageTitle: "",
      message: "",
      icon: "",
      buttonNames: ["OK"],
    });
  };
  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isLoggedIn,
        authState: state,
        isBranchSelected,
        branchSelect,
        getProfileImage: profileImage,
        setProfileImage,
        MessageBox,
        closeMessageBox,
        message,
      }}
    >
      <AccDetailContext.Provider
        value={{ tempStore, setTempStore, cardStore, setCardStore }}
      >
        {authenticating ? <LinearProgress color="secondary" /> : children}
      </AccDetailContext.Provider>
    </AuthContext.Provider>
  );
};
