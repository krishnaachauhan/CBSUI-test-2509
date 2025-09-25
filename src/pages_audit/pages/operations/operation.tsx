import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import CkycProvider from "./c-kyc/CkycContext";
import { CkycConfirm } from "./c-kyc/confirmation/CkycConfirm";
import AcctMST from "./acct-mst/AcctMST";
import AcctMSTProvider from "./acct-mst/AcctMSTContext";
import { RecurringContextWrapper } from "./recurringPaymentEntry/context/recurringPaymentContext";
import { FDContextWrapper } from "./fix-deposit/context/fdContext";
import TRN001Provider from "./DailyTransaction/TRN001/Trn001Reducer";
import { Accountinquiry } from "pages_audit/acct_Inquiry/acct_inquiry";
import SharedAppEntry from "./sharedAppEntry/SharedAppEntry";
import MainSharedAppEntry from "./sharedAppEntry";
import { CUSTOM_SCREEN_FLAG } from "components/utilFunction/constant";
import ShareAppEntryGrid from "./sharedAppEntry/ShareAppEntryGrid";
import { RtgsBulkBranchHoConfirmationGrid } from "./rtgsEntry/confirmation/RtgsBulkConfirmation";
import { Customer360 } from "pages_audit/acct_Inquiry/customer360/Customer360";
const CashRemittancePayment = lazy(() => import("./CashRemittancePayment"));
const CashRemittanceReceipt = lazy(() => import("./CashRemittanceReceipt"));

const ChequebookTab = lazy(() => import("./chequeBookTab"));

const LimitEntry = lazy(() => import("./limit-entry"));
const StockEntry = lazy(() => import("./stockEntry"));
const StopPaymentEntry = lazy(() => import("./stopPaymentEntry"));
const LienEntry = lazy(() => import("./lienEntry"));
const TemporaryOD = lazy(() => import("./temporaryOD"));
const AtmEntry = lazy(() => import("./atm-entry"));
const ImpsEntry = lazy(() => import("./imps-entry"));
const DisbEntry = lazy(() => import("./disburseEntry"));
const SweepInMaster = lazy(() => import("./sweepInLinkMaster"));
const UnclaPaymentEntry = lazy(() => import("./Uncl-paymentEntry"));
const ATMconfirmation = lazy(() => import("./atm-entry/confirm/confirmation"));
const IMPSconfirmation = lazy(
  () => import("./imps-entry/confirm/confirmation")
);
const Ckyc = lazy(() => import("./c-kyc"));
const AcctConfirm = lazy(() => import("./acct-mst/AcctConfirm"));
const FDDetailGrid = lazy(() => import("./fix-deposit"));
const FDConfirmationGrid = lazy(() => import("./fixDepositConfirmation"));
const CtsOutwardClearingFormWrapper = lazy(() => import("./ctsOutward"));
const CtsOutwardClearingFormWrapperNew = lazy(() => import("./ctsOutwardNew"));

