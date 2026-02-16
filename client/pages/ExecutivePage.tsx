import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { Project, CreateProjectRequest, ProjectStage } from '../types';
import { projectApi } from '../services/api';
import { Plus, Search, Filter, Building2, MapPin, Calendar, User, Phone, FileText, Briefcase } from 'lucide-react';

export const ExecutivePage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isSidebarCollapsed } = useLayout();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectApi.getExecutiveProjects();
            setProjects(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (formData: CreateProjectRequest) => {
        try {
            await projectApi.createProject(formData);
            showToast('Project created successfully', 'success');
            setShowCreateModal(false);
            loadProjects();
        } catch (error: any) {
            showToast(error.message || 'Failed to create project', 'error');
        }
    };

    const handleStageTransition = async (projectId: number, toStage: ProjectStage) => {
        try {
            await projectApi.transitionStage(projectId, { toStage });
            showToast('Stage updated successfully', 'success');
            loadProjects();
        } catch (error: any) {
            showToast(error.message || 'Failed to update stage', 'error');
        }
    };

    const getStageLabel = (stage: ProjectStage): string => {
        const labels: Record<ProjectStage, string> = {
            'LEAD': 'Lead',
            'ON_PROGRESS': 'On Progress',
            'QUOTATION_SENT': 'Quotation Sent',
            'IN_REVIEW': 'In Review',
            'ONBOARDED': 'Onboarded',
            'SALES': 'Sales',
            'ACCOUNTS': 'Accounts',
            'INSTALLATION': 'Installation',
            'COMPLETED': 'Completed'
        };
        return labels[stage] || stage;
    };

    const getNextStage = (currentStage: ProjectStage): ProjectStage | null => {
        const transitions: Record<ProjectStage, ProjectStage | null> = {
            'LEAD': 'ON_PROGRESS',
            'ON_PROGRESS': 'QUOTATION_SENT',
            'QUOTATION_SENT': 'IN_REVIEW',
            'IN_REVIEW': 'ONBOARDED',
            'ONBOARDED': null,
            'SALES': null,
            'ACCOUNTS': null,
            'INSTALLATION': null,
            'COMPLETED': null
        };
        return transitions[currentStage];
    };

    const filteredProjects = React.useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return projects.filter(p => 
            p.school.toLowerCase().includes(lowerSearchTerm) ||
            p.contactPerson?.toLowerCase().includes(lowerSearchTerm) ||
            p.contactNumber?.includes(searchTerm)
        );
    }, [projects, searchTerm]);

    return (
        <div className="flex min-h-screen mesh-bg relative">
            <div className="glass-canvas" />
            <Sidebar />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
                <Navbar />
                
                <div className="px-4 lg:px-12 py-6 lg:py-10 pb-32">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-8 mb-8 animate-premium">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 display-text mb-2">
                                Projects - Executive
                            </h1>
                            <p className="text-gray-600 text-sm lg:text-base font-medium">
                                Manage leads and project pipeline
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                        >
                            <Plus size={20} />
                            Create Project
                        </button>
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

                    {/* Projects List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="glass-panel rounded-2xl p-12 text-center animate-premium">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
                                <p className="text-gray-600 mt-4 font-medium">Loading projects...</p>
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="glass-panel rounded-2xl p-12 text-center animate-premium">
                                <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium">No projects found. Create your first project!</p>
                            </div>
                        ) : (
                            filteredProjects.map((project) => (
                                <div key={project.id} className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{project.school}</h3>
                                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                                {project.contactPerson && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Building2 size={16} />
                                                        {project.contactPerson}
                                                    </span>
                                                )}
                                                {project.place && (
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin size={16} />
                                                        {project.place}, {project.district}
                                                    </span>
                                                )}
                                                {project.createdDate && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={16} />
                                                        {new Date(project.createdDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full text-sm font-semibold shadow-sm">
                                                {getStageLabel(project.currentStage)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stage Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between mb-2">
                                            {['LEAD', 'ON_PROGRESS', 'QUOTATION_SENT', 'IN_REVIEW', 'ONBOARDED'].map((stage) => (
                                                <div key={stage} className="flex-1 text-center">
                                                    <div className={`text-xs font-medium ${project.currentStage === stage ? 'text-brand-600 font-bold' : 'text-gray-500'}`}>
                                                        {getStageLabel(stage as ProjectStage)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <div className="h-2 bg-gray-200/50 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${Math.max(0, (['LEAD', 'ON_PROGRESS', 'QUOTATION_SENT', 'IN_REVIEW', 'ONBOARDED'].indexOf(project.currentStage) + 1) * 20)}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={() => setSelectedProject(project)}
                                            className="text-brand-600 hover:text-brand-700 text-sm font-semibold hover:underline"
                                        >
                                            View Details →
                                        </button>
                                        {getNextStage(project.currentStage) && !project.isLocked && (
                                            <button
                                                onClick={() => handleStageTransition(project.id, getNextStage(project.currentStage)!)}
                                                className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
                                            >
                                                Move to {getStageLabel(getNextStage(project.currentStage)!)}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateProject}
                />
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onUpdate={loadProjects}
                />
            )}
        </div>
    );
};

// Simple Create Project Modal Component
const CreateProjectModal: React.FC<{
    onClose: () => void;
    onCreate: (data: CreateProjectRequest) => void;
}> = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState<CreateProjectRequest>({
        school: '',
        contactPerson: '',
        contactNumber: '',
        place: '',
        district: '',
        region: undefined,
        projectName: '',
        parentCompany: '',
        executiveRemarks: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
                        <p className="text-sm text-gray-600 mt-1">Add a new lead to the pipeline</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* School Information Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={18} className="text-brand-600" />
                            <h3 className="text-sm font-bold text-gray-800">School Information</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    School Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.school}
                                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400"
                                    placeholder="Enter school name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.projectName}
                                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400"
                                    placeholder="e.g., Smart Classroom Setup"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <User size={18} className="text-brand-600" />
                            <h3 className="text-sm font-bold text-gray-800">Contact Information</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Contact Person
                                </label>
                                <input
                                    type="text"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400"
                                    placeholder="Contact person name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.contactNumber}
                                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location Details Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={18} className="text-brand-600" />
                            <h3 className="text-sm font-bold text-gray-800">Location Details</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Place
                                </label>
                                <input
                                    type="text"
                                    value={formData.place}
                                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400"
                                    placeholder="City/Town"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    District
                                </label>
                                <input
                                    type="text"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400"
                                    placeholder="District"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Region
                                </label>
                                <select
                                    value={formData.region || ''}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium"
                                >
                                    <option value="">Select region</option>
                                    <option value="North">North</option>
                                    <option value="South">South</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Business Details Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase size={18} className="text-brand-600" />
                            <h3 className="text-sm font-bold text-gray-800">Business Details</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Parent Company
                            </label>
                            <select
                                value={formData.parentCompany}
                                onChange={(e) => setFormData({ ...formData, parentCompany: e.target.value })}
                                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium"
                            >
                                <option value="">Select parent company</option>
                                <option value="Dream India Learning Solutions">Dream India Learning Solutions</option>
                                <option value="Dream India Technologies">Dream India Technologies</option>
                                <option value="Dream India Education Services">Dream India Education Services</option>
                                <option value="Dream India Digital Systems">Dream India Digital Systems</option>
                                <option value="Dream India Smart Solutions">Dream India Smart Solutions</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={18} className="text-brand-600" />
                            <h3 className="text-sm font-bold text-gray-800">Additional Information</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Executive Remarks
                            </label>
                            <textarea
                                value={formData.executiveRemarks}
                                onChange={(e) => setFormData({ ...formData, executiveRemarks: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400 resize-none"
                                placeholder="Add any notes or remarks about this lead..."
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
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
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Simple Project Details Modal Component
const ProjectDetailsModal: React.FC<{
    project: Project;
    onClose: () => void;
    onUpdate: () => void;
}> = ({ project, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                        ✕
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="bg-white/50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-500 mb-1">School</label>
                        <p className="text-gray-900 font-medium">{project.school}</p>
                    </div>
                    {project.contactPerson && (
                        <div className="bg-white/50 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-500 mb-1">Contact Person</label>
                            <p className="text-gray-900 font-medium">{project.contactPerson}</p>
                        </div>
                    )}
                    {project.contactNumber && (
                        <div className="bg-white/50 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-500 mb-1">Contact Number</label>
                            <p className="text-gray-900 font-medium">{project.contactNumber}</p>
                        </div>
                    )}
                    {project.place && (
                        <div className="bg-white/50 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-500 mb-1">Location</label>
                            <p className="text-gray-900 font-medium">{project.place}, {project.district}</p>
                        </div>
                    )}
                    {project.region && (
                        <div className="bg-white/50 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-500 mb-1">Region</label>
                            <p className="text-gray-900 font-medium">{project.region}</p>
                        </div>
                    )}
                    {project.parentCompany && (
                        <div className="bg-white/50 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-500 mb-1">Parent Company</label>
                            <p className="text-gray-900 font-medium">{project.parentCompany}</p>
                        </div>
                    )}
                    {project.executiveRemarks && (
                        <div className="bg-white/50 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-500 mb-1">Remarks</label>
                            <p className="text-gray-900 font-medium">{project.executiveRemarks}</p>
                        </div>
                    )}
                    <div className="bg-white/50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-500 mb-1">Current Stage</label>
                        <span className="inline-flex px-3 py-1.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full text-sm font-semibold">
                            {project.currentStage}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
