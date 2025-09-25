import { AppBar } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { t } from "i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { RetrieveCfmData } from "../confirm/retrieveCfmData/retrieveCfmData";
import { impsCfmMetaData } from "./impsConfirmMetadata";
import { useMutation } from "react-query";
import { confirmIMPSdata, getImpsDetails, viewChangesData } from "../api";
import { DayLimit } from "../impsDetailForm/dayLimit/dayLimit";
import {
  ActionTypes,
  Alert,
  MasterDetailsForm,
  MasterDetailsMetaData,
  usePopupContext,
  GradientButton,
  utilFunction,
} from "@acuteinfo/common-base";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { enqueueSnackbar } from "notistack";
import { ViewChanges } from "./viewChanges/viewChanges";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
const ImpsConfirmation = () => {
  const actions: ActionTypes[] = [
    {
      actionName: "daylimit-form",
      actionLabel: "Add",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: false,
    },
  ];
  const navigate = useNavigate();
  const [retrieveData, setRetrieveData] = useState<any>();
  const [filteredData, setFilteredData] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetForm, setResetForm] = useState(0);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const myRef = useRef<any>(null);

  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  //  Api calling for confirmation
  const confirmIMPS: any = useMutation("confirmIMPSdata", confirmIMPSdata, {
    onSuccess: (data, variables) => {
      CloseMessageBox();

      if (data?.[0]?.STATUS === "999") {
        MessageBox({
          messageTitle: "InvalidConfirmation",
          message: data?.message || data?.[0]?.MESSAGE,
          icon: "ERROR",
        });
      } else {
        //  after successfull update confirmed flag
        const updateConfirmation = (data) => {
          const updatedData = data.map((old) => {
            if (old?.TRAN_CD === variables?.TRAN_CD) {
              return { ...old, CONFIRMED: variables?._isConfrimed ? "Y" : "R" };
            }
            return old;
          });

          return updatedData;
        };
        setFilteredData(updateConfirmation(filteredData));
        setRetrieveData(updateConfirmation(retrieveData));

        enqueueSnackbar(
          t(
            variables?._isConfrimed ? "DataConfirmMessage" : "DataRejectMessage"
          ),
          { variant: "success" }
        );
      }
    },
    onError() {
      CloseMessageBox();
    },
  });

  // common function for API request
  const confirmation = async (flag) => {
    let checkUser =
      retrieveData?.[currentIndex]?.LAST_ENTERED_BY === authState?.user?.id
        ? true
        : false;

    let buttonName = await MessageBox({
      messageTitle: checkUser ? "ValidationFailed" : "confirmation",
      message:
        checkUser && flag === "C"
          ? "YoucantConfirmyourownenteredReg"
          : checkUser && flag === "R"
          ? "YoucantRejectyourownenteredReg"
          : !checkUser && flag === "C"
          ? "AreYouSureToConfirm"
          : "AreYouSureToReject",
      defFocusBtnName: checkUser ? "Ok" : "Yes",
      buttonNames: checkUser ? ["Ok"] : ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: checkUser ? "ERROR" : "WARNING",
    });
    if (buttonName === "Yes") {
      let apiReq = {
        _isConfrimed: flag === "C" ? true : false,
        ENTERED_BRANCH_CD: retrieveData?.[currentIndex]?.ENTERED_BRANCH_CD,
        ENTERED_COMP_CD: retrieveData?.[currentIndex]?.ENTERED_COMP_CD,
        TRAN_CD: retrieveData?.[currentIndex]?.TRAN_CD,
      };
      confirmIMPS.mutate(apiReq);
    }
  };

  // API calling for details data
  const accountList: any = useMutation("getImpsDetails", getImpsDetails, {
    onSuccess: (data) => {
      myRef.current?.setGridData(data ?? []);
    },
  });

  useEffect(() => {
    if (retrieveData?.length) {
      accountList.mutate({
        ENT_COMP_CD: retrieveData?.[currentIndex]?.ENTERED_COMP_CD,
        ENT_BRANCH_CD: retrieveData?.[currentIndex]?.ENTERED_BRANCH_CD,
        TRAN_CD: retrieveData?.[currentIndex]?.TRAN_CD,
      });
    }
  }, [retrieveData, currentIndex]);

  //  click on prev/next button so chnage current-index number using this function
  const changeIndex = (direction) => {
    setCurrentIndex((prevIndex) => {
      if (direction === "next") {
        return prevIndex === retrieveData?.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? retrieveData?.length - 1 : prevIndex - 1;
      }
    });
  };
  useEffect(() => {
    navigate("retrieve-cfm-form");
  }, []);

  // common function for filter data on click view-all and refresh button
  const filterData = (flag) => {
    if (flag === "REFRESH") {
      let refreshData = retrieveData?.filter(
        (item) => item.CONFIRMED !== "Y" && item.CONFIRMED !== "R"
      );
      setCurrentIndex(0);
      setRetrieveData(refreshData);
    } else if (flag === "VIEW_ALL") {
      setRetrieveData(filteredData);
    }
  };
  return (
    <>
      {accountList?.isError ||
        (confirmIMPS?.isError && (
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={
                accountList?.error?.error_msg ??
                confirmIMPS?.error?.error_msg ??
                "Unknow Error"
              }
              errorDetail={
                accountList?.error?.error_detail ??
                confirmIMPS?.error?.error_detail ??
                ""
              }
              color="error"
            />
          </AppBar>
        ))}

      <MasterDetailsForm
        key={
          "imps-cfm-form" + resetForm + retrieveData?.[currentIndex]?.TRAN_CD
        }
        metaData={impsCfmMetaData as MasterDetailsMetaData}
        initialData={{
          ...retrieveData?.[currentIndex],
          TOTAL:
            retrieveData?.length &&
            `\u00A0 ${currentIndex + 1} of ${retrieveData?.length}`,
          // DETAILS_DATA: myRef.current?.GetGirdData(),
        }}
        subHeaderLabel={utilFunction.getDynamicLabel(
          useLocation().pathname,
          authState?.menulistdata,
          true
        )}
        subHeaderLabelStyle={{ paddingLeft: "0px" }}
        displayMode={"view"}
        isDetailRowRequire={false}
        onSubmitData={() => {}}
        isLoading={accountList?.isLoading || accountList?.isFetching}
        actions={actions}
        handelActionEvent={(data) => {
          if (data?.name === "daylimit-form") {
            navigate(data?.name, {
              state: { ...data?.rows?.[0]?.data, FLAG: "C" },
            });
          }
        }}
        formStyle={{
          // background: "white",
          minHeight: "21vh",
          // overflowY: "auto",
          // overflowX: "hidden",
        }}
        ref={myRef}
      >
        {({ isSubmitting, handleSubmit }) => {
          return (
            <>
              {retrieveData?.length > 0 && (
                <>
                  <GradientButton
                    startIcon={<ArrowBackIosNewIcon />}
                    disabled={1 === currentIndex + 1 || accountList?.isLoading}
                    onClick={() => changeIndex("previous")}
                    color={"primary"}
                  >
                    {t("Prev")}
                  </GradientButton>
                  <GradientButton
                    endIcon={<ArrowForwardIosIcon />}
                    disabled={
                      currentIndex + 1 === retrieveData?.length ||
                      accountList?.isLoading
                    }
                    onClick={() => changeIndex("next")}
                    color={"primary"}
                  >
                    {t("Next")}
                  </GradientButton>
                  <GradientButton
                    disabled={
                      accountList?.isLoading ||
                      retrieveData?.[currentIndex]?.CONFIRMED !== "N"
                    }
                    onClick={() => {
                      confirmation("C");
                    }}
                    color="primary"
                  >
                    {t("Confirm")}
                  </GradientButton>
                  <GradientButton
                    disabled={
                      accountList?.isLoading ||
                      retrieveData?.[currentIndex]?.CONFIRMED !== "N"
                    }
                    onClick={() => {
                      confirmation("R");
                    }}
                    color="primary"
                  >
                    {t("Reject")}
                  </GradientButton>
                  <GradientButton
                    disabled={accountList?.isLoading}
                    onClick={() =>
                      navigate("view-changes", {
                        state: {
                          COMP_CD:
                            retrieveData?.[currentIndex]?.ENTERED_COMP_CD,
                          BRANCH_CD:
                            retrieveData?.[currentIndex]?.ENTERED_BRANCH_CD,
                          TRAN_CD: retrieveData?.[currentIndex]?.TRAN_CD,
                          DOC_CD: docCD,
                        },
                      })
                    }
                    color={"primary"}
                  >
                    {t("ViewChanges")}
                  </GradientButton>
                  <GradientButton
                    disabled={accountList?.isLoading}
                    onClick={() => filterData("VIEW_ALL")}
                    color="primary"
                  >
                    {t("View All")}
                  </GradientButton>
                  <GradientButton
                    disabled={accountList?.isLoading}
                    onClick={() => filterData("REFRESH")}
                    color="primary"
                  >
                    {t("Refresh")}
                  </GradientButton>
                  <GradientButton
                    disabled={accountList?.isLoading}
                    color="primary"
                    onClick={() => navigate("photo-sign")}
                  >
                    {t("PhotoSign")}
                  </GradientButton>
                </>
              )}
              <GradientButton
                disabled={accountList?.isLoading}
                onClick={() => navigate("retrieve-cfm-form")}
                color={"primary"}
              >
                {t("Retrieve")}
              </GradientButton>
            </>
          );
        }}
      </MasterDetailsForm>
      <Routes>
        <Route
          path="photo-sign/*"
          element={
            <PhotoSignWithHistory
              data={{
                COMP_CD: retrieveData?.[currentIndex]?.COMP_CD ?? "",
                BRANCH_CD: retrieveData?.[currentIndex]?.BRANCH_CD ?? "",
                ACCT_TYPE: retrieveData?.[currentIndex]?.ACCT_TYPE ?? "",
                ACCT_CD: retrieveData?.[currentIndex]?.ACCT_CD ?? "",
              }}
              onClose={() => navigate(".")}
              screenRef={docCD}
            />
          }
        />
        <Route
          path="retrieve-cfm-form/*"
          element={
            <RetrieveCfmData
              onClose={() => navigate(".")}
              navigate={navigate}
              setResetForm={setResetForm}
              setRetrieveData={setRetrieveData}
              setFilteredData={setFilteredData}
            />
          }
        />
        <Route
          path="daylimit-form/*"
          element={<DayLimit navigate={navigate} />}
        />
        <Route
          path="view-changes/*"
          element={<ViewChanges navigate={navigate} />}
        />
      </Routes>
    </>
  );
};

export default ImpsConfirmation;
