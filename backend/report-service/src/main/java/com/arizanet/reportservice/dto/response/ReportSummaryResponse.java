package com.arizanet.reportservice.dto.response;

public record ReportSummaryResponse(
        long totalTrackingCount,
        long successCount,
        long failedCount
) {
}