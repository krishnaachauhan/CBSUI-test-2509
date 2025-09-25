import { FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Dialog from "@mui/material/Dialog";
import * as API from "../api";
import { positivePayFormMetaData } from "./metaData";
import {
  LoaderPaperComponent,
  GradientButton,
  queryClient,
  utilFunction,
  ImageViewer,
} from "@acuteinfo/common-base";
import { FormWrapper, Alert, MetaDataType } from "@acuteinfo/common-base";

export const PositivePayFormWrapper: FC<{
  onClose?: any;
  positiveData?: any;
}> = ({ onClose, positiveData }) => {
  const [isImageBlob, setIsImageBlob] = useState<any>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getPositivePayData", { ...positiveData }], () =>
    API.getPositivePayData({
      A_COMP_CD: positiveData?.COMP_CD,
      A_BRANCH_CD: positiveData?.BRANCH_CD,
      A_ACCT_TYPE: positiveData?.ACCT_TYPE,
      A_ACCT_CD: positiveData?.ACCT_CD,
      A_CHEQUE_NO: positiveData?.CHEQUE_NO,
    })
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getPositivePayData", positiveData]);
    };
  }, []);
  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open={true} // Assuming this is controlled by a state
        key="positivePayDialog"
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
      >
        {isLoading || isFetching ? (
          <LoaderPaperComponent />
        ) : (
          <>
            {isError && (
              <Alert
                severity={error?.severity ?? "error"}
                errorMsg={error?.error_msg ?? "Error"}
                errorDetail={error?.error_detail ?? ""}
              />
            )}
            <FormWrapper
              key={`positivePayForm`}
              metaData={positivePayFormMetaData as MetaDataType}
              initialValues={data?.[0]}
              onSubmitHandler={() => {}}
              formStyle={{
                background: "white",
              }}
              displayMode={"view"}
              onFormButtonClickHandel={async (id) => {
                if (data?.[0]?.CHEQUE_IMG) {
                  setIsImageOpen(true);
                  let blob = utilFunction.base64toBlob(data?.[0]?.CHEQUE_IMG);
                  setIsImageBlob(blob);
                }
              }}
            >
              {({ isSubmitting, handleSubmit }) => (
                <>
                  <GradientButton onClick={onClose}>Close</GradientButton>
                </>
              )}
            </FormWrapper>
          </>
        )}
      </Dialog>
      {isImageOpen ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              height: "60%",
              width: "60%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          <ImageViewer
            blob={isImageBlob}
            fileName={"Inward Clearing Process"}
            onClose={() => {
              setIsImageOpen(false);
            }}
          />
        </Dialog>
      ) : null}
    </>
  );
};
