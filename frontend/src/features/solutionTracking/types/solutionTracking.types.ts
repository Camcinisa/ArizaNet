export type SolutionStatus = "SUCCESS" | "FAILED" | "IN_PROGRESS";

export type SolutionTracking = {
    id: number;
    userId: number;
    username: string;
    faultSolutionId: number;
    deviceModel: string;
    errorCode: string;
    resultStatus: SolutionStatus;
    note?: string;
    createdAt?: string;
};

export type CreateSolutionTrackingRequest = {
    faultSolutionId: number;
    errorCode: string;
    deviceModel: string;
    resultStatus: SolutionStatus;
    note?: string;
};

export type SolutionStatusOption = {
    label: string;
    value: SolutionStatus;
};