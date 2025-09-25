import { ClearCacheProvider } from "@acuteinfo/common-base";
import PmbyRegMst from "../pmbyRegMst";

export const PmbyRegConfirmation = () => {
  return (
    <ClearCacheProvider>
      <PmbyRegMst screenType={"C"} />
    </ClearCacheProvider>
  );
};
