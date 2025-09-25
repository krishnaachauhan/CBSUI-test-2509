import {
  ClearCacheProvider,
  FormWrapper,
  LoaderPaperComponent,
  MetaDataType,
  queryClient,
  SearchBar,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { lockerAcctAllocationMetadata } from "./lockerAcctAllocMetaData";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import * as API from "./api";
import { useMutation } from "react-query";
import { LockerWaitingListConfig } from "./lockerWaitingList";
import { Box } from "@mui/material";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
import { debounce } from "lodash";
import { t } from "i18next";
import { ClosedLockIcon, OpenLocker } from "assets/icons/svgIcons";
import { AcctMstByLockerNo } from "./acctMstByLockerNo";
import AcctMSTProvider from "../acct-mst/AcctMSTContext";
const LockerAcctAllocationMain = () => {
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const currentPath = useLocation().pathname;
  const { commonClass, dialogClassNames } = useDialogContext();
  const [dataClass, setDataClass] = useState("");

  const [renderCount, setRenderCount] = useState(1);
  const [openAcctMst, setOpenAcctMst] = useState<boolean>(false);
  const [lockerData, setLockerData] = useState<any>([]);
  const [originalLockerData, setOriginalLockerData] = useState<any>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [waitListDtlPayload, setWaitListDtlPayload] = useState({});
  const validatedLockerRef = useRef<Record<string, any> | null>(null);
  const reqParaRef = useRef<Record<string, any> | null>(null);

  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const getLockerAvailMutation = useMutation(
    "getLockerAvailibility",
    API.getLockerAvailibility,
    {
      onError: async (error: any) => {
        await MessageBox({
          messageTitle: t("Error"),
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
      },
      onSuccess: async (data, variables) => {
        reqParaRef.current = variables;
        if (data?.length > 0) {
          setLockerData(data);
          setOriginalLockerData(data);
          return;
        } else {
          return await MessageBox({
            messageTitle: t("noLockerAvailable"),
            message: t("noLockerAvailable"),
            icon: "INFO",
          });
        }
      },
    }
  );

  const validateLockerAlloMutation = useMutation(
    "validateLockerAllocation",
    API.validateLockerAllocation,
    {
      onError: async (error: any) => {
        await MessageBox({
          messageTitle: t("Error"),
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
      },
      onSuccess: async (data) => {
        if (data?.[0]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: data?.[0]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[0]?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (data?.[0]?.O_STATUS === "99") {
          const btnAction = await MessageBox({
            messageTitle: data?.[0]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[0]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (btnAction === "Yes") {
            setOpenAcctMst(true);
          }
        } else if (data?.[0]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: data?.[0]?.O_MSG_TITLE ?? "Alert",
            message: data?.[0]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data?.[0]?.O_STATUS === "0") {
          console.log("Allote the Locker");
          setOpenAcctMst(true);
        }
      },
    }
  );
  const handleValidateLocAlloc = (lockerData) => {
    validatedLockerRef.current = null;
    validatedLockerRef.current = lockerData;

    validateLockerAlloMutation.mutate({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      DISPLAY_LANGUAGE: "",
      ACCT_TYPE: lockerData?.ACCT_TYPE ?? "",
      ACTIVE: lockerData?.ACTIVE ?? "",
      ALLOTED: lockerData?.ALLOTED ?? "",
      LOCKER_NO: lockerData?.LOCKER_NO ?? "",
    });
  };

  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setDataClass(newData);
  }, [commonClass, dialogClassNames]);

  useEnter(`${dataClass}`);

  useEffect(() => {
    if (renderCount) {
      queryClient.invalidateQueries(["getLockerAvailibility"]);
    }
  }, [renderCount]);

  useEffect(() => {
    return () => {
      setLockerData([]);
      validatedLockerRef.current = null;
    };
  }, []);

  lockerAcctAllocationMetadata.form.label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );

  const handleSearch = useCallback(
    debounce((searchTerm: string, originalData: any[]) => {
      if (searchTerm === "") {
        setLockerData(originalData);
      } else {
        const filtered = originalData.filter((item) => {
          return (
            item.ACCT_NM?.toString().toLowerCase().includes(searchTerm) ||
            item.SIZE_NM?.toString().toLowerCase().includes(searchTerm) ||
            item.LOC_SIZE_CD?.toString().toLowerCase().includes(searchTerm) ||
            item.LOCKER_NO?.toString().toLowerCase().includes(searchTerm)
          );
        });
        setLockerData(filtered);
      }
    }, 300),
    []
  );

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    handleSearch(searchTerm, originalLockerData);
  };

  const notAllottedCount =
    lockerData?.filter((d: any) => d.ALLOTED === "N").length ?? 0;
  const allottedCount =
    lockerData?.filter((d: any) => d.ALLOTED !== "N").length ?? 0;
  return (
    <Box
      style={{
        height: "calc(100vh - 81px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <FormWrapper
        key={`lockerAccountAllocation`}
        metaData={lockerAcctAllocationMetadata as MetaDataType}
        onSubmitHandler={() => {}}
        initialValues={{}}
        formStyle={{
          background: "white",
        }}
        formState={{ docCD: docCD }}
        setDataOnFieldChange={(action, payload) => {
          if (action === "AVAILABLE") {
            const compCd = authState?.companyID ?? "";
            const branchCd = authState?.user?.branchCode ?? "";
            const availibility = payload?.AVAILABLE === true ? "Y" : "N";
            getLockerAvailMutation.mutate({
              COMP_CD: compCd,
              BRANCH_CD: branchCd,
              ACCT_TYPE: payload?.ACCT_TYPE,
              AVAILABLE: availibility,
              LOC_SIZE_CD: payload?.SIZE_CD,
            });
            setRenderCount((prev) => prev + 1);
          }
        }}
        onFormButtonClickHandel={async (id, dependentFields) => {
          const compCd = authState?.companyID ?? "";
          const branchCd = authState?.user?.branchCode ?? "";
          const acctType = dependentFields?.ACCT_TYPE?.value ?? "";
          const lockerSizeCd = dependentFields?.SIZE_CD?.value ?? "";
          const availibility =
            dependentFields?.AVAILABLE?.value === true ? "Y" : "N";

          if (id === "RETRIEVE") {
            if (acctType || lockerSizeCd || availibility) {
              getLockerAvailMutation.mutate({
                COMP_CD: compCd,
                BRANCH_CD: branchCd,
                ACCT_TYPE: acctType,
                AVAILABLE: availibility,
                LOC_SIZE_CD: lockerSizeCd,
              });

              setRenderCount((prev) => prev + 1);
            }
          } else if (id === "WAITING_LIST") {
            if (!acctType) {
              return await MessageBox({
                messageTitle: t("PleaseSelectAcctType"),
                message: t("PleaseSelectAcctType"),
                icon: "INFO",
              });
            } else if (!lockerSizeCd) {
              return await MessageBox({
                messageTitle: t("selectLockerSize"),
                message: t("selectLockerSize"),
                icon: "INFO",
              });
            } else {
              setWaitListDtlPayload({
                COMP_CD: compCd,
                BRANCH_CD: branchCd,
                ACCT_TYPE: acctType,
                LOC_SIZE_CD: lockerSizeCd,
              });
              setIsDialogOpen(true);
            }
          }
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <SearchBar onChange={onSearchInputChange} placeholder={"Search"} />
          </>
        )}
      </FormWrapper>
      {getLockerAvailMutation?.isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <Box
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            padding: "0px 10px 0px 10px",
          }}
        >
          <Box
            style={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            <Box
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100px, 100%), 1fr))",
                gap: "30px",
                background: "white",
              }}
            >
              {lockerData?.length > 0 &&
                lockerData.map((d: any, ind) => (
                  <Box
                    onDoubleClick={() => handleValidateLocAlloc(d)}
                    key={d?.LOCKER_NO ?? ind}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      borderRadius: "2px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.02)",
                      padding: "10px",
                      background: "#fff",
                      transition: "box-shadow 0.3s ease-in-out",
                    }}
                  >
                    {d?.ALLOTED === "N" ? <OpenLocker /> : <ClosedLockIcon />}
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "2px",
                        padding: "2px",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {d.LOCKER_NO && <span>{d.LOCKER_NO}</span>}
                      {d.LOC_SIZE_CD && <span>{d.LOC_SIZE_CD}</span>}
                      {d.SIZE_NM && <span>{`[${d.SIZE_NM}]`}</span>}
                      {d.ACCT_NM && (
                        <span
                          style={{
                            width: "100%",
                            display: "block",
                            overflow: "hidden",
                            whiteSpace: "wrap",
                            textOverflow: "ellipsis",
                            textAlign: "center",
                          }}
                        >
                          {d.ACCT_NM}
                        </span>
                      )}
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>

          {lockerData?.length > 0 && (
            <Box
              style={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                gap: "30px",
                padding: "5px",
                backgroundColor: "var(--theme-color3)",
                fontWeight: "500",
                boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.05)",
                color: "#ffffff",
                zIndex: 10,
              }}
            >
              <span>Allotted: {allottedCount}</span>
              <span>Not Allotted: {notAllottedCount}</span>
            </Box>
          )}
        </Box>
      )}

      {openAcctMst ? (
        <AcctMstByLockerNo
          open={openAcctMst}
          closeDialog={() => {
            setOpenAcctMst(false);
            getLockerAvailMutation.mutate({
              ...reqParaRef.current,
            });
          }}
          reqPara={
            validatedLockerRef.current
              ? {
                  ...validatedLockerRef.current,
                  ACCT_CD: validatedLockerRef.current.LST_ACCT_CD,
                }
              : {}
          }
        />
      ) : null}

      {isDialogOpen ? (
        <LockerWaitingListConfig
          setIsDialogOpen={setIsDialogOpen}
          isDialogOpen={isDialogOpen}
          waitListDtlPayload={waitListDtlPayload}
        />
      ) : null}
    </Box>
  );
};
export const LockerAcctAllocation = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <AcctMSTProvider>
          <div className="main">
            <LockerAcctAllocationMain />
          </div>
        </AcctMSTProvider>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
