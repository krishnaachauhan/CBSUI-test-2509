import {
  Fragment,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { LoginBiometricForm } from "./metaData/metaDataForm";
import { SecurityContext } from "../context/SecuityForm";
import { useMutation, useQuery } from "react-query";
import * as API from "./api/api";
import { ActionTypes, Alert } from "@acuteinfo/common-base";
import { useNavigate } from "react-router-dom";
import { loginBiometric } from "./metaData/metaDataGrid";
import { Box, Dialog } from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import CryptoJS from "crypto-js";
import {
  InitialValuesType,
  usePopupContext,
  GradientButton,
  extractGridMetaData,
  SubmitFnType,
  GridWrapper,
  GridMetaDataType,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
import { t } from "i18next";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    alwaysAvailable: true,
    rowDoubleClick: false,
  },
];
const encryptString = (plainText) => {
  const secretKey = "SUPERACUTE@MKS";
  var keyBytes = CryptoJS.PBKDF2(secretKey, "Ivan Medvedev", {
    keySize: 48 / 4,
    iterations: 1000,
  });
  const key = new CryptoJS.lib.WordArray.init(
    keyBytes.words.slice(0, 32 / 4),
    32
  );
  const iv = new CryptoJS.lib.WordArray.init(keyBytes.words.slice(32 / 4), 16);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv: iv });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
};
const BiometricLogins = forwardRef<any, any>(
  ({ defaultView, userId, username, flag }, ref) => {
    const { MessageBox } = usePopupContext();
    const { userState, dispatchCommon } = useContext(SecurityContext);
    const navigate = useNavigate();
    const [opens, setOpens] = useState(false);
    const [gridData, setGridData] = useState<any>([]);
    const formRef = useRef<any>(null);
    const SubmitData = useRef<any>(null);
    const [formData, setFormData] = useState<any>(null);
    const [fingerprintImage, setFingerprintImage] = useState<string>("");
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureError, setCaptureError] = useState<string>("");
    const Usernames = username?.USER_NAME;
    const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
      any,
      any
    >(
      ["getBiometric", Usernames],
      () => {
        if (flag === "editMode" || flag === "viewMode") {
          return API.getBiometric({ userid: Usernames });
        }
      },
      {
        onSuccess(data) {
          if (Array.isArray(data) && data.length > 0) {
            let newData = data.map((row) => {
              return {
                ...row,
              };
            });
            setGridData(newData);
          } else {
            setGridData([]);
          }
        },
      }
    );

    const CaptureMutation = useMutation(API.BioCapture, {
      onSuccess: async (data) => {
        if (data?.ErrorDescription) {
          setCaptureError(data.ErrorDescription);
        } else {
          const Saving = data.IsoTemplate;
          const encryptedTemplate = encryptString(Saving);
          SubmitData.current = encryptedTemplate;
          setFingerprintImage(data.BitmapData);
        }
        setIsCapturing(false);
      },
    });

    const setCurrentAction = useCallback(
      (data) => {
        if (data.name === "add") {
          setOpens(true);
          setFormData(null);
        } else {
          navigate(data?.name, {
            state: data?.rows,
          });
        }
      },
      [navigate]
    );

    const handleCaptureClick = () => {
      setIsCapturing(true);
      setCaptureError("");
      CaptureMutation.mutate();
    };

    const onSubmitHandler: SubmitFnType = (
      data: any,
      displayData,
      endSubmit,
      setFieldError,
      actionFlag
    ) => {
      endSubmit(true);
      if (formData) {
        // Update existing row
        setGridData((old) => {
          const updatedData = old?.map((row) =>
            row.SR_CD === formData.SR_CD
              ? { ...row, ...data, FINGER_BIO: SubmitData?.current }
              : row ?? ""
          );
          return updatedData;
        });
      } else {
        // Add new row
        setGridData((old) => {
          const srCd =
            Number.parseInt(old?.[old?.length - 1]?.SR_CD ?? "0") + 1;
          return [
            ...(old ?? ""),
            { ...data, SR_CD: srCd, FINGER_BIO: SubmitData?.current },
          ];
        });
      }
      setFormData(null);
    };
    useEffect(() => {
      if (userState?.grid5?.isNewRow?.length > 0) {
        const contextData = userState?.grid5?.isNewRow;
        const combined = [...(data ?? ""), ...(contextData ?? "")];
        setGridData(combined);
      } else {
        setGridData(data);
      }
    }, [userState?.grid1?.isNewRow, data]);
    const updateBiometric = {
      ...LoginBiometricForm,
      fields: LoginBiometricForm.fields.map((field) => {
        if (field.name === "USER_NAME") {
          return {
            ...field,
            defaultValue: userId ?? "",
          };
        }
        return field;
      }),
    };

    useEffect(() => {
      if (data) {
        dispatchCommon("commonType", { oldData3: data });
      }
    }, [data]);

    return (
      <Fragment>
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
            errorDetail={error?.error_detail}
            color="error"
          />
        )}
        <Box
          style={{
            padding: "0 10px 0px 10px",
          }}
        >
          <GridWrapper
            key={"LoginBiometrics"}
            finalMetaData={
              extractGridMetaData(
                loginBiometric,
                defaultView
              ) as GridMetaDataType
            }
            actions={
              defaultView === "edit" || flag === "addMode" ? actions : []
            }
            setAction={setCurrentAction}
            data={gridData ?? []}
            loading={isLoading || isFetching}
            setData={setGridData}
            hideHeader={true}
            onClickActionEvent={(index, id, currentData) => {
              if (id === "Edit") {
                formRef?.current?.cleanData?.();
                setFormData(currentData);
                setOpens(true);
              } else if (id === "Delete") {
                setGridData((old) => {
                  return [...old, { ...data }];
                });
                let newData = gridData.filter(
                  (row) => row.SR_CD !== currentData?.SR_CD
                );
                setGridData(newData);
              }
            }}
            ref={ref}
            refetchData={() => {
              refetch();
            }}
          />
        </Box>
        <Dialog open={opens} onClose={() => setOpens(false)}>
          <>
            <FormWrapper
              key={"BiometricLogin"}
              metaData={updateBiometric as MetaDataType}
              initialValues={formData ?? ({} as InitialValuesType)}
              onSubmitHandler={onSubmitHandler}
              formStyle={{ height: "180px" }}
              formState={{ MessageBox: MessageBox }}
              ref={formRef}
            >
              {({ isSubmitting, handleSubmit }) => (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                      setOpens(false);
                    }}
                    disabled={isSubmitting}
                    color={"primary"}
                  >
                    Save
                  </GradientButton>
                  <GradientButton
                    onClick={handleCaptureClick}
                    disabled={isSubmitting}
                    color={"primary"}
                  >
                    Capture
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setFormData(null);
                      setOpens(false);
                    }}
                    color={"primary"}
                  >
                    Cancel
                  </GradientButton>
                </>
              )}
            </FormWrapper>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  border: "2px solid black",
                  width: "300px",
                  height: "300px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isCapturing ? (
                  <p>Capturing...</p>
                ) : captureError ? (
                  <p>Error: {captureError}</p>
                ) : fingerprintImage ? (
                  <img
                    id="imgFinger"
                    width="200px"
                    height="200px"
                    alt="Finger Image"
                    src={`data:image/bmp;base64,${fingerprintImage}`}
                  />
                ) : (
                  <FingerprintIcon style={{ fontSize: "100px" }} />
                )}
              </div>
            </div>
          </>
        </Dialog>
      </Fragment>
    );
  }
);

export default BiometricLogins;
