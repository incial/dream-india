import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { Tabs } from '../components/ui/Tabs';
import { Project, CreateProjectRequest, ProjectStage, ExecutiveProjectStatus } from '../types';
import { projectApi } from '../services/api';
import { Plus, Search, Building2, MapPin, Calendar, Trash2, Edit2, Eye, ChevronDown, User, Phone, FileText, Briefcase } from 'lucide-react';
import { KERALA_DISTRICTS } from '../constants/kerala-districts';

export const ExecutivePage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isSidebarCollapsed, showSidebar } = useLayout();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('non-onboarded');

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

    const handleUpdateProject = async (id: number, formData: CreateProjectRequest) => {
        try {
            await projectApi.updateProject(id, formData);
            showToast('Project updated successfully', 'success');
            setEditingProject(null);
            setSelectedProject(null);
            loadProjects();
        } catch (error: any) {
            showToast(error.message || 'Failed to update project', 'error');
        }
    };

    const handleDeleteProject = async (id: number) => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }
        
        try {
            await projectApi.deleteProject(id);
            showToast('Project deleted successfully', 'success');
            setSelectedProject(null);
            loadProjects();
        } catch (error: any) {
            showToast(error.message || 'Failed to delete project', 'error');
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

    // Helper functions to check executive view status (uses server-computed field)
    const isNonOnboarded = (project: Project): boolean => {
        return project.executiveViewStatus === 'NON_ONBOARDED';
    };

    const isOnboardedNotCompleted = (project: Project): boolean => {
        return project.executiveViewStatus === 'ONBOARDED_ACTIVE';
    };

    const isCompleted = (project: Project): boolean => {
        return project.executiveViewStatus === 'COMPLETED';
    };

    const canDelete = (project: Project): boolean => {
        return isNonOnboarded(project) && project.createdBy === user?.name;
    };

    const canEdit = (project: Project): boolean => {
        // Completed projects cannot be edited
        if (isCompleted(project)) return false;
        
        // Non-onboarded projects can be edited by any executive
        if (isNonOnboarded(project)) return true;
        
        // Onboarded projects can only be edited by creator
        if (project.createdBy !== user?.name) return false;
        
        return true;
    };

    // Filter projects based on active tab and search
    const filteredProjects = React.useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        let tabFiltered = projects;
        if (activeTab === 'non-onboarded') {
            tabFiltered = projects.filter(p => p.executiveViewStatus === 'NON_ONBOARDED');
        } else if (activeTab === 'onboarded') {
            tabFiltered = projects.filter(p => p.executiveViewStatus === 'ONBOARDED_ACTIVE');
        } else if (activeTab === 'completed') {
            tabFiltered = projects.filter(p => p.executiveViewStatus === 'COMPLETED');
        }

        return tabFiltered.filter(p => 
            p.school.toLowerCase().includes(lowerSearchTerm) ||
            p.contactPerson?.toLowerCase().includes(lowerSearchTerm) ||
            p.contactNumber?.includes(searchTerm)
        );
    }, [projects, searchTerm, activeTab]);

    const tabs = [
        { 
            id: 'non-onboarded', 
            label: 'Non-Onboarded (Leads)',
            count: projects.filter(p => p.executiveViewStatus === 'NON_ONBOARDED').length
        },
        { 
            id: 'onboarded', 
            label: 'Onboarded (Not Completed)',
            count: projects.filter(p => p.executiveViewStatus === 'ONBOARDED_ACTIVE').length
        },
        { 
            id: 'completed', 
            label: 'Completed',
            count: projects.filter(p => p.executiveViewStatus === 'COMPLETED').length
        }
    ];

    return (
        <div className="flex min-h-screen mesh-bg relative">
            <div className="glass-canvas" />
            <Sidebar />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${!showSidebar ? 'lg:ml-0' : isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
                <Navbar />
                
                <div className="px-4 lg:px-12 py-6 lg:py-10 pb-32">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-8 mb-8 animate-premium">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 display-text mb-2">
                                Executive Registry
                            </h1>
                            <p className="text-gray-600 text-sm lg:text-base font-medium">
                                Manage your leads and projects across different stages
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

                    {/* Tabs */}
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

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
                                <p className="text-gray-600 font-medium">
                                    {activeTab === 'non-onboarded' && 'No leads found. Create your first project!'}
                                    {activeTab === 'onboarded' && 'No onboarded projects found.'}
                                    {activeTab === 'completed' && 'No completed projects yet.'}
                                </p>
                            </div>
                        ) : (
                            filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    activeTab={activeTab}
                                    getStageLabel={getStageLabel}
                                    getNextStage={getNextStage}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                    onView={() => setSelectedProject(project)}
                                    onEdit={() => setEditingProject(project)}
                                    onDelete={() => handleDeleteProject(project.id)}
                                    onStageTransition={handleStageTransition}
                                />
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

            {/* Edit Project Modal */}
            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onUpdate={handleUpdateProject}
                />
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    isReadOnly={activeTab === 'completed'}
                />
            )}
        </div>
    );
};