const PendinGTransactionsGridWrapper = lazy(
  () => import("./pendingTransactionMaster/index.")
);
const CtsOutwardClearingConfirmGrid = lazy(
  () => import("./ctsOutwardNew/confirmation")
);
const RtgsBranchHoConfirmationGrid = lazy(
  () => import("./rtgsEntry/confirmation")
);
const InwardClearing = lazy(() => import("./inwardClearing"));
const ClearingDateTransferGridWrapper = lazy(
  () => import("./clearingDateTransfer")
);
const StrAcLevelBranchEntryGridWrapper = lazy(
  () => import("./strAcLevelBranchEntry")
);
const RtgsEntryFormWrapper = lazy(() => import("./rtgsEntry"));
const RtgsBulkEntryWrapper = lazy(() => import("./rtgsBulkEntry"));
const InsuranceEntryForm = lazy(() => import("./insuranceEntry"));
const DailyTransactionImportForm = lazy(
  () => import("./dailyTransactionImport")
);
const BeneficiaryEnrtyForm = lazy(() => import("./beneficiaryEntry"));
const BeneficiAccountConfGrid = lazy(
  () => import("./beneficiaryEntry/confirmation")
);
const TellerScreen = lazy(
  () => import("./denomination/tellerTransaction/cashReceipt/tellerScreen")
);
const ConfirmationGridWrapper = lazy(() => import("../confirmations"));
const SingleDenomination = lazy(
  () => import("./denomination/singleDenomination/index")
);
const Payslipissueconfirmation = lazy(
  () => import("./payslipissueconfirmation/index")
);
const Form15GHEntryGrid = lazy(() => import("./form15G-HEntry"));
const Form15GHConfirmationGrid = lazy(
  () => import("./form15G-HEntry/confirmation")
);
const PositivePayEntryGrid = lazy(() => import("./positivePayEntry"));
const PositivePayConfirmationGrid = lazy(
  () => import("./positivePayEntry/confirmation")
);
const RecurringPaymentEntryGrid = lazy(() => import("./recurringPaymentEntry"));
const RecurringPaymentEntryConfGrid = lazy(
  () => import("./recurringPaymentConfirmation")
);
const PassbookPrint = lazy(() => import("./passbookPrint"));
const LoanScheduleGrid = lazy(() => import("./loanSchedule"));
// const LoanScheduleGrid = lazy(() => import("./loanSchedule"));
const LoanRescheduleConfirmationGrid = lazy(
  () => import("./loanSchedule/loanRescheduleconfirmation")
);
const StandingInstructionGridWrapper = lazy(
  () => import("./standingInstruction")
);
const StandingInstructionConfirmationGridWrapper = lazy(
  () => import("./standingInstruction/confirmation/")
);
const RecurringCalculatorFormWrapper = lazy(
  () => import("./recurringCalculator")
);
const EMICalculatorFormWrapper = lazy(() => import("./emiCalculator"));
const PayslipIsuueEntry = lazy(() => import("./payslip-issue-entry/index"));
const OutwardChequeSearch = lazy(() => import("./cheQueSearch/index"));
const HoldTrnsConfirmationMain = lazy(
  () => import("./holdTransactionConfirmation/index")
);
const DayEndProcess = lazy(() => import("./dayEndProcess/index"));
const FdInterestCalculator = lazy(() => import("./fdInterestCalculator/index"));
const GstOutwardEntryGrid = lazy(
  () => import("./gstOutwardEntry/gstOutwardGrid")
);
const GstOutwardEntryConfirmationGrid = lazy(
  () =>
    import(
      "./gstOutwardEntry/gstOutwardEntryConfirmation/gstOutwardEntryConfirmationGrid"
    )
);
const PlaySlipDraftPrinting = lazy(
  () => import("./payslipDraftPrintingNew/retrieve")
);
const FdPrintDynamicNew = lazy(
  () => import("./fdPrintDynamicNew/fdPrintRetrieve/retrieveFdPrint")
);
const CashierEntry = lazy(
  () => import("./cashierExchangeEntry/cashierExchangeEntry")
);
const AccountCloseProcess = lazy(() => import("./ACCloseProcess"));
const AccountCloseConfirm = lazy(() => import("./ACCCloseConfirm"));
const FdInterestPaymentGrid = lazy(() => import("./FDInterestPayment"));
const FDInterestPaymentConfm = lazy(() => import("./FDInterestPaymentConf"));
const CashierExchangeConfm = lazy(
  () =>
    import(
      "./cashierExchangeEntry/cashierEntryConfirmation/cashierExchangeConfirmation"
    )
);
const CustomerExchangeEntry = lazy(
  () => import("./customerExchangeEntry/customerEntry")
);
const CurrencyExchangeEntry = lazy(
  () => import("./customerExchangeEntry/currencyEntry")
);
const RecInterestPaymentForm = lazy(() => import("./recInterestPayment"));
const RecInterestPaymentConf = lazy(() => import("./recInterestPaymentConf"));
const Trn001 = lazy(() => import("./DailyTransaction/TRN001"));
const Trn002 = lazy(() => import("./DailyTransaction/TRN002"));
const LockerOperationTrnsMain = lazy(() => import("./LockerOperationTrns"));
const CashPaymentEntry = lazy(
  () => import("./denomination/tellerTransaction/cashPayment/cashPayment")
);
const APBSAcctRegistrationGrid = lazy(
  () => import("./APBSAccountRegistration")
);
const APBSRegistrationConfirmationGrid = lazy(
  () => import("./APBSAccountRegistration/confirmation")
);
const CardScaningEntry = lazy(() => import("./AcctCardScaningEntry/index"));
const AcctCardScaningConfirmMain = lazy(
  () => import("./AcctCardScaningEntry/Confirmation/index")
);
const MultipleAcctClose = lazy(() => import("./MulpipleAcctClose"));
const Lockerrententry = lazy(() => import("./lockerRentTrns"));
const LockerAcctOpen = lazy(() => import("./lockerAcctOpen"));
const LockerRenConfirm = lazy(
  () => import("./lockerRentTrns/Confirmation/index")
);
const StatementEmailRegistration = lazy(
  () => import("./statementEmailRegistration/index")
);
const PassbookIssueEntry = lazy(() => import("./passbookIssueEntry/index"));
const AdvanceStockEntry = lazy(() => import("./advanceStockEntry/index"));
const TransBatchCfm = lazy(() => import("./transferBatchConfirmation"));

