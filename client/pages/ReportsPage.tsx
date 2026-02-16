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
  const { isSidebarCollapsed } = useLayout();
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
        <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
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
        <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
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
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
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

          {/* Month-over-Month Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Current Month */}
            <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Current Month</p>
                    <p className="text-sm font-black text-gray-900">{comparison.currentMonth}</p>
                  </div>
                </div>
                {comparison.isUp ? (
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+{Math.abs(comparison.change).toFixed(1)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-rose-600 text-sm font-bold">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>-{Math.abs(comparison.change).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Revenue</p>
                  <p className="text-2xl font-black text-gray-900">{formatNumber(comparison.current)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Projects</p>
                  <p className="text-xl font-black text-gray-900">{comparison.currentProjects}</p>
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-xl ${comparison.isUp ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-rose-50 border-2 border-rose-200'}`}>
                <p className={`text-xs font-bold ${comparison.isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {comparison.isUp ? '📈 Trending Up' : '📉 Trending Down'}
                </p>
              </div>
            </div>

            {/* Previous Month */}
            <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
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
                  <p className="text-xs font-bold text-gray-500 mb-1">Revenue</p>
                  <p className="text-2xl font-black text-gray-900">{formatNumber(comparison.previous)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Projects</p>
                  <p className="text-xl font-black text-gray-900">{comparison.previousProjects}</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-gray-50 border-2 border-gray-200">
                <p className="text-xs font-bold text-gray-700">
                  📊 Historical Data
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Performance Trend Chart */}
          <div className="glass-panel rounded-2xl p-6 animate-premium mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-black text-gray-900">Monthly Performance Trend</h2>
                <p className="text-xs text-gray-500">Revenue and project count over the last 6 months</p>
              </div>
              {comparison.isUp ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Growing</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-lg border-2 border-rose-200">
                  <TrendingDown className="h-4 w-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-700">Declining</span>
                </div>
              )}
            </div>

            {/* Visual Chart Representation */}
            <div className="mb-6 p-6 bg-white/50 rounded-xl border-2 border-gray-200">
              <div className="relative h-48 flex items-end gap-2">
                {analytics.monthlyTrends.map((month, index) => {
                  const maxRevenue = Math.max(...analytics.monthlyTrends.map(m => m.revenue));
                  const minHeight = 8; // Minimum 8% height for visibility
                  
                  // Calculate height with minimum threshold
                  let heightPercent;
                  if (maxRevenue === 0) {
                    heightPercent = minHeight; // All zero, show minimum
                  } else if (month.revenue === 0) {
                    heightPercent = minHeight; // Zero revenue, show minimum gray bar
                  } else {
                    heightPercent = Math.max(minHeight, (month.revenue / maxRevenue) * 100);
                  }
                  
                  const isLatest = index === analytics.monthlyTrends.length - 1;
                  const hasNoRevenue = month.revenue === 0;
                  
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          hasNoRevenue 
                            ? 'bg-gradient-to-t from-gray-300 to-gray-400' 
                            : isLatest 
                              ? 'bg-gradient-to-t from-brand-500 to-brand-600' 
                              : 'bg-gradient-to-t from-blue-400 to-blue-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                        title={hasNoRevenue ? 'No revenue yet' : `₹${formatNumber(month.revenue)}`}
                      />
                      {hasNoRevenue && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-gray-800 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap">
                            No revenue
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] font-bold text-gray-600 mt-2 text-center">{month.month}</p>
                    </div>
                  );
                })}
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

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Revenue Trend */}
            <div className="glass-panel rounded-2xl p-6 animate-premium">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl shadow-lg ${comparison.isUp ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-rose-500 to-rose-600'}`}>
                  {comparison.isUp ? <TrendingUp className="h-6 w-6 text-white" /> : <TrendingDown className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Revenue Trend</p>
                  <p className="text-sm font-black text-gray-900">Month-over-Month</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${comparison.isUp ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-rose-50 border-2 border-rose-200'}`}>
                  <p className={`text-2xl font-black mb-1 ${comparison.isUp ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {comparison.isUp ? '+' : ''}{comparison.change.toFixed(1)}%
                  </p>
                  <p className={`text-xs font-bold ${comparison.isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {comparison.isUp ? 'Revenue increased from last month' : 'Revenue decreased from last month'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/50 rounded-lg border-2 border-gray-200">
                    <p className="text-xs font-bold text-gray-500 mb-1">This Month</p>
                    <p className="text-lg font-black text-gray-900">{formatNumber(comparison.current)}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg border-2 border-gray-200">
                    <p className="text-xs font-bold text-gray-500 mb-1">Last Month</p>
                    <p className="text-lg font-black text-gray-900">{formatNumber(comparison.previous)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Count Trend */}
            <div className="glass-panel rounded-2xl p-6 animate-premium">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl shadow-lg ${projectsComp.isUp ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`}>
                  <BarChart2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Project Count</p>
                  <p className="text-sm font-black text-gray-900">Activity Trend</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${projectsComp.isUp ? 'bg-blue-50 border-2 border-blue-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
                  <p className={`text-2xl font-black mb-1 ${projectsComp.isUp ? 'text-blue-900' : 'text-orange-900'}`}>
                    {projectsComp.isUp ? '+' : ''}{projectsComp.change.toFixed(1)}%
                  </p>
                  <p className={`text-xs font-bold ${projectsComp.isUp ? 'text-blue-700' : 'text-orange-700'}`}>
                    {projectsComp.isUp ? 'More projects than last month' : 'Fewer projects than last month'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/50 rounded-lg border-2 border-gray-200">
                    <p className="text-xs font-bold text-gray-500 mb-1">This Month</p>
                    <p className="text-lg font-black text-gray-900">{comparison.currentProjects}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg border-2 border-gray-200">
                    <p className="text-xs font-bold text-gray-500 mb-1">Last Month</p>
                    <p className="text-lg font-black text-gray-900">{comparison.previousProjects}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="glass-panel rounded-2xl p-6 animate-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Financial Summary</h2>
                <p className="text-xs text-gray-500">Overall financial performance and profitability</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border-2 border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-700">Total Revenue</p>
                </div>
                <p className="text-3xl font-black text-emerald-900 mb-2">{formatNumber(analytics.financialSummary.completedRevenue)}</p>
                <p className="text-xs text-emerald-600 font-bold">From {analytics.completedProjects} completed projects</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl border-2 border-rose-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-rose-600" />
                  <p className="text-sm font-bold text-rose-700">Total Cost</p>
                </div>
                <p className="text-3xl font-black text-rose-900 mb-2">{formatNumber(analytics.financialSummary.totalCost)}</p>
                <p className="text-xs text-rose-600 font-bold">Operational expenses</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-xl border-2 border-brand-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                  <p className="text-sm font-bold text-brand-700">Net Profit</p>
                </div>
                <p className="text-3xl font-black text-brand-900 mb-2">
                  {formatNumber(analytics.financialSummary.completedRevenue - analytics.financialSummary.totalCost)}
                </p>
                <p className="text-xs text-brand-600 font-bold">
                  {analytics.financialSummary.profitMargin.toFixed(1)}% profit margin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
