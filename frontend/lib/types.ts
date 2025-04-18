// src/types.ts (or similar shared location)
export interface AnalyticsSummary {
    total_colleges: number;
    total_companies: number;
    total_placements: number;
    average_ctc: number | null;
    min_ctc: number | null;
    max_ctc: number | null;
}

export interface TopListItem {
    name: string;
    count: number;
}

export interface TopCtcItem {
    company_name: string;
    role: string;
    ctc: number;
    college_name: string;
}

// This interface expects the backend to return keys like 'top_5_...'
// Adjust if your backend keys differ or if 'n' becomes dynamic on the frontend
export interface AnalyticsData {
    summary: AnalyticsSummary;
    top_5_companies_by_visits: TopListItem[];
    top_5_colleges_by_visits: TopListItem[];
    top_5_placements_by_ctc: TopCtcItem[];
    // Add more keys if 'n' can vary and you fetch different versions
}