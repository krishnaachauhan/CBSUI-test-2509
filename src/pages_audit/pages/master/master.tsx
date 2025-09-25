import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

const EntryDescription = lazy(() => import("./entrydescriptionmaster/"));
const InsuranceType = lazy(() => import("./insurancetypemaster/"));
const NpaCategory = lazy(() => import("./npaCateMast/"));
const CourtMaster = lazy(() => import("./courtmaster"));
const ClearingBankMst = lazy(() => import("./clearingBankMaster"));
const LienReasonMst = lazy(() => import("./lienReasonMaster"));
const AdvocateMstGrid = lazy(() => import("./advocateMaster"));
const LienMasterGrid = lazy(() => import("./lienMaster/lienMasterGrid"));
const AcPeriodMasterGrid = lazy(
  () => import("./ACperiodMaster/ACperiodMasterGrid")
);
const ModeMasterGrid = lazy(() => import("./modeMaster/modeMasterGrid"));
const BankIfscCodeMaster = lazy(
  () => import("./bankIfscCodeMaster/bankIfscCodeMaasterGrid")
);
const CategoryMasterGrid = lazy(() => import("./categoryMaster"));
const OrnamentTypeMasterGrid = lazy(() => import("./ornamentTypeMaster"));
const ActionTakenMasterGrid = lazy(() => import("./actionTakenMaster"));
const AgentMasterGrid = lazy(() => import("./agentMaster"));
const Prioritymain = lazy(
  () => import("./priorityMasterMain/priorityMasterMainGrid")
);
const Prioritymastersub = lazy(
  () => import("./priorityMasterSub/priorityMasterSubGrid")
);
const TradeMaster = lazy(() => import("./tradeMaster/tradeMasterGrid"));
const AreaMaster = lazy(() => import("./areaMaster/areaMasterGrid"));
const AuditorMstGrid = lazy(() => import("./auditorMaster"));
const UserSecurityWrapper = lazy(() => import("./usersecurity/securityUser"));
const SecurityConfirm = lazy(
  () => import("./userSecurityConfirmation/UserSecurityConfirmationGrid")
);
const EquitableMortgage = lazy(() => import("./equitableMortgageMain/index"));
const PmbyRegMst = lazy(() => import("./pmbyRegMst/pmbyRegMst"));
const PmbyRegConfirm = lazy(() => import("./pmbyRegMst/confirmation/index"));
const DynamicReportConfig = lazy(() => import("./dynamicReportConfig"));

const Master = () => {
  return (
    <>
      <Routes>
        <Route
          path="entry-description-master/*"
          element={<EntryDescription />}
        />
        <Route path="category-master/*" element={<CategoryMasterGrid />} />
        <Route
          path="ornament-type-master/*"
          element={<OrnamentTypeMasterGrid />}
        />
        <Route
          path="action-taken-master/*"
          element={<ActionTakenMasterGrid />}
        />
        <Route path="lien-master/*" element={<LienMasterGrid />} />
        <Route
          path="account-period-master/*"
          element={<AcPeriodMasterGrid />}
        />
        <Route path="mode-master/*" element={<ModeMasterGrid />} />
        <Route
          path="bank-Ifsc-Code-Master/*"
          element={<BankIfscCodeMaster />}
        />
        <Route path="insurance-type-master/*" element={<InsuranceType />} />
        <Route path="npa-category-master/*" element={<NpaCategory />} />
        <Route path="court-master/*" element={<CourtMaster />} />
        <Route path="clearing-bank-master/*" element={<ClearingBankMst />} />
        <Route path="lien-reason-master/*" element={<LienReasonMst />} />
        <Route path="advocate-master/*" element={<AdvocateMstGrid />} />
        <Route path="agent-master/*" element={<AgentMasterGrid />} />
        <Route path="priority-master-main/*" element={<Prioritymain />} />
        <Route path="priority-master-sub/*" element={<Prioritymastersub />} />
        <Route path="trade-master/*" element={<TradeMaster />} />
        <Route path="area-master/*" element={<AreaMaster />} />
        <Route path="auditor-master/*" element={<AuditorMstGrid />} />
        <Route path="security-user/*" element={<UserSecurityWrapper />} />
        <Route
          path="security-user-confirmation/*"
          element={<SecurityConfirm />}
        />
        <Route
          path="equitable-mortgage-master/*"
          element={<EquitableMortgage />}
        />
        <Route
          path="/pmby-reg-entry/*"
          element={<PmbyRegMst screenType={"E"} />}
        />
        <Route path="/pmby-reg-confirmation/*" element={<PmbyRegConfirm />} />
        <Route
          path="lowcode-report-configuration/*"
          element={<DynamicReportConfig />}
        />
      </Routes>
    </>
  );
};
export default Master;
