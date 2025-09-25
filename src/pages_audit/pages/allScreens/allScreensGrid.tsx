import {
  GridWrapper,
  Alert,
  GradientButton,
  ActionTypes,
  GridMetaDataType,
  SearchBar,
  ClearCacheProvider,
  queryClient,
  PopupMessageAPIWrapper,
} from "@acuteinfo/common-base";
import { AllScreensGridMetaData, FavScreensGridMetaData } from "./gridMetadata";

import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { QueryClient, useMutation, useQuery } from "react-query";
import { Theme, Typography, useMediaQuery, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as API from "./api";
import { enqueueSnackbar } from "notistack";
import { LetterSearch } from "./alphaSearch";
import { ReportConfiguration } from "./reportConfiguration";
import i18n from "components/multiLanguage/languagesConfiguration";

const useHeaderStyles = makeStyles((theme: Theme) => ({
  title: {
    flex: "1 1 100%",
    color: "var(--theme-color2)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
    textTransform: "capitalize",
  },
}));

const actions: ActionTypes[] = [
  {
    actionName: "click to open",
    actionLabel: "click to open",
    multiple: false,
    rowDoubleClick: true,
    onEnterSubmit: true,
  },
];

interface QuickAccessTableProps {
  selectedSection?: string;
  onClose?: () => void;
}

const QuickAccessTable = ({
  selectedSection,
  onClose,
}: QuickAccessTableProps) => {
  const [apiData, setApiData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeButton, setActiveButton] = useState("ALL_SCREENS");
  const rowDataRef = useRef<any>(undefined);
  const dialogTitle = useRef("Add to Favourite(s) ?");
  const [isOpenSave, setIsOpenSave] = useState(false);
  const [openReportConfig, setOpenReportConfig] = useState(false);
  const [rowData, setRowData] = useState<any>({});

  const headerClasses = useHeaderStyles();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const theme = useTheme();
  const [queryData, setQueryData] = useState();
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
        FLAG: activeButton ?? "",
      },
    ],
    () =>
      API.QuickAccessTableGridData({
        COMP_CD: authState?.companyID ?? "",
        workingDate: authState.workingDate,
        BASE_BRANCH_CD: authState?.user?.branchCode ?? "",
        GROUP_NAME: authState?.roleName ?? "",
        APP_TRAN_CD: 51,
        FLAG: activeButton ?? "",
      }),
    { cacheTime: 0 }
  );

  const addFavMutation = useMutation(API.addToFavorite, {
    onSuccess: (data) => {
      setIsOpenSave(false);
      refetch();
      enqueueSnackbar(data ?? "Success.", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      setIsOpenSave(false);
      enqueueSnackbar(error?.error_msg ?? "Something went wrong...", {
        variant: "error",
      });
    },
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["QuickAccessTableGridData"]);
    };
  }, []);

  const setCurrentAction = useCallback(
    (data) => {
      let path = data?.rows?.[0]?.data?.HREF;
      if (Boolean(path)) {
        if (onClose && typeof onClose === "function") {
          onClose();
        }
        navigate("../" + path);
      }
    },
    [navigate, onClose]
  );

  // Function to filter data by selected section
  const filterDataBySection = useCallback(
    (dataList: any[], sectionLabel: string) => {
      if (!sectionLabel || !authState?.menulistdata) {
        return dataList;
      }

      // Find the section in menulistdata
      const section = authState.menulistdata.find(
        (menu: any) => menu.label?.toLowerCase() === sectionLabel.toLowerCase()
      );

      if (!section || !section.children) {
        return [];
      }

      // Get all system_codes from the section's children
      const sectionSystemCodes = section.children
        .map((child: any) => child.system_code?.trim())
        .filter(Boolean);

      if (sectionSystemCodes.length === 0) {
        return [];
      }

      // Filter the data to only include items that match the section's system codes
      const filteredData = dataList.filter((item: any) => {
        const itemDocCode = item.DOC_CD?.trim();
        return sectionSystemCodes.includes(itemDocCode);
      });

      return filteredData;
    },
    [authState?.menulistdata]
  );

  useEffect(() => {
    if (data) {
      const updatedChildren = data.map((item) => {
        const key = (item?.USER_DEFINE_CD || item?.DOC_CD)?.trim();
        const labelKey = key || item?.DOC_TITLE?.trim();

        return {
          ...item,
          DOC_TITLE: labelKey
            ? t(labelKey, { defaultValue: item.DOC_TITLE })
            : item.DOC_NM,
        };
      });

      // Apply section filtering if selectedSection is provided
      const finalData = selectedSection
        ? filterDataBySection(updatedChildren, selectedSection)
        : updatedChildren;

      setFilteredData(finalData);
      setApiData(finalData);
    }
  }, [data, i18n.language, selectedSection, filterDataBySection]);

  // Ensure section filtering is maintained when activeButton changes
  useEffect(() => {
    if (filteredData.length > 0) {
      setApiData(filteredData);
    }
  }, [activeButton, filteredData]);

  const handleSearch = (e) => {
    if (e.target.value === "") {
      setApiData(filteredData);
    } else {
      const filteredValue = filteredData.filter(
        ({ DOC_TITLE, USER_DEFINE_CD, DOC_CD }) =>
          [DOC_TITLE, USER_DEFINE_CD, DOC_CD].some((info) =>
            info?.toLowerCase().includes(e.target.value.toLowerCase())
          )
      );
      setApiData(filteredValue);
    }
  };

  const actionButtons = [
    {
      onClickValue: "RECENT",
      label: "Recent",
      color: "var(--theme-color4)",
      styles: {
        border: "1px solid var(--theme-color4)",
        background: activeButton === "RECENT" ? "" : "transparent",
        height: "auto",
        width: "71px",
        borderRadius: "08px",
      },
    },
    {
      onClickValue: "FAVOURITES",
      label: "Favourites",
      color: "var(--theme-color4)",
      styles: {
        border: "1px solid var(--theme-color4)",
        background: activeButton === "FAVOURITES" ? "" : "transparent",
        height: "auto",
        width: "71px",
        borderRadius: "08px",
      },
    },
    {
      onClickValue: "ALL_SCREENS",
      label: "AllScreens",
      color: "var(--theme-color4)",
      styles: {
        border: "1px solid var(--theme-color4)",
        background: activeButton === "ALL_SCREENS" ? "" : "transparent",
        height: "auto",
        width: "91px",
        borderRadius: "08px",
      },
    },
    ...(typeof onClose === "function"
      ? [
          {
            onClickValue: "CLOSE",
            label: "close",
            color: "var(--theme-color4)",
            styles: {
              border: "1px solid var(--theme-color4)",
              background: "transparent",
              height: "auto",
              borderRadius: "08px",
              marginLeft: "10px",
            },
          },
        ]
      : []),
  ];

  const onPopupYes = (rowData) => {
    addFavMutation.mutate({
      BRANCH_CD: authState.user.branchCode,
      DOC_CD: rowData?.DOC_CD,
      FAVOURITE: rowData?.FAVOURITE ? "N" : "Y",
    });
  };

  const onActionCancel = () => {
    setIsOpenSave(false);
  };

  const handleButtonClick = useCallback(
    (buttonId) => {
      if (buttonId === "CLOSE" && typeof onClose === "function") {
        onClose();
      } else {
        setActiveButton(buttonId);
      }
    },
    [onClose]
  );

  return (
    <>
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
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "3px 10px",
          justifyContent: "space-between",
          background: "var(--theme-color5)",
          borderTopLeftRadius: "5px",
          borderTopRightRadius: "5px",
        }}
      >
        <Typography
          className={headerClasses.title}
          color="secondary"
          variant={"h6"}
          component="div"
        >
          {selectedSection
            ? `${selectedSection} - ${t("AllScreens")}`
            : t("AllScreens")}
        </Typography>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {matches && (
            <SearchBar onChange={handleSearch} placeholder={t("Search")} />
          )}
          <div style={{ display: "flex", gap: 5 }}>
            {actionButtons?.map((button) => (
              <GradientButton
                key={button.onClickValue}
                onClick={() => handleButtonClick(button.onClickValue)}
                textColor={button.color}
                style={button.styles}
                disabled={isLoading || isFetching}
              >
                {t(button.label)}
              </GradientButton>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "3px 10px",
          background: "var(--theme-color4)",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <LetterSearch
          dataList={isLoading || isFetching ? [] : filteredData}
          setScreens={setApiData}
        />

        <GridWrapper
          key={`quickAccessGrid-${activeButton}`}
          finalMetaData={
            activeButton === "FAVOURITES"
              ? FavScreensGridMetaData
              : (AllScreensGridMetaData as GridMetaDataType)
          }
          data={apiData ?? []}
          setData={setApiData}
          actions={actions}
          setAction={setCurrentAction}
          controlsAtBottom={false}
          headerToolbarStyle={{
            backgroundColor: "inherit",
            color: "black",
          }}
          loading={isLoading || isFetching}
          refetchData={() => refetch()}
          onClickActionEvent={(...args) => {
            if (args?.[1] === "OPEN") {
              setRowData({ ...args?.[2] });
              setOpenReportConfig(true);
            } else {
              rowDataRef.current = args?.[2] ?? {};
              if (rowDataRef.current?.FAVOURITE) {
                dialogTitle.current = "Remove from Favourite(s) ?";
              } else {
                dialogTitle.current = "Add to Favourite(s) ?";
              }
              setIsOpenSave(true);
            }
          }}
        />
      </div>
      {isOpenSave ? (
        <PopupMessageAPIWrapper
          key={"add-fav"}
          MessageTitle={"Confirmation"}
          Message={dialogTitle.current}
          onActionYes={(rowVal) => onPopupYes(rowVal)}
          onActionNo={onActionCancel}
          loading={addFavMutation.isLoading}
          rows={rowDataRef.current}
          open={isOpenSave}
        />
      ) : null}
      {openReportConfig ? (
        <ReportConfiguration
          OpenDialogue={openReportConfig}
          closeDialogue={() => {
            setOpenReportConfig(false);
            queryClient.removeQueries(["getrReportSqlQuery"]);
          }}
          rowData={rowData ? rowData : {}}
        />
      ) : (
        ""
      )}
    </>
  );
};

interface AllScreensGridWrapperProps {
  selectedSection?: string;
  onClose?: () => void;
}

export const AllScreensGridWrapper = ({
  selectedSection,
  onClose,
}: AllScreensGridWrapperProps = {}) => {
  return (
    <ClearCacheProvider>
      <QuickAccessTable selectedSection={selectedSection} onClose={onClose} />
    </ClearCacheProvider>
  );
};
