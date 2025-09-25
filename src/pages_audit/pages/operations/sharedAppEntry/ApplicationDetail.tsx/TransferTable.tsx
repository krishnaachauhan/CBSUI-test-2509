import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import { Fragment, forwardRef } from "react";
import { extractMetaData, usePopupContext } from "@acuteinfo/common-base";
import { ShareAppEntryTransferFormMetaData } from "../../sharedAppEntry/ApplicationDetail.tsx/TransferTableMetaData";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { Dialog } from "@mui/material";
import useTransferTable from "./Hooks/useTransferTable";

export const TransferTable = forwardRef<any, any>(
  (
    { defaultView, formRef, CUSTOMER_ID, onSubmitTransTableHandler, SHARE_AMT },
    ref: any
  ) => {
    const {
      initialVal,
      MessageBox,
      docCD,
      showMessageBox,
      handleSignViewClick,
      openPhotoSign,
      photoSignReqRef,
      setOpenPhotoSign,
    } = useTransferTable({ CUSTOMER_ID, formRef, ref });

    return (
      <Fragment>
        <FormWrapper
          key={"recurringPaymentTransferForm" + defaultView}
          metaData={
            extractMetaData(
              ShareAppEntryTransferFormMetaData,
              defaultView
            ) as MetaDataType
          }
          initialValues={initialVal}
          onSubmitHandler={onSubmitTransTableHandler}
          ref={ref}
          formState={{
            MessageBox: MessageBox,
            docCD: docCD,
            showMessageBox: showMessageBox,
            formRef: formRef,
            SHARE_AMT: SHARE_AMT,
          }}
          displayMode={defaultView}
          formStyle={{
            background: "white",
          }}
          hideHeader={true}
          onFormButtonClickHandel={async (id, dependentFields) =>
            handleSignViewClick({ id, dependentFields })
          }
        />
        {openPhotoSign ? (
          <Dialog
            open={true}
            fullWidth={true}
            PaperProps={{
              style: {
                width: "100%",
                overflow: "auto",
              },
            }}
            maxWidth="lg"
          >
            <PhotoSignWithHistory
              data={{
                ...photoSignReqRef.current,
              }}
              onClose={() => {
                setOpenPhotoSign(false);
              }}
            />
          </Dialog>
        ) : null}
      </Fragment>
    );
  }
);