export const OperationsMenu = () => (
  <Routes>
    <Route path="chequebook-entry/*" element={<ChequebookTab />} />
    <Route
      path="holdtrn-confirmation/*"
      element={<HoldTrnsConfirmationMain />}
    />
    <Route path="owreturn-chqsearch/*" element={<OutwardChequeSearch />} />
    <Route path="limit-entry/*" element={<LimitEntry />} />
    <Route
      path="locker-operation-entry/*"
      element={<LockerOperationTrnsMain />}
    />
    <Route path="stock-entry/*" element={<StockEntry />} />
    <Route path="stop-payment-entry/*" element={<StopPaymentEntry />} />
    <Route path="lien-entry/*" element={<LienEntry />} />
    <Route path="temp-od-entry/*" element={<TemporaryOD />} />
    <Route path="atm-reg-entry/*" element={<AtmEntry />} />
    <Route path="imps-reg-entry/*" element={<ImpsEntry />} />
    <Route path="disburse-entry/*" element={<DisbEntry />} />
    <Route
      path="uncl-payment-entry/*"
      element={
        <UnclaPaymentEntry closeDialog="" screenFlag="entry" result="" />
      }
    />
    <Route path="sweeplink-entry/*" element={<SweepInMaster />} />
    <Route path="atm-reg-confirmation/*" element={<ATMconfirmation />} />
    <Route path="imps-reg-confirmation/*" element={<IMPSconfirmation />} />
    <Route path="dayend-process/*" element={<DayEndProcess />} />

    <Route
      path="chequebook-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="chequebookCFM" />}
    />
    <Route
      path="disburse-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="disburseCFM" />}
    />
    <Route
      path="uncl-payment-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="unclaimedCFM" />}
    />
    <Route
      path="limit-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="limitCFM" />}
    />
    <Route
      path="stock-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="stockCFM" />}
    />
    <Route
      path="stop-pay-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="stopPaymentCFM" />}
    />
    <Route
      path="lien-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="lienCFM" />}
    />
    <Route
      path="tempOd-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="tempOdCFM" />}
    />
    <Route
      path="confirm-cust-signphoto/*"
      element={<ConfirmationGridWrapper screenFlag="photosignatureCFM" />}
    />
    <Route
      path="insurance-confirmation/*"
      element={<ConfirmationGridWrapper screenFlag="insuranceCFM" />}
    />
    <Route
      path="cash-receipt/*"
      element={<TellerScreen screenFlag={"CASHREC"} />}
    />
    <Route
      path="cash-payment/*"
      element={<CashPaymentEntry screenFlag={"SINGLEPAY"} />}
    />
    <Route
      path="single-denomination/*"
      element={<SingleDenomination screenFlag={"SINGLEDENO"} />}
    />
    <Route
      path="confirm-ckyc/*"
      element={
        <CkycProvider>
          <CkycConfirm />
        </CkycProvider>
      }
    />
    <Route
      path="account-mst/*"
      element={
        <AcctMSTProvider>
          <AcctMST />
        </AcctMSTProvider>
      }
    />
    <Route
      path="account-confirm/*"
      element={
        <AcctMSTProvider>
          <AcctConfirm />
        </AcctMSTProvider>
      }
    />
    {/* <Route path="single-deno/*" element={<SingleDeno />} /> */}

    <Route
      path="ckyc/*"
      element={
        <CkycProvider>
          <Ckyc />
        </CkycProvider>
      }
    />
    <Route
      path="cts-outward-clearing/*"
      element={<CtsOutwardClearingFormWrapperNew zoneTranType="S" />}
    />
    <Route
      path="inward-return-entry/*"
      element={<CtsOutwardClearingFormWrapperNew zoneTranType="R" />}
    />
    <Route
      path="cts-outward-confirmation/*"
      element={<CtsOutwardClearingConfirmGrid zoneTranType="S" />}
    />
    <Route
      path="inward-return-confirmation/*"
      element={<CtsOutwardClearingConfirmGrid zoneTranType="R" />}
    />
    <Route
      path="outward-return-confirmation/*"
      element={<CtsOutwardClearingConfirmGrid zoneTranType="W" />}
    />
    <Route path="inward-clearing-process/*" element={<InwardClearing />} />
    <Route
      path="clearing-date-transfer/*"
      element={<ClearingDateTransferGridWrapper />}
    />
    <Route
      path="str-branch-entry/*"
      element={<StrAcLevelBranchEntryGridWrapper />}
    />

    <Route path="rtgs-entry/*" element={<RtgsEntryFormWrapper />} />
    <Route path="bulkrtgs-entry/*" element={<RtgsBulkEntryWrapper />} />
    <Route path="payslip-issue-entry/*" element={<PayslipIsuueEntry />} />
    <Route
      path="payslip-issue-confirmation/*"
      element={<Payslipissueconfirmation />}
    />
    <Route path="fdint-calculator/*" element={<FdInterestCalculator />} />
    <Route
      path="rtgs-branch-confirmation/*"
      element={<RtgsBranchHoConfirmationGrid flag="BO" screenFlag="RTGSBO" />}
    />
    <Route
      path="rtgs-ho-confirmation/*"
      element={<RtgsBranchHoConfirmationGrid flag="HO" screenFlag="RTGSHO" />}
    />
    <Route
      path="bulkrtgs-branch-confirmation/*"
      element={
        <RtgsBulkBranchHoConfirmationGrid flag="BO" screenFlag="RTGSBULKBO" />
      }
    />
    <Route
      path="bulkrtgs-ho-confirmation/*"
      element={
        <RtgsBulkBranchHoConfirmationGrid flag="HO" screenFlag="RTGSBULKHO" />
      }
    />
    <Route path="insurance-entry/*" element={<InsuranceEntryForm />} />
    <Route
      path="daily-transaction-import/*"
      element={<DailyTransactionImportForm />}
    />
    <Route path="beneficiary-entry/*" element={<BeneficiaryEnrtyForm />} />
    <Route
      path="beneficiary-confirmation/*"
      element={<BeneficiAccountConfGrid />}
    />

    <Route
      path="fix-deposit-entry/*"
      element={
        <FDContextWrapper>
          <FDDetailGrid />
        </FDContextWrapper>
      }
    />
    <Route path="fix-deposit-confirmation/*" element={<FDConfirmationGrid />} />
    <Route
      path="form-15g-h-entry/*"
      element={<Form15GHEntryGrid screenFlag="E" />}
    />
    <Route
      path="form-15g-h-confirmation/*"
      element={<Form15GHConfirmationGrid screenFlag="C" />}
    />
    <Route path="positivepay-entry/*" element={<PositivePayEntryGrid />} />
    <Route
      path="positivepay-confirmation/*"
      element={<PositivePayConfirmationGrid screenFlag="C" />}
    />
    <Route
      path="recurring-payment-entry/*"
      element={
        <RecurringContextWrapper>
          <RecurringPaymentEntryGrid />
        </RecurringContextWrapper>
      }
    />
    <Route
      path="recurring-payment-confirmation/*"
      element={
        <RecurringContextWrapper>
          <RecurringPaymentEntryConfGrid />
        </RecurringContextWrapper>
      }
    />
    <Route path="passbook-printing/*" element={<PassbookPrint />} />
    <Route path="loanschedule/*" element={<LoanScheduleGrid />} />
    <Route path="apbs-reg-entry/*" element={<APBSAcctRegistrationGrid />} />
    <Route
      path="apbs-reg-confirmation/*"
      element={<APBSRegistrationConfirmationGrid />}
    />
    <Route
      path="loanschedule-confirmation/*"
      element={<LoanRescheduleConfirmationGrid />}
    />
    <Route
      path="gst-outward-entry/*"
      element={<GstOutwardEntryGrid screenFlag="gstEntry" />}
    />
    <Route
      path="gst-outward-confirmation/*"
      element={
        <GstOutwardEntryConfirmationGrid screenFlag="gstEntryConfirmation" />
      }
    />
    <Route path="dd-printing/*" element={<PlaySlipDraftPrinting />} />
    <Route path="fd-printing/*" element={<FdPrintDynamicNew />} />
    <Route path="cashier-exchange-entry/*" element={<CashierEntry />} />
    <Route path="account-close-process/*" element={<AccountCloseProcess />} />
    <Route
      path="account-close-confirmation/*"
      element={<AccountCloseConfirm />}
    />
    <Route path="fdpayint-master-entry/*" element={<FdInterestPaymentGrid />} />
    <Route
      path="fdpayint-master-confirmation/*"
      element={<FDInterestPaymentConfm />}
    />

    <Route
      path="standing-instruction-entry/*"
      element={<StandingInstructionGridWrapper />}
    />
    <Route
      path="standing-instruction-confirmation/*"
      element={<StandingInstructionConfirmationGridWrapper />}
    />
    <Route
      path="recint-calculator/*"
      element={<RecurringCalculatorFormWrapper />}
    />
    <Route path="emi-calculator/*" element={<EMICalculatorFormWrapper />} />
    <Route
      path="cashier-exchange-confirmation/*"
      element={<CashierExchangeConfm />}
    />
    <Route
      path="cash-exchange-customer/*"
      element={<CustomerExchangeEntry />}
    />
    <Route
      path="cash-exchange-currency/*"
      element={<CurrencyExchangeEntry />}
    />
    <Route
      path="recpayint-master-entry/*"
      element={<RecInterestPaymentForm />}
    />
    <Route
      path="recpayint-master-confirmation/*"
      element={<RecInterestPaymentConf />}
    />
    <Route
      path="daily_tran_F1/*"
      element={
        <TRN001Provider>
          <Trn001 screenFlag="DAILY_TRN" />
        </TRN001Provider>
      }
    />
    <Route
      path="cnf_daily_tran_F2/*"
      element={
        <TRN001Provider>
          <Trn002 />
        </TRN001Provider>
      }
    />
    <Route path="cnf_trans_batch/*" element={<TransBatchCfm />} />
    <Route
      path="npa-recovery-confirmation/*"
      element={
        <TRN001Provider>
          <Trn002 screenFlag="NPA_Entry_CONF" />
        </TRN001Provider>
      }
    />
    <Route
      path="contra_entry/*"
      element={
        <TRN001Provider>
          <Trn001 screenFlag="contraEntry" />
        </TRN001Provider>
      }
    />
    <Route
      path="npa-recovery-entry/*"
      element={
        <TRN001Provider>
          <Trn001 screenFlag="NPA_Entry" />
        </TRN001Provider>
      }
    />
    <Route
      path="trn_batch_entry/*"
      element={
        <TRN001Provider>
          <Trn001 screenFlag="TRNF_BATCH" />
        </TRN001Provider>
      }
    />
    <Route path="acct-scanning-entry/*" element={<CardScaningEntry />} />
    <Route
      path="Pending-Transactions/*"
      element={<PendinGTransactionsGridWrapper />}
    />
    <Route
      path="acct-scanning-confirmation/*"
      element={<AcctCardScaningConfirmMain />}
    />
    <Route path="multipleacclose-process/*" element={<MultipleAcctClose />} />
    <Route path="locker-rent-entry/*" element={<Lockerrententry />} />
    <Route path="locker-account-open/*" element={<LockerAcctOpen />} />
    <Route path="locker-rent-confirmation/*" element={<LockerRenConfirm />} />
    <Route
      path="cashremi-payment-entry/*"
      element={<CashRemittancePayment />}
    />
    <Route
      path="cashremi-payment-confirmation/*"
      element={<CashRemittancePayment />}
    />
    <Route
      path="cashremi-receipt-entry/*"
      element={<CashRemittanceReceipt />}
    />
    <Route
      path="cashremi-receipt-confirmation/*"
      element={<CashRemittanceReceipt />}
    />
    <Route path="email-reg-entry/*" element={<StatementEmailRegistration />} />
    <Route path="passbook-issue-entry/*" element={<PassbookIssueEntry />} />
    <Route
      path="cust360-view/*"
      element={<Customer360 open={false} from={"MENU"} />}
    />
    <Route path="shareapp-entry/new-entry/*" element={<MainSharedAppEntry />} />
    <Route path="shareapp-entry/*" element={<ShareAppEntryGrid />} />
    <Route
      path="shareapp-confirmation/*"
      element={
        <ConfirmationGridWrapper
          screenFlag={CUSTOM_SCREEN_FLAG.SHARE_APP_ENTRY}
        />
      }
    />
    <Route
      path="shareapp-confirmation/view-details/*"
      element={<MainSharedAppEntry />}
    />
    <Route
      path="shareapp-entry/view-details/*"
      element={<MainSharedAppEntry />}
    />
    <Route path="advstock-entry/*" element={<AdvanceStockEntry />} />
  </Routes>
);
