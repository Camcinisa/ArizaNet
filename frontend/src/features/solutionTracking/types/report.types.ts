export type ReportSummary = {
    totalTrackingCount: number;
    successCount: number;
    failedCount: number;
};

export type ReportItem = {
    name: string;
    count: number;
};
