import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStyles } from "./style";
import { useTranslation } from "react-i18next";
import {
  utilFunction,
  SearchBar,
  GradientButton,
} from "@acuteinfo/common-base";
import SearchIcon from "@mui/icons-material/Search";

const getStoredScreens = (defaultData, t) => {
  const labelConvert = defaultData.map((item) => ({
    ...item,
    label: t(
      item?.navigationProps
        ? `reportID${item?.system_code ?? ""}`
        : item.system_code,
      { defaultValue: item.label }
    ),
  }));
  const store = localStorage.getItem("routeHistory");
  if (store) {
    const parsedData = JSON.parse(store);
    const filteredData: any = [];
    parsedData.forEach(({ system_code, user_code }) => {
      const foundScreen = labelConvert.find(
        (screen) =>
          screen.system_code === system_code || screen.user_code === user_code
      );
      if (foundScreen) {
        filteredData.push(foundScreen);
      }
    });
    return filteredData;
  }
  return defaultData.slice(0, 5);
};

const getScreenCode = (data) => {
  return data.map((path) => ({
    system_code: path.system_code,
    user_code: path.user_code,
  }));
};

const SearchScreen = () => {
  const [listOpen, setListOpen] = useState<any>(false);
  const [searchText, setSearchText] = useState<any>("");
  const [selectedItem, setSelectedItem] = useState<any>(0);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const above1300 = useMediaQuery("(min-width:1300px)");
  const listRef = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const navigate = useNavigate();
  const classes = useStyles();
  const { t } = useTranslation();
  const authController = useContext(AuthContext);

  const allScreenData = useMemo(() => {
    let responseData = utilFunction.GetAllChieldMenuData(
      authController?.authState?.menulistdata,
      true
    );
    return responseData;
  }, [authController.authState.menulistdata]);
  const [screenData, setScreenData] = useState<any>([]);

  const handleLinkClick = (data) => {
    if (!data) return;
    const link = data?.navigationProps
      ? data.href + "?" + new URLSearchParams(data?.navigationProps).toString()
      : data.href;
    setListOpen(false);
    setOpenSearchDialog(false);
    setSearchText("");
    setSelectedItem(0);
    handleStoreRecent(data);
    setScreenData(getStoredScreens(allScreenData, t));
    if (inputRef.current) inputRef.current?.handleBlur();
    navigate(link);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && selectedItem >= 0) {
      e.preventDefault(); // Prevent browser default (like form submit)
      e.stopPropagation(); // Prevent bubbling to search icon
      handleLinkClick(screenData[selectedItem]); // ✅ Still perform action
      return;
    }

    // to close list when press tab
    if (e.key === "Tab") {
      setListOpen(false);
      setOpenSearchDialog(false);
      return;
    }
    const container = document.getElementById("list-box");
    if (e.key === "ArrowUp" && selectedItem > 0) {
      setSelectedItem((prev) => prev - 1);
      scrollSelectedItemIntoView(container, selectedItem - 1);
    } else if (e.key === "ArrowDown" && selectedItem < screenData.length - 1) {
      setSelectedItem((prev) => prev + 1);
      scrollSelectedItemIntoView(container, selectedItem + 1);
    } else if (e.key === "Enter" && selectedItem >= 0) {
      handleLinkClick(screenData[selectedItem]);
    }
  };

  const scrollSelectedItemIntoView = (container, index) => {
    const items = container.querySelectorAll(".list-links");
    if (items[index]) {
      items[index].scrollIntoView({
        block: "center",
      });
    }
  };

  const handleChange = (e) => {
    if (selectedItem >= 0) setSelectedItem(0);
    setSearchText(e.target.value);
  };

  const handleStoreRecent = (data) => {
    const storedPaths = JSON.parse(
      localStorage.getItem("routeHistory") || "[]"
    );
    const duplicate = storedPaths.filter(
      (item) => item.system_code === data.system_code
    );
    if (duplicate.length === 0) {
      const updatedPaths = [data, ...storedPaths].slice(0, 5);
      const toStore = getScreenCode(updatedPaths);
      localStorage.setItem("routeHistory", JSON.stringify(toStore));
    }
  };

  useEffect(() => {
    if (searchText === "") {
      setScreenData(getStoredScreens(allScreenData, t));
    } else {
      const filtredValue = allScreenData
        .map((item) => ({
          ...item,
          label: t(
            item?.navigationProps
              ? `reportID${item?.system_code ?? ""}`
              : item.system_code,
            { defaultValue: item.label }
          ),
        }))
        .filter(({ label, user_code, allow_open }) => {
          return (
            [label, user_code].some((info) =>
              info?.toLowerCase().includes(searchText.toLowerCase())
            ) && allow_open === "Y"
          );
        });

      setScreenData(filtredValue);
    }
  }, [searchText, allScreenData, t]);
  useEffect(() => {
    const localStorageScreenData = JSON.parse(
      localStorage.getItem("routeHistory") as string
    );
    let filteredData: any = [];
    if (localStorageScreenData) {
      filteredData = localStorageScreenData.filter((localData) => {
        return allScreenData.some((screenData) => {
          return localData.system_code === screenData.system_code;
        });
      });
    }
    let finalFilteredData = [...filteredData];
    for (let i = filteredData.length; i < 5; i++) {
      if (allScreenData[i]) {
        finalFilteredData.push(allScreenData[i]);
      }
    }
    const storeFinalData = getScreenCode(finalFilteredData);
    localStorage.setItem("routeHistory", JSON.stringify(storeFinalData));

    const defaultInit = getStoredScreens(allScreenData, t);
    const initData = getScreenCode(defaultInit);
    localStorage.setItem("routeHistory", JSON.stringify(initData));

    const handleClickOutside = (event) => {
      if (listRef.current && !listRef.current.contains(event.target)) {
        setListOpen(false);
        setOpenSearchDialog(false);
        setSelectedItem(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* search bar of screens */}
      {above1300 ? (
        <Box ref={listRef} position="relative" className="global-screen-search">
          <SearchBar
            ref={inputRef}
            placeholder={t("DashboardSearchbar", {
              length: allScreenData.length,
            })}
            className={`${classes.searchBar} route-search-bar`}
            onChange={handleChange}
            value={searchText}
            onFocus={() => setListOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {listOpen ? (
            <Stack id="list-box" className={classes.searchList}>
              {screenData?.length > 0 ? (
                screenData?.map((data: any, index: any) => (
                  <button
                    key={`${data.user_code} + ${index}`}
                    className={
                      selectedItem === index
                        ? "list-links active"
                        : "list-links"
                    }
                    onClick={() => handleLinkClick(data)}
                  >
                    <Typography
                      sx={{ fontSize: ".875rem", fontWeight: 500 }}
                    >{`${data.label} - ${data.user_code}`}</Typography>
                  </button>
                ))
              ) : (
                <span style={{ padding: "1rem", color: "#888" }}>
                  {t("NoScreenfound")}
                </span>
              )}
            </Stack>
          ) : null}
        </Box>
      ) : (
        <IconButton
          disableRipple
          onClick={() => setOpenSearchDialog(true)}
          size="medium"
          sx={{
            color: "var(--theme-color3)",
            position: "static",
            background: "transperant",
            "&:hover": {
              background: "var(--theme-color4)",
            },
          }}
        >
          <SearchIcon sx={{ fontSize: "2rem" }} />
        </IconButton>
      )}
      {openSearchDialog && (
        <Dialog
          open={openSearchDialog}
          onClose={(event: any) => {
            event.currentTarget.blur();
            setOpenSearchDialog(false);
          }}
          maxWidth={false} // let it auto-fit width
          PaperProps={{
            sx: {
              borderRadius: 2,
              padding: 1,
              maxHeight: "80vh", // responsive height
              display: "flex",
              flexDirection: "column",
              minWidth: "fit-content", // match to widest result
              height: "45vh",
            },
          }}
        >
          {/* Title Bar */}
          <AppBar
            position="static"
            sx={{
              background: "var(--theme-color5)",
              margin: "2px",
              width: "auto",
              marginBottom: "10px",
            }}
          >
            <Toolbar
              sx={{
                paddingLeft: "24px",
                paddingRight: "24px",
                minHeight: "48px !important",
              }}
            >
              <Typography
                style={{ flexGrow: 1 }}
                sx={{
                  color: "var(--theme-color2)",
                  fontSize: "1.25rem",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  fontWeight: 500,
                  lineHeight: "1.6px",
                  letterSpacing: "0.0075em",
                }}
              >
                {t("Searchscreen")}
              </Typography>
              <div style={{ display: "flex", alignItems: "center" }}>
                <GradientButton
                  size="small"
                  onClick={() => setOpenSearchDialog(false)}
                >
                  {t("Close")}
                </GradientButton>
              </div>
            </Toolbar>
          </AppBar>
          {/* Search Bar & Results */}
          <DialogContent
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              pt: 0,
            }}
          >
            <Box
              ref={listRef}
              position="relative"
              className="global-screen-search"
            >
              <SearchBar
                ref={inputRef}
                placeholder={t("DashboardSearchbar", {
                  length: allScreenData.length,
                })}
                className={`${classes.searchBar} route-search-bar`}
                onChange={handleChange}
                value={searchText}
                onFocus={() => setListOpen(true)}
                onKeyDown={handleKeyDown}
                autoFocus={true}
              />
              {listOpen ? (
                <Stack id="list-box" className={classes.searchList}>
                  {screenData?.length > 0 ? (
                    screenData?.map((data: any, index: any) => (
                      <button
                        key={`${data.user_code} + ${index}`}
                        className={
                          selectedItem === index
                            ? "list-links active"
                            : "list-links"
                        }
                        onClick={() => handleLinkClick(data)}
                      >
                        <Typography
                          sx={{ fontSize: ".875rem", fontWeight: 500 }}
                        >{`${data.label} - ${data.user_code}`}</Typography>
                      </button>
                    ))
                  ) : (
                    <span style={{ padding: "1rem", color: "#888" }}>
                      {t("NoScreenfound")}
                    </span>
                  )}
                </Stack>
              ) : null}
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SearchScreen;
