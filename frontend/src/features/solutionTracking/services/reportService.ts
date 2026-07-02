import { apiClient } from "../../../lib/axios";
import type { ReportItem, ReportSummary } from "../types/report.types";

export async function getReportSummary(): Promise<ReportSummary> {
    const response = await apiClient.get<ReportSummary>("/api/reports/summary");

    return response.data;
}

export async function getMostUsedErrorCodes(): Promise<ReportItem[]> {
    const response = await apiClient.get<ReportItem[]>("/api/reports/most-used-error-codes");

    return response.data;
}

export async function getMostUsedDeviceModels(): Promise<ReportItem[]> {
    const response = await apiClient.get<ReportItem[]>("/api/reports/most-used-device-models");

    return response.data;
}

export async function getUserActivity(): Promise<ReportItem[]> {
    const response = await apiClient.get<ReportItem[]>("/api/reports/user-activity");

    return response.data;
}