// Project Card Component
interface ProjectCardProps {
    project: Project;
    activeTab: string;
    getStageLabel: (stage: ProjectStage) => string;
    getNextStage: (stage: ProjectStage) => ProjectStage | null;
    canEdit: (project: Project) => boolean;
    canDelete: (project: Project) => boolean;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onStageTransition: (projectId: number, toStage: ProjectStage) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    activeTab,
    getStageLabel,
    getNextStage,
    canEdit,
    canDelete,
    onView,
    onEdit,
    onDelete,
    onStageTransition
}) => {
    const isNonOnboarded = activeTab === 'non-onboarded';
    const isCompleted = activeTab === 'completed';

    return (
        <div className="glass-panel rounded-2xl p-6 hover:shadow-xl transition-all animate-premium">
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

            {/* Stage Progress Bar (for non-onboarded only) */}
            {isNonOnboarded && (
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
            )}

            {/* Actions */}
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="flex items-center gap-1.5 px-3 py-2 text-brand-600 hover:text-brand-700 text-sm font-semibold hover:bg-brand-50 rounded-lg transition-all"
                    >
                        <Eye size={16} />
                        View
                    </button>
                    {canEdit(project) && (
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:text-blue-700 text-sm font-semibold hover:bg-blue-50 rounded-lg transition-all"
                        >
                            <Edit2 size={16} />
                            Edit
                        </button>
                    )}
                    {canDelete(project) && (
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 text-sm font-semibold hover:bg-red-50 rounded-lg transition-all"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                </div>
                {isNonOnboarded && getNextStage(project.currentStage) && !project.isLocked && (
                    <button
                        onClick={() => onStageTransition(project.id, getNextStage(project.currentStage)!)}
                        className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
                    >
                        Move to {getStageLabel(getNextStage(project.currentStage)!)}
                    </button>
                )}
            </div>
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
    
    // State for searchable district dropdown
    const [districtSearch, setDistrictSearch] = useState('');
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [filteredDistricts, setFilteredDistricts] = useState(KERALA_DISTRICTS);

    // Filter districts based on search
    useEffect(() => {
        if (districtSearch) {
            const filtered = KERALA_DISTRICTS.filter(district =>
                district.toLowerCase().includes(districtSearch.toLowerCase())
            );
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts(KERALA_DISTRICTS);
        }
    }, [districtSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(formData);
    };
    
    const handleDistrictSelect = (district: string) => {
        setFormData({ ...formData, district });
        setDistrictSearch(district);
        setShowDistrictDropdown(false);
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
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={districtSearch}
                                        onChange={(e) => {
                                            setDistrictSearch(e.target.value);
                                            setShowDistrictDropdown(true);
                                            if (!e.target.value) {
                                                setFormData({ ...formData, district: '' });
                                            }
                                        }}
                                        onFocus={() => setShowDistrictDropdown(true)}
                                        className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400"
                                        placeholder="Search district..."
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                    
                                    {showDistrictDropdown && filteredDistricts.length > 0 && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setShowDistrictDropdown(false)}
                                            />
                                            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                {filteredDistricts.map((district) => (
                                                    <div
                                                        key={district}
                                                        onClick={() => handleDistrictSelect(district)}
                                                        className="px-4 py-3 hover:bg-brand-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors"
                                                    >
                                                        {district}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
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

// Edit Project Modal Component
const EditProjectModal: React.FC<{
    project: Project;
    onClose: () => void;
    onUpdate: (id: number, data: CreateProjectRequest) => void;
}> = ({ project, onClose, onUpdate }) => {
    const [formData, setFormData] = useState<CreateProjectRequest>({
        school: project.school || '',
        contactPerson: project.contactPerson || '',
        contactNumber: project.contactNumber || '',
        place: project.place || '',
        district: project.district || '',
        region: project.region,
        projectName: project.projectName || '',
        parentCompany: project.parentCompany || '',
        executiveRemarks: project.executiveRemarks || ''
    });
    
    // State for searchable district dropdown
    const [districtSearch, setDistrictSearch] = useState(project.district || '');
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [filteredDistricts, setFilteredDistricts] = useState(KERALA_DISTRICTS);

    // Check if project is onboarded or later
    const isOnboardedOrLater = ['ONBOARDED', 'SALES', 'ACCOUNTS', 'INSTALLATION'].includes(project.currentStage);

    // Filter districts based on search
    useEffect(() => {
        if (districtSearch) {
            const filtered = KERALA_DISTRICTS.filter(district =>
                district.toLowerCase().includes(districtSearch.toLowerCase())
            );
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts(KERALA_DISTRICTS);
        }
    }, [districtSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(project.id, formData);
    };
    
    const handleDistrictSelect = (district: string) => {
        setFormData({ ...formData, district });
        setDistrictSearch(district);
        setShowDistrictDropdown(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isOnboardedOrLater 
                                ? 'Update executive fields only (financial/accounts fields are managed by other teams)'
                                : 'Update project details'}
                        </p>
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

                    {/* Contact Information */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={18} className="text-brand-600" />
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

                    {/* Location Details */}
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
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={districtSearch}
                                        onChange={(e) => {
                                            setDistrictSearch(e.target.value);
                                            setShowDistrictDropdown(true);
                                            if (!e.target.value) {
                                                setFormData({ ...formData, district: '' });
                                            }
                                        }}
                                        onFocus={() => setShowDistrictDropdown(true)}
                                        className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm font-medium placeholder:text-gray-400"
                                        placeholder="Search district..."
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                    
                                    {showDistrictDropdown && filteredDistricts.length > 0 && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setShowDistrictDropdown(false)}
                                            />
                                            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                {filteredDistricts.map((district) => (
                                                    <div
                                                        key={district}
                                                        onClick={() => handleDistrictSelect(district)}
                                                        className="px-4 py-3 hover:bg-brand-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors"
                                                    >
                                                        {district}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
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

                    {/* Parent Company */}
                    <div className="pt-4 border-t border-gray-100">
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

                    {/* Executive Remarks */}
                    <div className="pt-4 border-t border-gray-100">
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
                            Update Project
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
    isReadOnly?: boolean;
}> = ({ project, onClose, isReadOnly = false }) => {
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
