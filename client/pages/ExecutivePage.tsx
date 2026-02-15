import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { Project, CreateProjectRequest, ProjectStage } from '../types';
import { projectApi } from '../services/api';
import { Plus, Search, Filter, Building2, MapPin, Calendar } from 'lucide-react';

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
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar />
                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Projects - Executive</h1>
                                <p className="text-gray-600 mt-1">Manage leads and project pipeline</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus size={20} />
                                Create Project
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by school, contact person, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Projects List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-600 mt-4">Loading projects...</p>
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                    <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">No projects found. Create your first project!</p>
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{project.school}</h3>
                                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                                    {project.contactPerson && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 size={16} />
                                                            {project.contactPerson}
                                                        </span>
                                                    )}
                                                    {project.place && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin size={16} />
                                                            {project.place}, {project.district}
                                                        </span>
                                                    )}
                                                    {project.createdDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={16} />
                                                            {new Date(project.createdDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                    {getStageLabel(project.currentStage)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stage Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between mb-2">
                                                {['LEAD', 'ON_PROGRESS', 'QUOTATION_SENT', 'IN_REVIEW', 'ONBOARDED'].map((stage, idx) => (
                                                    <div key={stage} className="flex-1 text-center">
                                                        <div className={`text-xs ${project.currentStage === stage ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                                                            {getStageLabel(stage as ProjectStage)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <div className="h-2 bg-gray-200 rounded-full">
                                                    <div 
                                                        className="h-2 bg-blue-600 rounded-full transition-all duration-300"
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
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                            {getNextStage(project.currentStage) && !project.isLocked && (
                                                <button
                                                    onClick={() => handleStageTransition(project.id, getNextStage(project.currentStage)!)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
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
                </main>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.school}
                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                            <input
                                type="text"
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                            <input
                                type="text"
                                value={formData.contactNumber}
                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Place</label>
                            <input
                                type="text"
                                value={formData.place}
                                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                            <select
                                value={formData.region || ''}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select</option>
                                <option value="North">North</option>
                                <option value="South">South</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <input
                            type="text"
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Company</label>
                        <input
                            type="text"
                            value={formData.parentCompany}
                            onChange={(e) => setFormData({ ...formData, parentCompany: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                        <textarea
                            value={formData.executiveRemarks}
                            onChange={(e) => setFormData({ ...formData, executiveRemarks: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Project Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">School</label>
                        <p className="text-gray-900">{project.school}</p>
                    </div>
                    {project.contactPerson && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Contact Person</label>
                            <p className="text-gray-900">{project.contactPerson}</p>
                        </div>
                    )}
                    {project.contactNumber && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                            <p className="text-gray-900">{project.contactNumber}</p>
                        </div>
                    )}
                    {project.place && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Location</label>
                            <p className="text-gray-900">{project.place}, {project.district}</p>
                        </div>
                    )}
                    {project.region && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Region</label>
                            <p className="text-gray-900">{project.region}</p>
                        </div>
                    )}
                    {project.parentCompany && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Parent Company</label>
                            <p className="text-gray-900">{project.parentCompany}</p>
                        </div>
                    )}
                    {project.executiveRemarks && (
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Remarks</label>
                            <p className="text-gray-900">{project.executiveRemarks}</p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Current Stage</label>
                        <p className="text-gray-900 font-semibold">{project.currentStage}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
