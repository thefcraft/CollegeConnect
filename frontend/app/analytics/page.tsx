// src/app/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/nav";
import { MinimalLoading } from "@/components/others";
import { API_URL } from "@/constants";
import { AnalyticsData, AnalyticsSummary, TopListItem, TopCtcItem } from "@/lib/types"; // Adjust path if needed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  FilePlus,
  Edit,
  Database,
  Upload,
  BarChart3, // New icon for Analytics
} from "lucide-react";


// Define navigation items including the new Analytics page
const navItems = [
  { name: 'Search', href: '/', icon: <Search className="mr-2 h-4 w-4" /> },
  { name: 'Add', href: '/add', icon: <FilePlus className="mr-2 h-4 w-4" /> },
  { name: 'Edit/Delete', href: '/edit', icon: <Edit className="mr-2 h-4 w-4" /> },
  { name: 'Analytics', href: '/analytics', icon: <BarChart3 className="mr-2 h-4 w-4" /> }, // Added Analytics
  { name: 'View All', href: '/view', icon: <Database className="mr-2 h-4 w-4" /> },
  { name: 'Mass Upload', href: '/upload', icon: <Upload className="mr-2 h-4 w-4" /> },
];

// Helper to format CTC (example: adds "LPA")
const formatCtc = (ctc: number | null | undefined): string => {
  if (ctc === null || ctc === undefined) return "N/A";
  // You might want more sophisticated formatting (e.g., lakhs, crores)
  return `${ctc.toFixed(2)} LPA`;
};


function AnalyticsDisplay() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const topN = 5; // Assuming we fetch top 5 from the backend

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch top 5 data by default from the backend
        const response = await fetch(`${API_URL}/analytics?n=${topN}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          throw new Error(errorData.message || `Network response was not ok (status: ${response.status})`);
        }
        const data: AnalyticsData = await response.json();

        // Basic validation to ensure expected keys are present
        if (!data.summary || !data[`top_${topN}_companies_by_visits`] || !data[`top_${topN}_colleges_by_visits`] || !data[`top_${topN}_placements_by_ctc`]) {
            console.error("Received incomplete analytics data:", data);
            throw new Error("Incomplete data received from server.");
        }

        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [topN]); // Rerun if topN changes (though it's fixed here)

  if (loading) {
    return <MinimalLoading/>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-10">Error loading analytics: {error}</div>;
  }

  if (!analyticsData) {
    return <div className="text-center py-10">No analytics data available.</div>;
  }

  // Dynamically access the keys based on topN
  const companiesKey = `top_${topN}_companies_by_visits` as keyof AnalyticsData;
  const collegesKey = `top_${topN}_colleges_by_visits` as keyof AnalyticsData;
  const placementsKey = `top_${topN}_placements_by_ctc` as keyof AnalyticsData;

  const topCompanies = (analyticsData[companiesKey] || []) as TopListItem[];
  const topColleges = (analyticsData[collegesKey] || []) as TopListItem[];
  const topPlacements = (analyticsData[placementsKey] || []) as TopCtcItem[];


  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">Placement Analytics</h1>

      {/* Summary Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Colleges</p>
            <p className="text-2xl font-semibold">{analyticsData.summary.total_colleges}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Companies (Unique Profiles)</p>
            <p className="text-2xl font-semibold">{analyticsData.summary.total_companies}</p>
          </div>
           <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Placements</p>
            <p className="text-2xl font-semibold">{analyticsData.summary.total_placements}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Average CTC</p>
            <p className="text-2xl font-semibold">{formatCtc(analyticsData.summary.average_ctc)}</p>
          </div>
           <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Highest CTC</p>
            <p className="text-2xl font-semibold">{formatCtc(analyticsData.summary.max_ctc)}</p>
          </div>
           {/* Optionally show Min CTC */}
           {/* <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Lowest CTC</p>
            <p className="text-2xl font-semibold">{formatCtc(analyticsData.summary.min_ctc)}</p>
          </div> */}
        </CardContent>
      </Card>

      {/* Top N Lists Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Companies by Visits */}
        <Card>
          <CardHeader>
            <CardTitle>Top {topN} Companies</CardTitle>
            <CardDescription>By number of distinct colleges visited</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead className="text-right">Colleges Visited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCompanies.length > 0 ? topCompanies.map((item, index) => (
                  <TableRow key={`${item.name}-${index}`}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Colleges by Visits */}
        <Card>
          <CardHeader>
            <CardTitle>Top {topN} Colleges</CardTitle>
            <CardDescription>By number of distinct companies visiting</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>College Name</TableHead>
                  <TableHead className="text-right">Companies Visited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {topColleges.length > 0 ? topColleges.map((item, index) => (
                  <TableRow key={`${item.name}-${index}`}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                  </TableRow>
                 )) : (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No data</TableCell></TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Placements by CTC */}
        <Card className="md:col-span-2 lg:col-span-1"> {/* Adjust span for layout */}
          <CardHeader>
            <CardTitle>Top {topN} Placements</CardTitle>
            <CardDescription>By Highest CTC Offered</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead className="text-right">CTC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPlacements.length > 0 ? topPlacements.map((item, index) => (
                  <TableRow key={`${item.company_name}-${item.role}-${item.college_name}-${index}`}>
                    <TableCell className="font-medium">{item.company_name}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>{item.college_name}</TableCell>
                    <TableCell className="text-right">{formatCtc(item.ctc)}</TableCell>
                  </TableRow>
                )) : (
                   <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// Main export for the page
export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <DashboardNav navItems={navItems} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnalyticsDisplay />
      </main>
    </div>
  );
}