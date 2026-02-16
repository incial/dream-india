import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { Project, UpdateSalesDataRequest } from '../types';
import { projectApi } from '../services/api';
import { Search, DollarSign, FileText, Calendar, Building2, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

export const SalesCoordinatorPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isSidebarCollapsed, showSidebar } = useLayout();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectApi.getSalesProjects();
            setProjects(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSalesData = async (projectId: number, formData: UpdateSalesDataRequest) => {
        try {
            await projectApi.updateSalesData(projectId, formData);
            showToast('Sales data updated successfully', 'success');
            setShowEditModal(false);
            setSelectedProject(null);
            loadProjects();
        } catch (error: any) {
            showToast(error.message || 'Failed to update sales data', 'error');
        }
    };

    const handleMarkReadyForAccounts = async (projectId: number) => {
        try {
            await projectApi.markReadyForAccounts(projectId);
            showToast('Project moved to Accounts', 'success');
            loadProjects();
        } catch (error: any) {
            showToast(error.message || 'Failed to move to Accounts', 'error');
        }
    };

    const filteredProjects = React.useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return projects.filter(p => 
            p.school.toLowerCase().includes(lowerSearchTerm) ||
            p.contactPerson?.toLowerCase().includes(lowerSearchTerm) ||
            p.contactNumber?.includes(searchTerm)
        );
    }, [projects, searchTerm]);

    const formatCurrency = (amount?: number) => {
        if (!amount) return '₹0';
        return `₹${amount.toLocaleString('en-IN')}`;
    };

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
                            Sales Coordinator
                        </h1>
                        <p className="text-gray-600 text-sm lg:text-base font-medium">
                            Manage quotations and prepare projects for accounts
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="glass-panel rounded-2xl p-4 mb-6 animate-premium shadow-lg">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by school, contact person, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/50 border-0 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-12 text-center animate-premium">
                            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 font-medium">No projects in sales queue</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 lg:gap-6">
                            {filteredProjects.map((project) => (
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
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap">
                                                    {project.currentStage === 'SALES' ? 'Sales' : 'Accounts'}
                                                </span>
                                            </div>

                                            {/* Sales Data Display */}
                                            {(project.projectValue || project.invoiceAmount) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200/50">
                                                    {project.projectValue && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <DollarSign size={16} className="text-green-600" />
                                                            <span className="text-gray-600">Project Value:</span>
                                                            <span className="font-bold text-gray-900">{formatCurrency(project.projectValue)}</span>
                                                        </div>
                                                    )}
                                                    {project.invoiceAmount && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileText size={16} className="text-blue-600" />
                                                            <span className="text-gray-600">Invoice:</span>
                                                            <span className="font-bold text-gray-900">{formatCurrency(project.invoiceAmount)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {project.expectedDeliveryDate && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar size={14} />
                                                    Expected Delivery: {new Date(project.expectedDeliveryDate).toLocaleDateString()}
                                                </div>
                                            )}

                                            {project.salesRemarks && (
                                                <div className="text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3">
                                                    <span className="font-semibold">Remarks:</span> {project.salesRemarks}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Section - Actions */}
                                        <div className="flex flex-col gap-2 lg:items-end">
                                            <button
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setShowEditModal(true);
                                                }}
                                                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-brand-500 hover:text-brand-600 transition-all font-semibold text-sm shadow-sm"
                                            >
                                                Update Sales Data
                                            </button>
                                            
                                            {project.currentStage === 'SALES' && project.projectValue && project.invoiceAmount && (
                                                <button
                                                    onClick={() => handleMarkReadyForAccounts(project.id)}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm flex items-center gap-2"
                                                >
                                                    <Send size={16} />
                                                    Send to Accounts
                                                </button>
                                            )}

                                            {project.currentStage === 'SALES' && (!project.projectValue || !project.invoiceAmount) && (
                                                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                                    <AlertCircle size={14} />
                                                    Complete data to proceed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Sales Data Modal */}
            {showEditModal && selectedProject && (
                <SalesDataModal
                    project={selectedProject}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedProject(null);
                    }}
                    onUpdate={handleUpdateSalesData}
                />
            )}
        </div>
    );
};

// Sales Data Modal Component
const SalesDataModal: React.FC<{
    project: Project;
    onClose: () => void;
    onUpdate: (projectId: number, data: UpdateSalesDataRequest) => void;
}> = ({ project, onClose, onUpdate }) => {
    const [formData, setFormData] = useState<UpdateSalesDataRequest>({
        projectValue: project.projectValue,
        invoiceAmount: project.invoiceAmount,
        pendingDelivery: project.pendingDelivery,
        quotationRemarks: project.quotationRemarks,
        expectedDeliveryDate: project.expectedDeliveryDate,
        salesRemarks: project.salesRemarks
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(project.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Update Sales Data</h2>
                        <p className="text-sm text-gray-600 mt-1">{project.school}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Project Value (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.projectValue || ''}
                                onChange={(e) => setFormData({ ...formData, projectValue: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                                placeholder="Enter project value"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Invoice Amount (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.invoiceAmount || ''}
                                onChange={(e) => setFormData({ ...formData, invoiceAmount: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                                placeholder="Enter invoice amount"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Expected Delivery Date
                        </label>
                        <input
                            type="date"
                            value={formData.expectedDeliveryDate || ''}
                            onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Pending Delivery Details
                        </label>
                        <textarea
                            value={formData.pendingDelivery || ''}
                            onChange={(e) => setFormData({ ...formData, pendingDelivery: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                            placeholder="Enter pending delivery details"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Quotation Remarks
                        </label>
                        <textarea
                            value={formData.quotationRemarks || ''}
                            onChange={(e) => setFormData({ ...formData, quotationRemarks: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                            placeholder="Enter quotation remarks"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Sales Remarks
                        </label>
                        <textarea
                            value={formData.salesRemarks || ''}
                            onChange={(e) => setFormData({ ...formData, salesRemarks: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                            placeholder="Enter sales remarks"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            Update Sales Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
