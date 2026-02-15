import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { Project, UpdateInstallationDataRequest, InstallationStatus } from '../types';
import { projectApi } from '../services/api';
import { Search, Wrench, CheckCircle, XCircle, Clock, Building2, MapPin, Calendar, AlertCircle } from 'lucide-react';

export const InstallationPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isSidebarCollapsed } = useLayout();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectApi.getInstallationProjects();
            setProjects(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateInstallation = async (projectId: number, formData: UpdateInstallationDataRequest) => {
        try {
            await projectApi.updateInstallationData(projectId, formData);
            showToast('Installation status updated successfully', 'success');
            setShowStatusModal(false);
            setSelectedProject(null);
            loadProjects();
        } catch (error: any) {
            showToast(error.message || 'Failed to update installation status', 'error');
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

    const getInstallationStatusColor = (status?: InstallationStatus) => {
        switch (status) {
            case 'WORK_DONE':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'NOT_DONE':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'PENDING':
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const getInstallationStatusIcon = (status?: InstallationStatus) => {
        switch (status) {
            case 'WORK_DONE':
                return <CheckCircle size={16} />;
            case 'NOT_DONE':
                return <XCircle size={16} />;
            case 'PENDING':
            default:
                return <Clock size={16} />;
        }
    };

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
                            Installation & Completion
                        </h1>
                        <p className="text-gray-600 text-sm lg:text-base font-medium">
                            Track installation progress and mark projects complete
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
                            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 font-medium">No projects in installation queue</p>
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
                                                {project.installationStatus && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${getInstallationStatusColor(project.installationStatus)}`}>
                                                        {getInstallationStatusIcon(project.installationStatus)}
                                                        {project.installationStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Installation Details */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200/50">
                                                {project.expectedDeliveryDate && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar size={16} className="text-blue-600" />
                                                        <span className="text-gray-600">Expected:</span>
                                                        <span className="font-bold text-gray-900">
                                                            {new Date(project.expectedDeliveryDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {project.completionDate && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle size={16} className="text-green-600" />
                                                        <span className="text-gray-600">Completed:</span>
                                                        <span className="font-bold text-gray-900">
                                                            {new Date(project.completionDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Payment Status */}
                                            {project.paymentStatus && (
                                                <div className="bg-green-50/50 rounded-lg p-3 border border-green-200">
                                                    <div className="flex items-center gap-2 text-sm text-green-700">
                                                        <CheckCircle size={16} />
                                                        <span className="font-semibold">Payment Status:</span>
                                                        <span className="font-bold">{project.paymentStatus}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {project.installationRemarks && (
                                                <div className="text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3">
                                                    <span className="font-semibold">Installation Remarks:</span> {project.installationRemarks}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Section - Actions */}
                                        <div className="flex flex-col gap-2 lg:items-end">
                                            <button
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setShowStatusModal(true);
                                                }}
                                                className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm flex items-center gap-2"
                                            >
                                                <Wrench size={16} />
                                                Update Status
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Installation Status Modal */}
            {showStatusModal && selectedProject && (
                <InstallationModal
                    project={selectedProject}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedProject(null);
                    }}
                    onUpdate={handleUpdateInstallation}
                />
            )}
        </div>
    );
};

// Installation Modal Component
const InstallationModal: React.FC<{
    project: Project;
    onClose: () => void;
    onUpdate: (projectId: number, data: UpdateInstallationDataRequest) => void;
}> = ({ project, onClose, onUpdate }) => {
    const [formData, setFormData] = useState<UpdateInstallationDataRequest>({
        installationStatus: project.installationStatus || 'PENDING',
        installationRemarks: project.installationRemarks,
        completionDate: project.completionDate
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
                        <h2 className="text-2xl font-bold text-gray-900">Update Installation Status</h2>
                        <p className="text-sm text-gray-600 mt-1">{project.school}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Installation Status *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(['PENDING', 'WORK_DONE', 'NOT_DONE'] as InstallationStatus[]).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, installationStatus: status })}
                                    className={`px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                                        formData.installationStatus === status
                                            ? 'bg-brand-500 text-white border-brand-500 shadow-lg'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                                    }`}
                                >
                                    {status === 'WORK_DONE' && <CheckCircle size={16} className="inline mr-2" />}
                                    {status === 'NOT_DONE' && <XCircle size={16} className="inline mr-2" />}
                                    {status === 'PENDING' && <Clock size={16} className="inline mr-2" />}
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Completion Date
                        </label>
                        <input
                            type="date"
                            value={formData.completionDate || ''}
                            onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Installation Remarks
                        </label>
                        <textarea
                            value={formData.installationRemarks || ''}
                            onChange={(e) => setFormData({ ...formData, installationRemarks: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                            placeholder="Enter installation remarks, issues, or notes"
                        />
                    </div>

                    {formData.installationStatus === 'WORK_DONE' && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-green-700">
                                    <p className="font-semibold mb-1">Project will be marked as COMPLETED</p>
                                    <p className="text-green-600">This project will be automatically moved to the completed projects archive.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.installationStatus === 'NOT_DONE' && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-700">
                                    <p className="font-semibold mb-1">Work not completed</p>
                                    <p className="text-red-600">Please provide detailed remarks about why the installation could not be completed.</p>
                                </div>
                            </div>
                        </div>
                    )}

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
                            Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
