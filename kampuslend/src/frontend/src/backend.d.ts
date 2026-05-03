import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Time = bigint;
export interface User {
    id: bigint;
    gpa: number;
    ktm: string;
    principal: Principal;
    bankAccount: string;
    name: string;
    role: string;
    email: string;
    isVerified: boolean;
}
export interface Loan {
    id: bigint;
    major: string;
    status: string;
    tenor: bigint;
    borrowerId: bigint;
    investorId: bigint;
    interestRate: number;
    monthlyInstallment: number;
    aiScore: bigint;
    amount: bigint;
    purpose: string;
    borrowerName: string;
    startDate: Time;
}
export interface Payment {
    id: bigint;
    status: string;
    loanId: bigint;
    virtualAccount: string;
    remainingInstallment: number;
    paymentDate: Time;
    amount: bigint;
}
export interface ScoringResult {
    score: bigint;
    recommendation: string;
    reason: string;
}
export interface ScoringInput {
    gpa: number;
    tenor: bigint;
    cleanHistory: boolean;
    amount: bigint;
    purpose: string;
}
export interface UserProfile {
    gpa: number;
    ktm: string;
    bankAccount: string;
    name: string;
    role: string;
    email: string;
    isVerified: boolean;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSeedData(): Promise<void>;
    approveLoan(loanId: bigint, investorId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createLoan(borrowerId: bigint, borrowerName: string, major: string, amount: bigint, tenor: bigint, monthlyInstallment: number, purpose: string): Promise<bigint>;
    createVirtualAccount(loanId: bigint): Promise<string>;
    getAllLoans(): Promise<Array<Loan>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCicilanSisa(loanId: bigint): Promise<number>;
    getCurrentUser(): Promise<User | null>;
    getLoan(id: bigint): Promise<Loan>;
    getLoansByBorrower(borrowerId: bigint): Promise<Array<Loan>>;
    getLoansByInvestor(investorId: bigint): Promise<Array<Loan>>;
    getPaymentsByLoan(loanId: bigint): Promise<Array<Payment>>;
    getUser(id: bigint): Promise<User | null>;
    getUserById(id: bigint): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsersByRole(role: string): Promise<Array<User>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    recordPayment(loanId: bigint, amount: bigint, remainingInstallment: number, status: string, virtualAccount: string): Promise<bigint>;
    registerUser(name: string, email: string, role: string, ktm: string, bankAccount: string, gpa: number): Promise<bigint>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scoreApplicant(input: ScoringInput): Promise<ScoringResult>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateLoanStatus(loanId: bigint, status: string): Promise<void>;
    verifyUser(userId: bigint): Promise<void>;
    verifyEmail(userId: bigint, otp: string): Promise<boolean>;
}
