import { useMutation, useQuery } from "react-query";
import {
  Fragment,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useState,
} from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import * as API from "./api";
import { DynFormGridMetaData } from "./gridMetadata";
import { AuthContext } from "pages_audit/auth";

import {
  utilFunction,
  GridWrapper,
  GridMetaDataType,
  queryClient,
  ActionTypes,
  GradientButton,
  PopupRequestWrapper,
  Alert,
  LoaderPaperComponent,
  ClearCacheContext,
} from "@acuteinfo/common-base";
import { DynamicFormMetadataWrapper } from "./dynFormMetadataConfigCrud/DynFormMetadataConfig";
import {
  AppBar,
  Box,
  Dialog,
  DialogActions,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";
const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "Edit Detail",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "retrieve",
    actionLabel: "Retrieve",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
export const DynFormMetadataConfig = () => {
  const isDataChangedRef = useRef(false);
  const myGridRef = useRef<any>(null);
  const { getEntries } = useContext(ClearCacheContext);
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(true);
  const [isOpenSave, setIsOpenSave] = useState<any>(false);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const { enqueueSnackbar } = useSnackbar();
  let currentPath = useLocation().pathname;
  const setCurrentAction = useCallback(
    (data) => {
      if (data?.name === "retrieve") {
        setOpen(true);
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getDynMetadataGridConfigData"], () =>
    API.getDynmetaListData({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
    })
  );
  const getDynamicLabel = (path: string, data: any, setScreenCode: boolean) => {
    const relativePath = path.replace("/EnfinityCore/", "");
    let cleanedPath;

    if (relativePath.includes("/")) {
      cleanedPath = relativePath.split("/").slice(0, 2).join("/");
    } else {
      cleanedPath = relativePath;
    }
    let screenList = utilFunction.GetAllChieldMenuData(data, true);
    const matchingPath = screenList.find((item) => item.href === cleanedPath);

    if (matchingPath) {
      return setScreenCode
        ? `${matchingPath.label} (${matchingPath.user_code.trim()})`
        : `${matchingPath.label}`;
    }

    return "";
  };

  const dynMetadataGridData: any = useMutation(
    API.getDynMetadataGridConfigData,
    {
      onSuccess: (data) => {
        isDataChangedRef.current = true;
        refetch();
      },
      onError: (error: any) => {},
    }
  );

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setFilteredData(data);
    }
  }, [isLoading, isFetching]);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDynMetadataGridConfigData"]);
    };
  }, [getEntries]);

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    const filtered = data.filter((item) =>
      item.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };
  const handleRowClick = (event: any, name: string) => {
    if (event.ctrlKey) {
      setSelectedRows([...selectedRows, name]);
    } else {
      setSelectedRows([name]);
    }
  };

  const handleRowDoubleClick = (name) => {
    dynMetadataGridData.mutate({
      DOC_CD: name,
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
    });
    setOpen(false);
  };
  const onClickButton = (rows, buttonName) => {
    setIsOpenSave(false);
  };

  const ClosedEventCall = useCallback(() => {
    navigate(".");
    if (isDataChangedRef.current === true) {
      myGridRef.current?.refetch?.();
      isDataChangedRef.current = false;
    }
  }, [navigate]);

  return (
    <>
      <Dialog
        open={open}
        //@ts-ignore
        PaperProps={{
          style: {
            width: "100%",
            // minHeight: "36vh",
            // height: "36vh",
          },
        }}
        maxWidth="sm"
      >
        <>
          <AppBar
            position="relative"
            color="secondary"
            style={{
              margin: "11px",
              width: "auto",
              background: "var(--theme-color5)",
            }}
          >
            <Toolbar variant={"dense"}>
              <Typography
                // className={headerClasses.title}
                color="inherit"
                variant={"h6"}
                component="div"
              >
                {getDynamicLabel(currentPath, authState?.menulistdata, true)}
              </Typography>
            </Toolbar>
          </AppBar>
          <>
            <TextField
              placeholder="Search"
              id=""
              name={"Search"}
              size="small"
              value={searchQuery}
              onChange={handleSearchInputChange}
              style={{ width: "96%", margin: "0 auto" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              //@ts-ignore
            />
            {isLoading || isFetching ? (
              <LoaderPaperComponent />
            ) : isError ? (
              <Fragment>
                <div style={{ width: "100%", paddingTop: "10px" }}>
                  <Alert
                    severity={error?.severity ?? "error"}
                    errorMsg={error?.error_msg ?? "Error"}
                    errorDetail={error?.error_detail ?? ""}
                  />
                </div>
              </Fragment>
            ) : (
              <Grid item xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                <Box
                  sx={{
                    width: "100%",
                    // maxWidth: 400,
                    bgcolor: "background.paper",
                    height: "35vh",
                    overflow: "scroll",
                    border: "ridge",
                    borderRadius: "3",
                  }}
                >
                  <nav aria-label="main mailbox folders">
                    <List
                      style={{
                        paddingTop: "0px",
                        paddingBottom: "0px",
                      }}
                    >
                      {filteredData?.map((item) => (
                        <ListItemData
                          key={item?.value}
                          name={item?.label}
                          disabled={false}
                          selected={selectedRows.includes(item?.value)}
                          onClick={(event) =>
                            handleRowClick(event, item?.value)
                          }
                          onDoubleClick={() =>
                            handleRowDoubleClick(item?.value)
                          }
                        />
                      ))}
                    </List>
                  </nav>
                </Box>
              </Grid>
            )}
            {isOpenSave ? (
              <PopupRequestWrapper
                MessageTitle="Data Validation"
                Message="Please Select One Row"
                onClickButton={(rows, buttonName) =>
                  onClickButton(rows, buttonName)
                }
                buttonNames={["Ok"]}
                rows={[]}
                open={isOpenSave}
              />
            ) : null}
          </>
          <DialogActions
            style={{
              marginTop: "2px",
              marginBottom: "2px",
              alignSelf: "center",
            }}
          >
            <>
              <GradientButton
                onClick={(e) => {
                  if (selectedRows.length === 0) {
                    setIsOpenSave(true);
                  } else {
                    dynMetadataGridData.mutate({
                      DOC_CD: selectedRows?.[0],
                      COMP_CD: authState?.companyID ?? "",
                      BRANCH_CD: authState?.user?.branchCode ?? "",
                    });
                    setOpen(false);
                    handleRowDoubleClick(selectedRows[0]);
                  }
                }}
              >
                Ok
              </GradientButton>

              <GradientButton
                // disabled={result.isLoading || isLocalLoding}
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </GradientButton>
            </>
          </DialogActions>
        </>
      </Dialog>

      {/* {dynMetadataGridData.isLoading || isFetching ? (
        <LoaderPaperComponent />
      ) : ( */}
      <>
        <GridWrapper
          key={"DynFormGridMetaData"}
          finalMetaData={DynFormGridMetaData as GridMetaDataType}
          data={dynMetadataGridData?.data ?? []}
          setData={() => null}
          loading={dynMetadataGridData.isLoading || isFetching}
          actions={actions}
          setAction={setCurrentAction}
          refetchData={() =>
            dynMetadataGridData.mutate({
              DOC_CD: selectedRows?.[0],
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
            })
          }
          ref={myGridRef}
          // defaultSortOrder={[{ id: "TRAN_CD", desc: false }]}
        />
        <Routes>
          <Route
            path="add/*"
            element={
              <DynamicFormMetadataWrapper
                isDataChangedRef={isDataChangedRef}
                closeDialog={ClosedEventCall}
                defaultView={"add"}
              />
            }
          />

          <Route
            path="view-details/*"
            element={
              <DynamicFormMetadataWrapper
                isDataChangedRef={isDataChangedRef}
                closeDialog={ClosedEventCall}
                defaultView={"view"}
              />
            }
          />
        </Routes>
        {/* {openAccept ? (
            <PopupMessageAPIWrapper
              MessageTitle="Confirmation"
              Message="Do you want to save this Request?"
              onActionYes={(rowVal) => onPopupYesAccept(rowVal)}
              onActionNo={() => onActionCancel()}
              rows={isErrorFuncRef.current?.data}
              open={openAccept}
              loading={mutation.isLoading}
            />
          ) : null} */}
      </>
      {/* )} */}
    </>
  );
};
export const ListItemData = ({
  name,
  disabled,
  selected,
  onClick,
  onDoubleClick,
}) => {
  //@ts-ignore

  return (
    <div>
      <ListItem
        button
        style={{
          color: "black",
          fontSize: "15px",
          backgroundColor: selected ? "#0000ff87" : "transparent",
          border: "0.5px solid #F3F6F9",
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <ListItemText primary={name} />
      </ListItem>
    </div>
  );
};
