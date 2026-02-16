import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectApi } from '../services/api';
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
import { Project } from '../types';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  pendingRevenue: number;
  totalCost: number;
  profitMargin: number;
  projectsByStage: Record<string, number>;
  monthlyTrend: Array<{ month: string; revenue: number; projects: number }>;
}

export const DashboardPage: React.FC = () => {
  const { isSidebarCollapsed } = useLayout();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    totalCost: 0,
    profitMargin: 0,
    projectsByStage: {},
    monthlyTrend: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await projectApi.getAll();
      setProjects(response);
      calculateStats(response);
    } catch (error) {
      showToast('Failed to load analytics data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (projectList: Project[]) => {
    const completed = projectList.filter(p => p.currentStage === 'COMPLETED');
    const active = projectList.filter(p => p.currentStage !== 'COMPLETED');

    const totalRevenue = completed.reduce((sum, p) => sum + (p.projectValue || 0), 0);
    const pendingRevenue = active.reduce((sum, p) => sum + (p.projectValue || 0), 0);
    const totalReceived = projectList.reduce((sum, p) => sum + (p.amountReceived || 0), 0);
    const totalCost = totalRevenue * 0.6; // Assuming 60% cost ratio
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    // Group by stage
    const projectsByStage: Record<string, number> = {};
    projectList.forEach(p => {
      projectsByStage[p.currentStage] = (projectsByStage[p.currentStage] || 0) + 1;
    });

    // Monthly trend (simplified - last 6 months)
    const monthlyTrend = generateMonthlyTrend(projectList);

    setStats({
      totalProjects: projectList.length,
      activeProjects: active.length,
      completedProjects: completed.length,
      totalRevenue,
      pendingRevenue,
      totalCost,
      profitMargin,
      projectsByStage,
      monthlyTrend
    });
  };

  const generateMonthlyTrend = (projectList: Project[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      revenue: Math.random() * 5000000 + 1000000, // Mock data for now
      projects: Math.floor(Math.random() * 20) + 5
    }));
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
        <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
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
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
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

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Total Revenue */}
            <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-600 mb-1">Total Revenue</h3>
              <p className="text-2xl font-black text-gray-900">{formatNumber(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-2">From {stats.completedProjects} completed projects</p>
            </div>

            {/* Pending Revenue */}
            <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-amber-600 text-sm font-bold">
                  <TrendingUp className="h-4 w-4" />
                  <span>Pipeline</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-600 mb-1">Pending Revenue</h3>
              <p className="text-2xl font-black text-gray-900">{formatNumber(stats.pendingRevenue)}</p>
              <p className="text-xs text-gray-500 mt-2">From {stats.activeProjects} active projects</p>
            </div>

            {/* Total Cost */}
            <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-rose-600 text-sm font-bold">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>-8.2%</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-600 mb-1">Total Cost</h3>
              <p className="text-2xl font-black text-gray-900">{formatNumber(stats.totalCost)}</p>
              <p className="text-xs text-gray-500 mt-2">Operational expenses</p>
            </div>

            {/* Profit Margin */}
            <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-brand-600 text-sm font-bold">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Healthy</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-600 mb-1">Profit Margin</h3>
              <p className="text-2xl font-black text-gray-900">{stats.profitMargin.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-2">Overall profitability</p>
            </div>
          </div>

          {/* Project Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Projects by Stage */}
            <div className="xl:col-span-2 glass-panel rounded-2xl p-6 animate-premium">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-gray-900">Projects by Stage</h2>
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
            <div className="glass-panel rounded-2xl p-6 animate-premium">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-gray-900">Quick Stats</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-brand-600" />
                    <span className="text-sm font-bold text-gray-700">Total Projects</span>
                  </div>
                  <span className="text-lg font-black text-gray-900">{stats.totalProjects}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-bold text-gray-700">Active</span>
                  </div>
                  <span className="text-lg font-black text-gray-900">{stats.activeProjects}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-gray-700">Completed</span>
                  </div>
                  <span className="text-lg font-black text-gray-900">{stats.completedProjects}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-brand-600" />
                    <span className="text-sm font-bold text-gray-700">Success Rate</span>
                  </div>
                  <span className="text-lg font-black text-gray-900">
                    {stats.totalProjects > 0 ? ((stats.completedProjects / stats.totalProjects) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="glass-panel rounded-2xl p-6 animate-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Monthly Performance Trend</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {stats.monthlyTrend.map((month) => (
                <div key={month.month} className="text-center p-4 bg-white/50 rounded-xl border-2 border-gray-200">
                  <p className="text-xs font-bold text-gray-600 mb-2">{month.month}</p>
                  <p className="text-lg font-black text-gray-900 mb-1">{formatNumber(month.revenue)}</p>
                  <p className="text-xs text-gray-500">{month.projects} projects</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 lg:mt-8 glass-panel rounded-2xl p-6 animate-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Financial Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border-2 border-emerald-200">
                <p className="text-sm font-bold text-emerald-700 mb-2">Total Revenue</p>
                <p className="text-3xl font-black text-emerald-900">{formatNumber(stats.totalRevenue)}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl border-2 border-rose-200">
                <p className="text-sm font-bold text-rose-700 mb-2">Total Cost</p>
                <p className="text-3xl font-black text-rose-900">{formatNumber(stats.totalCost)}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-xl border-2 border-brand-200">
                <p className="text-sm font-bold text-brand-700 mb-2">Net Profit</p>
                <p className="text-3xl font-black text-brand-900">{formatNumber(stats.totalRevenue - stats.totalCost)}</p>
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
