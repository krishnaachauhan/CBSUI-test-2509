import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import {
  queryClient,
  LoaderPaperComponent,
  GradientButton,
  PopupMessageAPIWrapper,
  PopupRequestWrapper,
  MetaDataType,
  FormWrapper,
  MasterDetailsForm,
  SubmitFnType,
} from "@acuteinfo/common-base";
import * as API from "./api";
import {
  AppBar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  Grid,
  InputAdornment,
  ListItem,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { List } from "reactstrap";
import { addCategoryFormMetadata, commonMSTGridMetaData } from "./metaData";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import SearchIcon from "@mui/icons-material/Search";

interface editMasterDataType {
  data: object;
  displayData?: object;
  endSubmit?: any;
  setFieldError?: any;
  SetLoadingOWN?: any;
}
const editMasterFormDataFnWrapper =
  (editMasterData) =>
  async ({ data }: editMasterDataType) => {
    return editMasterData(data);
  };
export const CommonMSTConfig = () => {
  //  const actionClasses = useStyles();
  const [open, setOpen] = useState(true);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [isOpenSave, setIsOpenSave] = useState<any>(false);
  const [openAccept, setopenAccept] = useState(false);
  const myRef = useRef<any>(null);
  const myFormRef = useRef<any>(null);
  const isErrorFuncRef = useRef<any>(null);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addCategory, setAddCategory] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery(
    ["getMiscListData"],
    () => API.getMiscListData()
  );
  const miscGridData: any = useMutation(API.getProMiscData, {
    onSuccess: (data) => {},
    onError: (error: any) => {},
  });

  const mutation = useMutation(
    editMasterFormDataFnWrapper(API.editMiscMSTconfig()),
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        if (isErrorFuncRef.current == null) {
          enqueueSnackbar(errorMsg, {
            variant: "error",
          });
        } else {
          isErrorFuncRef.current?.endSubmit(
            false,
            errorMsg,
            error?.error_detail ?? ""
          );
        }
        onActionCancel();
      },
      onSuccess: (data) => {
        enqueueSnackbar(data, {
          variant: "success",
        });
        onActionCancel();
        miscGridData.mutate({ categoryCD: selectedRows?.[0] });
      },
    }
  );

  const onPopupYesAccept = (rows) => {
    mutation.mutate({
      data: { ...rows, CATEGORY_CD: selectedRows?.[0] },
    });
  };

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setFilteredData(data);
    }
  }, [isLoading, isFetching]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getMiscListData"]);
      queryClient.removeQueries(["getProMiscData"]);
    };
  }, []);

  const onFormSubmitHandler: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    // @ts-ignore
    endSubmit(true);
    let val = { value: data?.CATEGORY_CD, label: data?.CATEGORY_CD };
    setFilteredData([val, ...filteredData]);
  };

  const onSubmitHandler = ({ data, displayData, endSubmit, setFieldError }) => {
    //@ts-ignore
    endSubmit(true);
    isErrorFuncRef.current = { data, displayData, endSubmit, setFieldError };
    setopenAccept(true);
  };

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
    miscGridData.mutate({
      categoryCD: name,
    });
    setOpen(false);
  };

  const AddNewRow = () => {
    myRef.current?.addNewRow(true);
  };

  const onClickButton = (rows, buttonName) => {
    setIsOpenSave(false);
  };

  const onActionCancel = () => {
    setopenAccept(false);
  };

  commonMSTGridMetaData.masterForm.form.label =
    "Common Master Configuration :   " + selectedRows?.[0];

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
        {Boolean(addCategory) ? (
          <FormWrapper
            key={"PaymentDetailsRetrieval"}
            metaData={addCategoryFormMetadata as MetaDataType}
            // initialValues={defaultData as InitialValuesType}
            onSubmitHandler={onFormSubmitHandler}
            //@ts-ignore
            formStyle={{
              background: "white",
              height: "calc(42vh - 140px)",
              // overflowY: "auto",
              // overflowX: "hidden",
            }}
            // controlsAtBottom={true}
            containerstyle={{ padding: "10px" }}
            ref={myFormRef}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <Button
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                    setAddCategory(false);
                  }}
                  disabled={isSubmitting}
                  //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  color={"primary"}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setAddCategory(false);
                  }}
                  color={"primary"}
                  disabled={isSubmitting}
                >
                  Close
                </Button>
              </>
            )}
          </FormWrapper>
        ) : (
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
                  Common Master Configuration
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
                  // disabled={result.isLoading || isLocalLoding}
                  onClick={() => {
                    setAddCategory(true);
                    // setOpen(false);
                  }}
                >
                  Add Category
                </GradientButton>
                <GradientButton
                  onClick={(e) => {
                    if (selectedRows.length === 0) {
                      setIsOpenSave(true);
                    } else {
                      miscGridData.mutate({
                        categoryCD: selectedRows?.[0],
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
        )}
      </Dialog>

      {miscGridData.isLoading || miscGridData.isFetching ? (
        <LoaderPaperComponent />
      ) : (
        <>
          <MasterDetailsForm
            key={"commonMSTGrid"}
            metaData={commonMSTGridMetaData}
            ref={myRef}
            initialData={{
              _isNewRow: false,
              DETAILS_DATA: miscGridData?.data,
            }}
            // displayMode={formMode}
            isLoading={false}
            onSubmitData={onSubmitHandler}
            // isNewRow={true}
            // isNewRow={formMode === "new"}
            formStyle={{
              background: "white",
              // height: "20vh",
              overflowY: "auto",
              overflowX: "hidden",
              // padding: "0 0 0 0 !important",
            }}
            containerstyle={{ padding: "10px" }}
          >
            {({ isSubmitting, handleSubmit }) => {
              return (
                <>
                  <Button
                    onClick={() => {
                      setOpen(true);
                      // refetch();
                    }}
                    disabled={isSubmitting}
                    color={"primary"}
                  >
                    Retrieve
                  </Button>
                  <Button
                    onClick={AddNewRow}
                    disabled={isSubmitting}
                    color={"primary"}
                  >
                    Add Row
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    endIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    color={"primary"}
                  >
                    Save
                  </Button>
                </>
              );
            }}
          </MasterDetailsForm>
          {openAccept ? (
            <PopupMessageAPIWrapper
              MessageTitle="Confirmation"
              Message="Do you want to save this Request?"
              onActionYes={(rowVal) => onPopupYesAccept(rowVal)}
              onActionNo={() => onActionCancel()}
              rows={isErrorFuncRef.current?.data}
              open={openAccept}
              loading={mutation.isLoading}
            />
          ) : null}
        </>
      )}
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
