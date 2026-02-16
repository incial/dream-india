import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { useToast } from '../context/ToastContext';
import { analyticsApi } from '../services/api';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Target, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileText,
  BarChart2,
  Calendar
} from 'lucide-react';
import { Analytics } from '../types';

export const ReportsPage: React.FC = () => {
  const { isSidebarCollapsed, showSidebar } = useLayout();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const analyticsData = await analyticsApi.getDashboardAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      showToast('Failed to load analytics data', 'error');
      console.error('Analytics fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return formatCurrency(num);
  };

  // Calculate month-over-month comparison
  const getCurrentMonthComparison = () => {
    if (!analytics || analytics.monthlyTrends.length < 2) {
      return { current: 0, previous: 0, change: 0, isUp: false };
    }

    const trends = analytics.monthlyTrends;
    const current = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    const change = previous.revenue > 0 
      ? ((current.revenue - previous.revenue) / previous.revenue) * 100 
      : 0;
    
    return {
      current: current.revenue,
      previous: previous.revenue,
      currentProjects: current.projectCount,
      previousProjects: previous.projectCount,
      change: change,
      isUp: change >= 0,
      currentMonth: current.month,
      previousMonth: previous.month
    };
  };

  const getProjectsComparison = () => {
    if (!analytics || analytics.monthlyTrends.length < 2) {
      return { change: 0, isUp: false };
    }

    const trends = analytics.monthlyTrends;
    const current = trends[trends.length - 1].projectCount;
    const previous = trends[trends.length - 2].projectCount;
    
    const change = previous > 0 
      ? ((current - previous) / previous) * 100 
      : 0;
    
    return { change, isUp: change >= 0 };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen mesh-bg relative">
        <div className="glass-canvas" />
        <Sidebar />
        <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${!showSidebar ? 'lg:ml-0' : isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
          <div className="text-center">
            <Activity className="h-12 w-12 text-brand-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen mesh-bg relative">
        <div className="glass-canvas" />
        <Sidebar />
        <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${!showSidebar ? 'lg:ml-0' : isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
          <div className="text-center">
            <p className="text-gray-600 font-medium">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const comparison = getCurrentMonthComparison();
  const projectsComp = getProjectsComparison();

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${!showSidebar ? 'lg:ml-0' : isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        
        <div className="px-4 lg:px-12 py-6 lg:py-10 pb-32">
          {/* Header */}
          <div className="mb-8 animate-premium">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 display-text mb-2">
              Performance Reports
            </h1>
            <p className="text-gray-600 text-sm lg:text-base font-medium">
              Detailed analytics, trends, and month-over-month comparisons
            </p>
          </div>

          {/* Month-over-Month Comparison - Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Current Month */}
            <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 pointer-events-none"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg shadow-brand-500/30 animate-pulse">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Month</p>
                      <p className="text-sm font-black text-gray-900 display-text">{comparison.currentMonth}</p>
                    </div>
                  </div>
                  {comparison.isUp ? (
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold tracking-wide">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>+{Math.abs(comparison.change).toFixed(1)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-rose-600 text-sm font-bold tracking-wide">
                      <ArrowDownRight className="h-4 w-4" />
                      <span>-{Math.abs(comparison.change).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Revenue</p>
                    <p className="text-3xl font-black text-gray-900 display-text">{formatNumber(comparison.current)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Projects</p>
                    <p className="text-2xl font-black text-gray-900 display-text">{comparison.currentProjects}</p>
                  </div>
                </div>
                <div className={`mt-4 p-3 rounded-xl backdrop-blur-lg ${comparison.isUp ? 'bg-emerald-50/80 border border-emerald-200' : 'bg-rose-50/80 border border-rose-200'}`}>
                  <p className={`text-xs font-bold tracking-wide ${comparison.isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {comparison.isUp ? '📈 Trending Up' : '📉 Trending Down'}
                  </p>
                </div>
              </div>
            </div>

            {/* Previous Month */}
            <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg shadow-gray-500/30">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Previous Month</p>
                    <p className="text-sm font-black text-gray-900">{comparison.previousMonth}</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase">
                  Comparison Base
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Revenue</p>
                  <p className="text-3xl font-black text-gray-900 display-text">{formatNumber(comparison.previous)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Projects</p>
                  <p className="text-2xl font-black text-gray-900 display-text">{comparison.previousProjects}</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl backdrop-blur-lg bg-gray-50/80 border border-gray-200">
                <p className="text-xs font-bold text-gray-700 tracking-wide">
                  📊 Historical Data
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Performance Trend Chart - Bento Card */}
          <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-black text-gray-900 display-text tracking-tight">Monthly Performance Trend</h2>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Revenue and project count over the last 6 months</p>
              </div>
              {comparison.isUp ? (
                <div className="flex items-center gap-2 px-3 py-2 backdrop-blur-lg bg-emerald-50/80 rounded-lg border border-emerald-200 animate-pulse">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 tracking-wide">Growing</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 backdrop-blur-lg bg-rose-50/80 rounded-lg border border-rose-200">
                  <TrendingDown className="h-4 w-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-700 tracking-wide">Declining</span>
                </div>
              )}
            </div>

            {/* Visual Chart Representation with Axes */}
            <div className="mb-6 p-6 backdrop-blur-xl bg-white/30 border border-white/40 rounded-2xl shadow-xl">
              <div className="flex gap-8">
                {/* Y-Axis Label (Vertical) */}
                <div className="flex items-center justify-center w-10">
                  <div className="transform -rotate-90 whitespace-nowrap text-sm font-bold text-gray-700 tracking-wider">
                    Revenue (₹)
                  </div>
                </div>
                
                {/* Chart Area with proper left margin for Y-axis labels */}
                <div className="flex-1 ml-6">
                  <div className="relative h-64">
                    {/* Y-Axis Scale and Grid Lines */}
                    {(() => {
                      const maxRevenue = Math.max(...analytics.monthlyTrends.map(m => m.revenue));
                      const steps = 5;
                      const scaleValues = Array.from({ length: steps }, (_, i) => (maxRevenue / (steps - 1)) * (steps - 1 - i));
                      
                      return (
                        <>
                          {scaleValues.map((value, index) => {
                            const yPosition = (index / (steps - 1)) * 100;
                            return (
                              <div key={index} className="absolute left-0 right-0" style={{ top: `${yPosition}%` }}>
                                {/* Grid Line */}
                                <div className="absolute left-0 right-0 border-t border-dashed border-gray-300 opacity-60" />
                                {/* Y-Axis Label - moved further left to prevent overlap */}
                                <div className="absolute -left-20 -translate-y-1/2 text-[11px] font-bold text-gray-700 text-right w-16">
                                  {value > 0 ? formatNumber(value) : '₹0'}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                    
                    {/* SVG Line Graph Overlay */}
                    {(() => {
                      const maxRevenue = Math.max(...analytics.monthlyTrends.map(m => m.revenue));
                      
                      // Normalized coordinate calculation - PRD requirement: single shared coordinate system
                      const normalizeValue = (value: number): number => {
                        if (maxRevenue === 0) return 0;  // All zeros → baseline
                        return (value / maxRevenue) * 100;  // Pure proportion, no minimum
                      };
                      
                      // Calculate points for the line
                      const points = analytics.monthlyTrends.map((month, index) => {
                        const heightPercent = normalizeValue(month.revenue);  // Zero revenue = 0% height
                        
                        // Calculate x position (center of each bar)
                        const barWidth = 100 / analytics.monthlyTrends.length;
                        const x = (index * barWidth) + (barWidth / 2);
                        const y = 100 - heightPercent; // Invert Y because SVG origin is top-left
                        
                        return { x, y, revenue: month.revenue };
                      });
                      
                      // Create SVG path
                      const pathData = points.map((point, index) => 
                        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                      ).join(' ');
                      
                      return (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-5 -5 110 110" preserveAspectRatio="none" style={{ zIndex: 10 }}>
                          {/* Line connecting the data points */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke="rgb(99, 102, 241)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Data point circles */}
                          {points.map((point, index) => (
                            <circle
                              key={index}
                              cx={point.x}
                              cy={point.y}
                              r="2.5"
                              fill={index === points.length - 1 ? "rgb(99, 102, 241)" : "rgb(59, 130, 246)"}
                              stroke="white"
                              strokeWidth="0.5"
                              className="opacity-100"
                            />
                          ))}
                        </svg>
                      );
                    })()}
                    
                    {/* Bars */}
                    <div className="relative h-full flex items-end gap-3 pl-2">
                      {analytics.monthlyTrends.map((month, index) => {
                        const maxRevenue = Math.max(...analytics.monthlyTrends.map(m => m.revenue));
                        
                        // PRD requirement: Same normalized calculation as line graph
                        const normalizeValue = (value: number): number => {
                          if (maxRevenue === 0) return 0;
                          return (value / maxRevenue) * 100;
                        };
                        
                        const heightPercent = normalizeValue(month.revenue);  // Zero = 0%, no minimum
                        const isLatest = index === analytics.monthlyTrends.length - 1;
                        const hasNoRevenue = month.revenue === 0;
                        
                        return (
                          <div key={month.month} className="flex-1 flex flex-col items-center group relative">
                            {/* Value Label on Top */}
                            {!hasNoRevenue && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[11px] font-bold text-gray-800 whitespace-nowrap z-20">
                                {formatNumber(month.revenue)}
                              </div>
                            )}
                            
                            {/* Bar - solid color to show alignment with line */}
                            <div 
                              className={`w-full rounded-t-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ${
                                hasNoRevenue 
                                  ? 'bg-gradient-to-t from-gray-200 to-gray-300' 
                                  : isLatest 
                                    ? 'bg-gradient-to-t from-brand-500 to-brand-600' 
                                    : 'bg-gradient-to-t from-blue-400 to-blue-500'
                              }`}
                              style={{ height: `${heightPercent}%` }}
                              title={`₹${formatNumber(month.revenue)} - ${month.projectCount} projects`}
                            />
                            
                            {/* Hover tooltip showing exact data */}
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                              <div className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                                <div className="font-bold">{month.month}</div>
                                <div>Revenue: ₹{formatNumber(month.revenue)}</div>
                                <div>Projects: {month.projectCount}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* X-Axis Labels (Month Names) */}
                  <div className="flex gap-3 mt-4 pl-2">
                    {analytics.monthlyTrends.map((month) => (
                      <div key={month.month} className="flex-1 text-center">
                        <p className="text-xs font-bold text-gray-700">{month.month}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* X-Axis Label */}
                  <div className="text-center mt-2">
                    <p className="text-sm font-bold text-gray-700">Month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {analytics.monthlyTrends.map((month, index) => {
                const isLatest = index === analytics.monthlyTrends.length - 1;
                return (
                  <div 
                    key={month.month} 
                    className={`text-center p-4 rounded-xl border-2 transition-all ${
                      isLatest 
                        ? 'bg-gradient-to-br from-brand-50 to-brand-100/50 border-brand-200 ring-2 ring-brand-500/20' 
                        : 'bg-white/50 border-gray-200'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-600 mb-2">{month.month}</p>
                    <p className="text-lg font-black text-gray-900 mb-1">{formatNumber(month.revenue)}</p>
                    <p className="text-xs text-gray-500">{month.projectCount} projects</p>
                    {isLatest && (
                      <p className="text-[10px] font-bold text-brand-600 mt-1">Current</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Insights - Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Revenue Trend */}
            <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl shadow-lg ${comparison.isUp ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30 animate-pulse' : 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/30'}`}>
                  {comparison.isUp ? <TrendingUp className="h-6 w-6 text-white" /> : <TrendingDown className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue Trend</p>
                  <p className="text-sm font-black text-gray-900 display-text">Month-over-Month</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl backdrop-blur-lg ${comparison.isUp ? 'bg-emerald-50/80 border border-emerald-200' : 'bg-rose-50/80 border border-rose-200'}`}>
                  <p className={`text-3xl font-black mb-1 display-text ${comparison.isUp ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {comparison.isUp ? '+' : ''}{comparison.change.toFixed(1)}%
                  </p>
                  <p className={`text-xs font-bold tracking-wide ${comparison.isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {comparison.isUp ? 'Revenue increased from last month' : 'Revenue decreased from last month'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 backdrop-blur-lg bg-white/50 rounded-lg border border-white/40">
                    <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">This Month</p>
                    <p className="text-lg font-black text-gray-900 display-text">{formatNumber(comparison.current)}</p>
                  </div>
                  <div className="p-3 backdrop-blur-lg bg-white/50 rounded-lg border border-white/40">
                    <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Last Month</p>
                    <p className="text-lg font-black text-gray-900 display-text">{formatNumber(comparison.previous)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Count Trend */}
            <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl shadow-lg ${projectsComp.isUp ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30'}`}>
                  <BarChart2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Project Count</p>
                  <p className="text-sm font-black text-gray-900 display-text">Activity Trend</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl backdrop-blur-lg ${projectsComp.isUp ? 'bg-blue-50/80 border border-blue-200' : 'bg-orange-50/80 border border-orange-200'}`}>
                  <p className={`text-3xl font-black mb-1 display-text ${projectsComp.isUp ? 'text-blue-900' : 'text-orange-900'}`}>
                    {projectsComp.isUp ? '+' : ''}{projectsComp.change.toFixed(1)}%
                  </p>
                  <p className={`text-xs font-bold tracking-wide ${projectsComp.isUp ? 'text-blue-700' : 'text-orange-700'}`}>
                    {projectsComp.isUp ? 'More projects than last month' : 'Fewer projects than last month'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 backdrop-blur-lg bg-white/50 rounded-lg border border-white/40">
                    <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">This Month</p>
                    <p className="text-lg font-black text-gray-900 display-text">{comparison.currentProjects}</p>
                  </div>
                  <div className="p-3 backdrop-blur-lg bg-white/50 rounded-lg border border-white/40">
                    <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Last Month</p>
                    <p className="text-lg font-black text-gray-900 display-text">{comparison.previousProjects}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary - Bento Card */}
          <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 display-text tracking-tight">Financial Summary</h2>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Overall financial performance and profitability</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 backdrop-blur-lg rounded-xl border border-emerald-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg animate-pulse">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700 tracking-wide">Total Revenue</p>
                </div>
                <p className="text-4xl font-black text-emerald-900 mb-2 display-text">{formatNumber(analytics.financialSummary.completedRevenue)}</p>
                <p className="text-xs text-emerald-600 font-bold tracking-wide">From {analytics.completedProjects} completed projects</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-rose-50/80 to-rose-100/50 backdrop-blur-lg rounded-xl border border-rose-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Target className="h-5 w-5 text-rose-600" />
                  </div>
                  <p className="text-sm font-bold text-rose-700 tracking-wide">Total Cost</p>
                </div>
                <p className="text-4xl font-black text-rose-900 mb-2 display-text">{formatNumber(analytics.financialSummary.totalCost)}</p>
                <p className="text-xs text-rose-600 font-bold tracking-wide">Operational expenses</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-brand-50/80 to-brand-100/50 backdrop-blur-lg rounded-xl border border-brand-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-brand-100 rounded-lg animate-pulse">
                      <TrendingUp className="h-5 w-5 text-brand-600" />
                    </div>
                    <p className="text-sm font-bold text-brand-700 tracking-wide">Net Profit</p>
                  </div>
                  <p className="text-4xl font-black text-brand-900 mb-2 display-text">
                    {formatNumber(analytics.financialSummary.completedRevenue - analytics.financialSummary.totalCost)}
                  </p>
                  <p className="text-xs text-brand-600 font-bold tracking-wide">
                    {analytics.financialSummary.profitMargin.toFixed(1)}% profit margin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
