import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { analyticsApi } from '../services/api';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Briefcase, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Analytics, StageDistribution, MonthlyTrend } from '../types';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  pendingRevenue: number;
  projectsByStage: Record<string, number>;
  monthlyTrend: Array<{ month: string; revenue: number; projects: number }>;
}

export const DashboardPage: React.FC = () => {
  const { isSidebarCollapsed, showSidebar } = useLayout();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    projectsByStage: {},
    monthlyTrend: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const analyticsData = await analyticsApi.getDashboardAnalytics();
      setAnalytics(analyticsData);
      
      // Convert analytics data to stats format for UI
      const projectsByStage: Record<string, number> = {};
      analyticsData.stageDistribution.forEach(stage => {
        projectsByStage[stage.stage] = stage.count;
      });

      const monthlyTrend = analyticsData.monthlyTrends.map(trend => ({
        month: trend.month,
        revenue: trend.revenue,
        projects: trend.projectCount
      }));

      setStats({
        totalProjects: analyticsData.totalProjects,
        activeProjects: analyticsData.activeProjects,
        completedProjects: analyticsData.completedProjects,
        totalRevenue: analyticsData.financialSummary.totalRevenue,
        pendingRevenue: analyticsData.financialSummary.pendingRevenue,
        projectsByStage,
        monthlyTrend
      });
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen mesh-bg relative">
        <div className="glass-canvas" />
        <Sidebar />
        <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${!showSidebar ? 'lg:ml-0' : isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
          <div className="text-center">
            <Activity className="h-12 w-12 text-brand-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

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
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-sm lg:text-base font-medium">
              Comprehensive business intelligence and performance metrics
            </p>
          </div>

          {/* Key Metrics - Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Revenue */}
            <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 animate-pulse">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold tracking-wide">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-600 mb-1 tracking-wider uppercase">Total Revenue</h3>
              <p className="text-3xl font-black text-gray-900 display-text">{formatNumber(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-2 font-medium">From {stats.completedProjects} completed projects</p>
            </div>

            {/* Pending Revenue */}
            <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/30">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-amber-600 text-sm font-bold tracking-wide">
                  <TrendingUp className="h-4 w-4" />
                  <span>Pipeline</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-600 mb-1 tracking-wider uppercase">Pending Revenue</h3>
              <p className="text-3xl font-black text-gray-900 display-text">{formatNumber(stats.pendingRevenue)}</p>
              <p className="text-xs text-gray-500 mt-2 font-medium">From {stats.activeProjects} active projects</p>
            </div>

            {/* Total Projects */}
            <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-blue-600 text-sm font-bold tracking-wide">
                  <Activity className="h-4 w-4" />
                  <span>Active</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-600 mb-1 tracking-wider uppercase">Total Projects</h3>
              <p className="text-3xl font-black text-gray-900 display-text">{stats.totalProjects}</p>
              <p className="text-xs text-gray-500 mt-2 font-medium">{stats.completedProjects} completed, {stats.activeProjects} in progress</p>
            </div>
          </div>

          {/* Project Overview - Bento Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Projects by Stage */}
            <div className="xl:col-span-2 bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg shadow-lg shadow-brand-500/30">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-gray-900 display-text tracking-tight">Projects by Stage</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(stats.projectsByStage).map(([stage, count]) => {
                  const total = stats.totalProjects;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const stageColor = getStageColor(stage);
                  
                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">{stage.replace('_', ' ')}</span>
                        <span className="text-sm font-black text-gray-900">{count} projects</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stageColor} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bento-card backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 animate-premium">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg shadow-purple-500/30">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-gray-900 display-text tracking-tight">Quick Stats</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/50 rounded-xl border border-white/40 hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-brand-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 tracking-wide">Total Projects</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 display-text">{stats.totalProjects}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/50 rounded-xl border border-white/40 hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg animate-pulse">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 tracking-wide">Active</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 display-text">{stats.activeProjects}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/50 rounded-xl border border-white/40 hover:bg-white/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 tracking-wide">Completed</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 display-text">{stats.completedProjects}</span>
                </div>

                <div className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/50 rounded-xl border border-white/40 hover:bg-white/60 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-purple-500/5"></div>
                  <div className="flex items-center gap-3 relative">
                    <div className="p-2 bg-brand-100 rounded-lg animate-pulse">
                      <TrendingUp className="h-5 w-5 text-brand-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 tracking-wide">Success Rate</span>
                  </div>
                  <span className="text-lg font-black text-gray-900 display-text relative">
                    {stats.totalProjects > 0 ? ((stats.completedProjects / stats.totalProjects) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    'LEAD': 'bg-gray-400',
    'ON_PROGRESS': 'bg-blue-500',
    'QUOTATION_SENT': 'bg-cyan-500',
    'IN_REVIEW': 'bg-yellow-500',
    'ONBOARDED': 'bg-purple-500',
    'SALES': 'bg-indigo-500',
    'ACCOUNTS': 'bg-orange-500',
    'INSTALLATION': 'bg-rose-500',
    'COMPLETED': 'bg-emerald-500',
  };
  return colors[stage] || 'bg-gray-400';
}
