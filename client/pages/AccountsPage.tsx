import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useLayout } from '../context/LayoutContext';
import { Project, UpdateAccountsDataRequest, PaymentStatus } from '../types';
import { projectApi } from '../services/api';
import { Search, DollarSign, CreditCard, Calendar, Building2, MapPin, Receipt, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatIndianNumber, parseIndianNumber } from '../utils/numberFormat';

export const AccountsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { isSidebarCollapsed, showSidebar } = useLayout();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectApi.getAccountsProjects();
            setProjects(data);
        } catch (error: any) {
            showToast(error.message || 'Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePayment = async (projectId: number, formData: UpdateAccountsDataRequest) => {
        try {
            await projectApi.updateAccountsData(projectId, formData);
            showToast('Payment data updated successfully', 'success');
            setShowPaymentModal(false);
            setSelectedProject(null);
            loadProjects();
        } catch (error: any) {
            showToast(error.message || 'Failed to update payment data', 'error');
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

    const getPaymentStatusColor = (status?: PaymentStatus) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'PARTIAL':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'PENDING':
            default:
                return 'bg-red-100 text-red-700 border-red-200';
        }
    };

    const getPaymentStatusIcon = (status?: PaymentStatus) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle size={16} />;
            case 'PARTIAL':
                return <Clock size={16} />;
            case 'PENDING':
            default:
                return <AlertTriangle size={16} />;
        }
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
                            Accounts & Payments
                        </h1>
                        <p className="text-gray-600 text-sm lg:text-base font-medium">
                            Track payments and verify financial transactions
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
                            <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 font-medium">No projects in accounts queue</p>
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
                                                {project.paymentStatus && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${getPaymentStatusColor(project.paymentStatus)}`}>
                                                        {getPaymentStatusIcon(project.paymentStatus)}
                                                        {project.paymentStatus}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Financial Overview */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-200/50">
                                                <div className="bg-blue-50/50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                                                        <Receipt size={14} />
                                                        Invoice Amount
                                                    </div>
                                                    <div className="text-lg font-bold text-blue-900">
                                                        {formatCurrency(project.invoiceAmount)}
                                                    </div>
                                                </div>
                                                <div className="bg-green-50/50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
                                                        <CheckCircle size={14} />
                                                        Received
                                                    </div>
                                                    <div className="text-lg font-bold text-green-900">
                                                        {formatCurrency(project.amountReceived)}
                                                    </div>
                                                </div>
                                                <div className="bg-red-50/50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
                                                        <Clock size={14} />
                                                        Pending
                                                    </div>
                                                    <div className="text-lg font-bold text-red-900">
                                                        {formatCurrency(project.pendingAmount)}
                                                    </div>
                                                </div>
                                            </div>

                                            {project.paymentDate && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar size={14} />
                                                    Payment Date: {new Date(project.paymentDate).toLocaleDateString()}
                                                </div>
                                            )}

                                            {project.paymentRemarks && (
                                                <div className="text-sm text-gray-600 bg-gray-50/50 rounded-lg p-3">
                                                    <span className="font-semibold">Remarks:</span> {project.paymentRemarks}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Section - Actions */}
                                        <div className="flex flex-col gap-2 lg:items-end">
                                            <button
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setShowPaymentModal(true);
                                                }}
                                                className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm flex items-center gap-2"
                                            >
                                                <CreditCard size={16} />
                                                Update Payment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Update Modal */}
            {showPaymentModal && selectedProject && (
                <PaymentModal
                    project={selectedProject}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedProject(null);
                    }}
                    onUpdate={handleUpdatePayment}
                />
            )}
        </div>
    );
};

// Payment Modal Component
const PaymentModal: React.FC<{
    project: Project;
    onClose: () => void;
    onUpdate: (projectId: number, data: UpdateAccountsDataRequest) => void;
}> = ({ project, onClose, onUpdate }) => {
    const [formData, setFormData] = useState<UpdateAccountsDataRequest>({
        paymentStatus: project.paymentStatus || 'PENDING',
        amountReceived: 0,  // Start empty - user enters new payment amount only
        pendingAmount: project.pendingAmount,
        paymentDate: project.paymentDate,
        paymentRemarks: project.paymentRemarks,
        paymentProofUrl: project.paymentProofUrl
    });
    const [validationError, setValidationError] = useState<string>('');

    const calculatePending = () => {
        const invoice = project.invoiceAmount || 0;
        const currentReceived = project.totalReceived || 0;
        const newPayment = formData.amountReceived || 0;
        return invoice - currentReceived - newPayment;
    };

    const validateAmount = (amount: number) => {
        const currentReceived = project.totalReceived || 0;
        const pending = project.invoiceAmount || 0 - currentReceived;
        
        if (amount > pending) {
            setValidationError('New payment cannot exceed pending amount');
            return false;
        }
        if (amount <= 0) {
            setValidationError('Payment amount must be greater than zero');
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleAmountChange = (value: number) => {
        setFormData({ ...formData, amountReceived: value });
        validateAmount(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pending = calculatePending();
        if (pending < 0) {
            setValidationError('Pending amount cannot be negative. Please adjust the amount received.');
            return;
        }
        if (!validateAmount(formData.amountReceived || 0)) {
            return;
        }
        onUpdate(project.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Update Payment</h2>
                        <p className="text-sm text-gray-600 mt-1">{project.school}</p>
                        <div className="mt-2 text-sm">
                            <span className="font-semibold">Invoice Amount: </span>
                            <span className="text-lg font-bold text-blue-600">
                                ₹{(project.invoiceAmount || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Payment Status *
                        </label>
                        <select
                            required
                            value={formData.paymentStatus}
                            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                New Payment Amount (₹)
                            </label>
                            <input
                                type="text"
                                value={formatIndianNumber(formData.amountReceived || '')}
                                onChange={(e) => handleAmountChange(parseIndianNumber(e.target.value))}
                                className={`w-full px-4 py-3 bg-white/50 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 transition-all font-medium ${
                                    validationError ? 'border-red-500' : 'border-gray-200 focus:border-brand-500'
                                }`}
                                placeholder="Enter new payment amount"
                            />
                            {validationError && (
                                <p className="text-red-500 text-sm mt-1 font-medium flex items-center gap-1">
                                    <AlertTriangle size={14} />
                                    {validationError}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Pending Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={calculatePending()}
                                readOnly
                                className={`w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl font-medium ${
                                    calculatePending() < 0 ? 'text-red-600' : 'text-gray-900'
                                }`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Payment Date
                        </label>
                        <input
                            type="date"
                            value={formData.paymentDate || ''}
                            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Payment Proof URL
                        </label>
                        <input
                            type="url"
                            value={formData.paymentProofUrl || ''}
                            onChange={(e) => setFormData({ ...formData, paymentProofUrl: e.target.value })}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                            placeholder="Enter payment proof URL"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Payment Remarks
                        </label>
                        <textarea
                            value={formData.paymentRemarks || ''}
                            onChange={(e) => setFormData({ ...formData, paymentRemarks: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
                            placeholder="Enter payment remarks"
                        />
                    </div>

                    {formData.paymentStatus === 'COMPLETED' && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-green-700 font-semibold">
                                <CheckCircle size={20} />
                                This project will be automatically moved to Installation queue
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
                            disabled={!!validationError}
                            className={`px-6 py-3 rounded-xl transition-all font-semibold ${
                                validationError 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg'
                            }`}
                        >
                            Update Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
