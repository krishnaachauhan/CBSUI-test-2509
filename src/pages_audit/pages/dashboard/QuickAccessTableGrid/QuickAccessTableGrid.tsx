import { QuickAccessTableGridMetaData } from "./gridMetaData";
import {
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  ClearCacheProvider,
  queryClient,
  SearchBar,
  Alert,
  GradientButton,
  usePopupContext,
} from "@acuteinfo/common-base";

import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import * as API from "../api";
import { useQuery } from "react-query";
import {
  Box,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import i18n from "components/multiLanguage/languagesConfiguration";

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color2)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--theme-color1)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
}));

const QuickAccessTableGrid = () => {
  const actions: ActionTypes[] = [
    {
      actionName: "click to open",
      actionLabel: "click to open",
      multiple: false,
      rowDoubleClick: true,
    },
  ];
  const [apiData, setApiData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeButton, setActiveButton] = useState("Favourites");
  const headerClasses = useHeaderStyles();
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up(1256));
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch, isError, error } = useQuery<
    any,
    any
  >(
    [
      "QuickAccessTableGridData",
      {
        COMP_CD: authState?.companyID ?? "",
        BASE_BRANCH_CD: authState?.user?.branchCode ?? "",
        GROUP_NAME: authState?.roleName ?? "",
        APP_TRAN_CD: "51",
        FLAG: activeButton ?? "",
      },
    ],
    () =>
      API.QuickAccessTableGridData({
        COMP_CD: authState?.companyID ?? "",

        BASE_BRANCH_CD: authState?.user?.branchCode ?? "",
        GROUP_NAME: authState?.roleName ?? "",
        APP_TRAN_CD: "51",
        FLAG: activeButton ?? "",
      })
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["QuickAccessTableGridData"]);
    };
  }, []);

  const setCurrentAction = useCallback(
    (data) => {
      let path = data?.rows?.[0]?.data?.HREF;
      if (data?.rows?.[0]?.data?.ALLOW_OPEN !== "Y") {
        MessageBox({
          messageTitle: "You are not authorized.",
          message: `${data?.rows?.[0]?.data?.DOC_NM} Screen is Restricted for ${authState?.role} user level.`,
          icon: "ERROR",
        });
      } else {
        if (Boolean(path)) {
          navigate("../" + path);
        }
      }
    },
    [navigate]
  );

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
  };

  useEffect(() => {
    if (data) {
      const updatedChildren = data.map((item) => {
        const key = (item?.USER_DEFINE_CD || item?.DOC_CD)?.trim();
        const labelKey = key || item?.DOC_NM?.trim();

        return {
          ...item,
          DOC_NM: labelKey
            ? t(labelKey, { defaultValue: item.DOC_NM })
            : item.DOC_NM,
        };
      });

      setApiData(updatedChildren);
      setFilteredData(updatedChildren);
    }
  }, [data, i18n.language]);

  const handleSearch = (e) => {
    if (e.target.value === "") {
      setApiData(filteredData);
    } else {
      const filtredValue = filteredData.filter(
        ({ DOC_NM, USER_DEFINE_CD, DOC_CD }) =>
          [DOC_NM, USER_DEFINE_CD, DOC_CD].some((info) =>
            info.toLowerCase().includes(e.target.value.toLowerCase())
          )
      );
      setApiData(filtredValue);
    }
  };

  return (
    <>
      {/* <AppBar
        position="relative"
        color="primary"
        style={{ marginBottom: "5px" }}
      > */}
      {isError ? (
        <Fragment>
          <div style={{ width: "100%", paddingTop: "10px" }}>
            <Alert
              severity={error?.severity ?? "error"}
              errorMsg={error?.error_msg ?? "Error"}
              errorDetail={error?.error_detail ?? ""}
            />
          </div>
        </Fragment>
      ) : null}
      <Toolbar className={headerClasses.root} variant={"dense"}>
        {" "}
        <Typography
          className={headerClasses.title}
          color="secondary"
          variant={"h6"}
          component="div"
        >
          {t("QuickAccess")}
        </Typography>
        {matches && (
          <Box
            sx={{
              height: "48px",
              width: "51px",
              paddingRight: "91px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {" "}
            <Typography
              style={{
                color: "var(--theme-color3)",
                transition: "all 0.5s ease-in-out",
              }}
              variant="subtitle1"
              component="h2"
            >
              {t(activeButton)}
            </Typography>
          </Box>
        )}
        {matches && (
          <SearchBar onChange={handleSearch} placeholder={t("Search")} />
        )}{" "}
        <Box
          sx={{
            display: "flex",
            backgroundColor: "var(--theme-color4)",
            height: "39px",
            alignItems: "center",
            width: "100%",
            borderRadius: "12px",
            justifyContent: "center",
          }}
        >
          <GradientButton
            onClick={() => handleButtonClick("Recent")}
            textColor={
              activeButton === "Recent"
                ? "var(--theme-color2)"
                : "var(--theme-color1)"
            }
            style={{
              backgroundColor:
                activeButton === "Recent" ? "var(--theme-color1)" : "inherit",
              height: "auto",
              width: "auto",
              borderRadius: "08px",
              // color:
              //   activeButton === "Recent"
              //     ? "var(--theme-color2)"
              //     : "var(--theme-color6)",
            }}
          >
            {t("Recent")}
          </GradientButton>
          <GradientButton
            onClick={() => handleButtonClick("Favourites")}
            textColor={
              activeButton === "Favourites"
                ? "var(--theme-color2)"
                : "var(--theme-color1)"
            }
            style={{
              backgroundColor:
                activeButton === "Favourites"
                  ? "var(--theme-color3)"
                  : "inherit",
              height: "auto",
              width: "auto",
              borderRadius: "08px",
              // color:
              //   activeButton === "Favourites"
              //     ? "var(--theme-color2)"
              //     : "var(--theme-color6)",
            }}
          >
            {t("Favourites")}
          </GradientButton>
        </Box>
      </Toolbar>
      {/* </AppBar> */}
      <GridWrapper
        key={`quickAccessGrid`}
        finalMetaData={QuickAccessTableGridMetaData as GridMetaDataType}
        data={apiData ?? []}
        setData={() => null}
        actions={actions}
        setAction={setCurrentAction}
        controlsAtBottom={false}
        headerToolbarStyle={{
          backgroundColor: "inherit",
          color: "black",
        }}
        loading={isLoading || isFetching}
        refetchData={() => refetch()}
      />
    </>
  );
};

export const QuickAccessTableGridWrapper = () => {
  return (
    <ClearCacheProvider>
      <QuickAccessTableGrid />
    </ClearCacheProvider>
  );
};
