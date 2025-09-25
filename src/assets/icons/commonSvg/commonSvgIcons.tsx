import WorkInProgressIcons from "./svgFiles/work-in-progress.svg";
import Standing from "./svgFiles/STANDING INSTRUCTIONS.svg";
import Lien from "./svgFiles/LIEN.svg";
import OwChqOBCIBC from "./svgFiles/OUTWARD CHEQUE OBC IBC.svg";
import TempODAgainst from "./svgFiles/TEMP. OD AGAINST.svg";
import ATMCard from "./svgFiles/ATM CARD.svg";
import IMPS from "./svgFiles/IMPS 1.svg";
import ASBA from "./svgFiles/ASBA.svg";
import ACHIW from "./svgFiles/ACH INWARD.svg";
import ACHOW from "./svgFiles/ACH OUTWARD.svg";
import SpInstruction from "./svgFiles/SP. INSTRUCTIONS.svg";
import GroupAcs from "./svgFiles/GROUP ACCOUNT.svg";
import APY from "./svgFiles/APY.svg";
import APBS from "./svgFiles/APBS.svg";
import PMBY from "./svgFiles/PMSBY.svg";
import Account from "./svgFiles/ACCOUNT.svg";
import Joint from "./svgFiles/JOINT.svg";
import Todays from "./svgFiles/TODAY'S TRANSACTION.svg";
import Cheques from "./svgFiles/CHEQUES.svg";
import Snapshot from "./svgFiles/SNAPSHOT.svg";
import HoldCharges from "./svgFiles/HOLD CHARGE.svg";
import Documents from "./svgFiles/DOCUMENT.svg";
import StopPayment from "./svgFiles/STOP PAYMENT.svg";
import Insurance from "./svgFiles/INSURANCE.svg";
import Disbursement from "./svgFiles/DISBURSEMENT DETAIL.svg";
import Subsidy from "./svgFiles/SUBSIDY.svg";
import Search from "./svgFiles/IMPS.svg";
import Limits from "./svgFiles/LIMITS.svg";
import Stock from "./svgFiles/STOCK.svg";

// import * as Icons from "./svgFiles";

const CommonSvgIcons = ({ iconName, width = 35, height = 35 }) => {
  const iconsConfig = {
    SI: Standing,
    LIEN: Lien,
    OUTWARD: OwChqOBCIBC,
    TEMPOD: TempODAgainst,
    ATM: ATMCard,
    IMPS: IMPS,
    ASBA: ASBA,
    ACHIW: ACHIW,
    ACHOW: ACHOW,
    SPINST: SpInstruction,
    GRPAC: GroupAcs,
    APY: APY,
    APBS: APBS,
    PMBY: PMBY,
    ACCOUNT: Account,
    JOINT: Joint,
    TODAYS: Todays,
    CHQ: Cheques,
    SNAPSHOT: Snapshot,
    HOLDCHRG: HoldCharges,
    DOCS: Documents,
    STOP: StopPayment,
    INSU: Insurance,
    DISBDTL: Disbursement,
    SUBSIDY: Subsidy,
    LIMIT: Limits,
    STOCK: Stock,
  };

  // Check if iconName is falsy or not defined, then default to "workInProgressIcons"
  // const SelectedIcon =
  //   iconName && iconsConfig[iconName]
  //     ? iconsConfig[iconName]
  //     : WorkInProgressIcons;

  const src = iconsConfig[iconName] ?? WorkInProgressIcons;

  return (
    <img
      src={src}
      alt={iconName || "no icon"}
      width={width}
      height={height}
      style={{ objectFit: "contain" }}
    />
  );
};

export default CommonSvgIcons;
