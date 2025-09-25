import { ClearCacheProvider } from "@acuteinfo/common-base";
import { RtgsBranchHoConfirmationGrid } from "./RtgsBranchHoConfirmGrid";

export const RtgsBulkBranchHoConfirmationGrid = ({ flag, screenFlag }) => {
  return (
    <>
      <ClearCacheProvider>
        <RtgsBranchHoConfirmationGrid
          key={flag + "-CtsOutwardClearingGrid"}
          flag={flag}
          screenFlag={screenFlag}
        />
      </ClearCacheProvider>
    </>
  );
};
