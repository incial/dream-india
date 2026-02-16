import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { Project } from '../types';
import { projectApi } from '../services/api';
import { Search, CheckCircle, Building2, MapPin, Calendar, DollarSign, Clock, Filter, ChevronDown } from 'lucide-react';

export const WorkCompletedPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isSidebarCollapsed, showSidebar } = useLayout();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        district: '',
        region: '',
        parentCompany: ''
    });
    const [sortBy, setSortBy] = useState<'date' | 'school' | 'value'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectApi.getCompletedProjects();
            setProjects(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to load completed projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedProjects = React.useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        let filtered = projects.filter(p => {
            const matchesSearch = 
                p.school.toLowerCase().includes(lowerSearchTerm) ||
                p.contactPerson?.toLowerCase().includes(lowerSearchTerm) ||
                p.contactNumber?.includes(searchTerm);
            
            const matchesDistrict = !filters.district || p.district === filters.district;
            const matchesRegion = !filters.region || p.region === filters.region;
            const matchesCompany = !filters.parentCompany || p.parentCompany === filters.parentCompany;
            
            return matchesSearch && matchesDistrict && matchesRegion && matchesCompany;
        });

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            
            if (sortBy === 'date') {
                const dateA = new Date(a.completionDate || a.createdDate).getTime();
                const dateB = new Date(b.completionDate || b.createdDate).getTime();
                comparison = dateA - dateB;
            } else if (sortBy === 'school') {
                comparison = a.school.localeCompare(b.school);
            } else if (sortBy === 'value') {
                comparison = (a.projectValue || 0) - (b.projectValue || 0);
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [projects, searchTerm, filters, sortBy, sortOrder]);

    const formatCurrency = (amount?: number) => {
        if (!amount) return '₹0';
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const uniqueDistricts = React.useMemo(() => 
        Array.from(new Set(projects.map(p => p.district).filter(Boolean))), 
        [projects]
    );

    const uniqueRegions = React.useMemo(() => 
        Array.from(new Set(projects.map(p => p.region).filter(Boolean))), 
        [projects]
    );

    const uniqueCompanies = React.useMemo(() => 
        Array.from(new Set(projects.map(p => p.parentCompany).filter(Boolean))), 
        [projects]
    );

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
                            Completed Projects Archive
                        </h1>
                        <p className="text-gray-600 text-sm lg:text-base font-medium">
                            View and analyze all completed projects
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="glass-panel rounded-2xl p-6 animate-premium">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-600">Total Projects</span>
                                <CheckCircle className="text-green-500" size={20} />
                            </div>
                            <div className="text-3xl font-black text-gray-900">{projects.length}</div>
                        </div>
                        <div className="glass-panel rounded-2xl p-6 animate-premium">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-600">Total Value</span>
                                <DollarSign className="text-blue-500" size={20} />
                            </div>
                            <div className="text-3xl font-black text-gray-900">
                                {formatCurrency(projects.reduce((sum, p) => sum + (p.projectValue || 0), 0))}
                            </div>
                        </div>
                        <div className="glass-panel rounded-2xl p-6 animate-premium">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-600">This Month</span>
                                <Calendar className="text-purple-500" size={20} />
                            </div>
                            <div className="text-3xl font-black text-gray-900">
                                {projects.filter(p => {
                                    const completionDate = new Date(p.completionDate || p.createdDate);
                                    const now = new Date();
                                    return completionDate.getMonth() === now.getMonth() && 
                                           completionDate.getFullYear() === now.getFullYear();
                                }).length}
                            </div>
                        </div>
                        <div className="glass-panel rounded-2xl p-6 animate-premium">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-600">Avg. Time</span>
                                <Clock className="text-orange-500" size={20} />
                            </div>
                            <div className="text-3xl font-black text-gray-900">
                                {Math.round(projects.length > 0 ? 
                                    projects.reduce((sum, p) => {
                                        const start = new Date(p.createdDate).getTime();
                                        const end = new Date(p.completionDate || p.createdDate).getTime();
                                        return sum + (end - start) / (1000 * 60 * 60 * 24);
                                    }, 0) / projects.length : 0
                                )} days
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="glass-panel rounded-2xl p-4 mb-6 animate-premium shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search by school, contact person, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/50 border-0 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-400"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                                    showFilters 
                                        ? 'bg-brand-500 text-white' 
                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-brand-500'
                                }`}
                            >
                                <Filter size={18} />
                                Filters
                                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-sm"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="school">Sort by School</option>
                                <option value="value">Sort by Value</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-brand-500 font-semibold text-sm transition-all"
                            >
                                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                            </button>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                                    <select
                                        value={filters.district}
                                        onChange={(e) => setFilters({...filters, district: e.target.value})}
                                        className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-sm"
                                    >
                                        <option value="">All Districts</option>
                                        {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Region</label>
                                    <select
                                        value={filters.region}
                                        onChange={(e) => setFilters({...filters, region: e.target.value})}
                                        className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-sm"
                                    >
                                        <option value="">All Regions</option>
                                        {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Parent Company</label>
                                    <select
                                        value={filters.parentCompany}
                                        onChange={(e) => setFilters({...filters, parentCompany: e.target.value})}
                                        className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-sm"
                                    >
                                        <option value="">All Companies</option>
                                        {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                        </div>
                    ) : filteredAndSortedProjects.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-12 text-center animate-premium">
                            <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 font-medium">No completed projects found</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 lg:gap-6">
                            {filteredAndSortedProjects.map((project) => (
                                <div key={project.id} className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        {/* Left Section - Project Info */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{project.school}</h3>
                                                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                                        {project.contactPerson && (
                                                            <span className="flex items-center gap-1">
                                                                <Building2 size={14} />
                                                                {project.contactPerson}
                                                            </span>
                                                        )}
                                                        {project.place && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={14} />
                                                                {project.place}, {project.district}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200">
                                                    <CheckCircle size={14} />
                                                    COMPLETED
                                                </span>
                                            </div>

                                            {/* Financial Summary */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-200/50">
                                                <div className="bg-blue-50/50 rounded-lg p-3">
                                                    <div className="text-xs text-blue-600 mb-1">Project Value</div>
                                                    <div className="text-sm font-bold text-blue-900">
                                                        {formatCurrency(project.projectValue)}
                                                    </div>
                                                </div>
                                                <div className="bg-green-50/50 rounded-lg p-3">
                                                    <div className="text-xs text-green-600 mb-1">Amount Received</div>
                                                    <div className="text-sm font-bold text-green-900">
                                                        {formatCurrency(project.amountReceived)}
                                                    </div>
                                                </div>
                                                <div className="bg-purple-50/50 rounded-lg p-3">
                                                    <div className="text-xs text-purple-600 mb-1">Started</div>
                                                    <div className="text-sm font-bold text-purple-900">
                                                        {new Date(project.createdDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="bg-orange-50/50 rounded-lg p-3">
                                                    <div className="text-xs text-orange-600 mb-1">Completed</div>
                                                    <div className="text-sm font-bold text-orange-900">
                                                        {project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>

                                            {project.installationRemarks && (
                                                <div className="text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3">
                                                    <span className="font-semibold">Final Remarks:</span> {project.installationRemarks}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Section - Actions */}
                                        <div className="flex flex-col gap-2 lg:items-end">
                                            <button
                                                onClick={() => setSelectedProject(project)}
                                                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-brand-500 hover:text-brand-600 transition-all font-semibold text-sm shadow-sm"
                                            >
                                                View Full History
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Project History Modal */}
            {selectedProject && (
                <ProjectHistoryModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </div>
    );
};

// Project History Modal Component
const ProjectHistoryModal: React.FC<{
    project: Project;
    onClose: () => void;
}> = ({ project, onClose }) => {
    const formatCurrency = (amount?: number) => {
        if (!amount) return '₹0';
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{project.school}</h2>
                        <p className="text-sm text-gray-600 mt-1">Complete Project History</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
                </div>

                <div className="space-y-6">
                    {/* Project Details */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Project Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-semibold">Contact Person:</span> {project.contactPerson || 'N/A'}</div>
                            <div><span className="font-semibold">Contact Number:</span> {project.contactNumber || 'N/A'}</div>
                            <div><span className="font-semibold">Location:</span> {project.place}, {project.district}</div>
                            <div><span className="font-semibold">Region:</span> {project.region || 'N/A'}</div>
                            <div><span className="font-semibold">Parent Company:</span> {project.parentCompany || 'N/A'}</div>
                            <div><span className="font-semibold">Created By:</span> {project.createdBy}</div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Summary</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm text-blue-600 mb-1">Project Value</div>
                                <div className="text-xl font-bold text-blue-900">{formatCurrency(project.projectValue)}</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-sm text-green-600 mb-1">Amount Received</div>
                                <div className="text-xl font-bold text-green-900">{formatCurrency(project.amountReceived)}</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4">
                                <div className="text-sm text-red-600 mb-1">Pending Amount</div>
                                <div className="text-xl font-bold text-red-900">{formatCurrency(project.pendingAmount)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Project Timeline</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-24 font-semibold text-gray-600">Created:</div>
                                <div className="text-gray-900">{new Date(project.createdDate).toLocaleString()}</div>
                            </div>
                            {project.stageChangeTimestamp && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-24 font-semibold text-gray-600">Last Stage:</div>
                                    <div className="text-gray-900">{new Date(project.stageChangeTimestamp).toLocaleString()}</div>
                                </div>
                            )}
                            {project.completionDate && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-24 font-semibold text-gray-600">Completed:</div>
                                    <div className="text-gray-900">{new Date(project.completionDate).toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Remarks & Notes */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Remarks & Notes</h3>
                        <div className="space-y-3">
                            {project.executiveRemarks && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm font-semibold text-gray-700 mb-1">Executive Remarks:</div>
                                    <div className="text-sm text-gray-600">{project.executiveRemarks}</div>
                                </div>
                            )}
                            {project.salesRemarks && (
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="text-sm font-semibold text-blue-700 mb-1">Sales Remarks:</div>
                                    <div className="text-sm text-blue-600">{project.salesRemarks}</div>
                                </div>
                            )}
                            {project.paymentRemarks && (
                                <div className="bg-green-50 rounded-lg p-3">
                                    <div className="text-sm font-semibold text-green-700 mb-1">Payment Remarks:</div>
                                    <div className="text-sm text-green-600">{project.paymentRemarks}</div>
                                </div>
                            )}
                            {project.installationRemarks && (
                                <div className="bg-purple-50 rounded-lg p-3">
                                    <div className="text-sm font-semibold text-purple-700 mb-1">Installation Remarks:</div>
                                    <div className="text-sm text-purple-600">{project.installationRemarks}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
