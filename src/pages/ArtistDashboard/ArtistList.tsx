/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { MoreVertical, X, User, Mail, Phone, MapPin, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {toast} from "react-hot-toast";
import axios from "axios";

interface Submission {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    artTypeName: string;
    artTypeId?: string;
    category?: string;
    bio: string;
    image: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    _source?: "artist" | "submission";
}

interface ArtistListProps {
    refreshTrigger?: boolean;
    onEdit?: (item: Submission) => void;
}

const ArtistList = ({ refreshTrigger, onEdit }: ArtistListProps) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [viewItem, setViewItem] = useState<Submission | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/artist-submissions/my`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setSubmissions(res.data.data || []);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load your submissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [refreshTrigger]);

    useEffect(() => {
        // Use mousedown with a small delay to allow menu item clicks to register
        const handleDocumentClick = (e: MouseEvent) => {
            if (openMenuId && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener("click", handleDocumentClick);
        return () => document.removeEventListener("click", handleDocumentClick);
    }, [openMenuId]);

    const statusConfig = {
        approved: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Approved" },
        pending: { color: "bg-yellow-100 text-yellow-700", icon: AlertCircle, label: "Pending" },
        rejected: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" },
    };

    const StatusBadge = ({ status }: { status: Submission["status"] }) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const handleDelete = async (id: string) => {
        try {
            setDeleteId(id);
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/artist-submissions/${id}/permanent`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success("Deleted successfully");
            await fetchSubmissions();
            setOpenMenuId(null);
        } catch (err) {
            toast.error("Delete failed");
        } finally {
            setDeleteId(null);
        }
    };

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleView = (item: Submission, e: React.MouseEvent) => {
        e.stopPropagation();
        setViewItem(item);
        setOpenMenuId(null);
    };

    const handleUpdate = (item: Submission, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit({ ...item, _source: "submission" });
        }
        setOpenMenuId(null);
    };

    const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await handleDelete(id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83261D] mx-auto mb-4" />
                    <p className="text-gray-500">Loading your submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead className="bg-gray-50">
                        <tr className="border-b">
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Artist</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Email</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Phone</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Location</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Art Type</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Submitted</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Status</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-500">
                                    You haven't submitted any artists yet
                                </td>
                            </tr>
                        ) : (
                            submissions.map((s) => (
                                <tr key={s._id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-2">
                                            {s.image ? (
                                                <img src={s.image} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {s.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-xs sm:text-sm font-medium text-gray-800">{s.name || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{s.email || "-"}</td>
                                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{s.phone || "-"}</td>
                                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">
                                        {[s.city, s.state, s.country].filter(Boolean).join(", ") || "-"}
                                    </td>
                                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{s.artTypeName || "-"}</td>
                                    <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">
                                        {new Date(s.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <StatusBadge status={s.status} />
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="relative" ref={openMenuId === s._id ? menuRef : null}>
                                            <button
                                                onClick={(e) => toggleMenu(s._id, e)}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <MoreVertical size={16} className="text-gray-500" />
                                            </button>
                                            {openMenuId === s._id && (
                                                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={(e) => handleView(s, e)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                                                    >
                                                        View
                                                    </button>
                                                    {onEdit && (
                                                        <button
                                                            onClick={(e) => handleUpdate(s, e)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50"
                                                        >
                                                            Update
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDeleteClick(s._id, e)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-gray-50"
                                                    >
                                                        {deleteId === s._id ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - Visible only on mobile */}
            <div className="block md:hidden">
                {submissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        You haven't submitted any artists yet
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {submissions.map((s) => (
                            <div key={s._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        {s.image ? (
                                            <img src={s.image} alt={s.name} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {s.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-800 truncate">{s.name || "-"}</h3>
                                            <StatusBadge status={s.status} />
                                        </div>
                                    </div>
                                    <div className="relative" ref={openMenuId === s._id ? menuRef : null}>
                                        <button
                                            onClick={(e) => toggleMenu(s._id, e)}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <MoreVertical size={18} className="text-gray-500" />
                                        </button>
                                        {openMenuId === s._id && (
                                            <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                                                <button
                                                    onClick={(e) => handleView(s, e)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    View
                                                </button>
                                                {onEdit && (
                                                    <button
                                                        onClick={(e) => handleUpdate(s, e)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                                    >
                                                        Update
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDeleteClick(s._id, e)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                                                >
                                                    {deleteId === s._id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 text-xs break-all">{s.email || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 text-xs">{s.phone || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-600 text-xs">
                                            {[s.city, s.state, s.country].filter(Boolean).join(", ") || "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                                        <span>Art: {s.artTypeName || "-"}</span>
                                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Modal - Made responsive */}
            {viewItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setViewItem(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp relative" onClick={(e) => e.stopPropagation()}>
                        {/* Header with gradient - stays on top */}
                        <div className="sticky top-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] flex items-center justify-between p-4 z-20">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Eye size={18} className="text-white" />
                                </div>
                                <h2 className="text-base sm:text-lg font-semibold text-white">Submission Details</h2>
                            </div>
                            <button
                                onClick={() => setViewItem(null)}
                                className="p-1.5 rounded-lg hover:bg-white/20 transition-all duration-200 hover:rotate-90"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Details Section */}
                            <div>

                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 space-y-3 border border-gray-100 mt-3">
                                    {/* Profile Image */}
                                    {viewItem.image && (
                                        <div className="flex justify-center -mt-12 mb-2">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full blur-lg opacity-30"></div>
                                                <img
                                                    src={viewItem.image}
                                                    alt={viewItem.name}
                                                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full"></div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Artist Information</p>
                                    </div>
                                    <DetailRow icon={<User size={14} />} label="Name" value={viewItem.name} />
                                    <DetailRow icon={<Mail size={14} />} label="Email" value={viewItem.email} />
                                    <DetailRow icon={<Phone size={14} />} label="Phone" value={viewItem.phone} />
                                    <DetailRow icon={<MapPin size={14} />} label="Location" value={[viewItem.city, viewItem.state, viewItem.country].filter(Boolean).join(", ")} />
                                    <DetailRow icon={<Eye size={14} />} label="Art Type" value={viewItem.artTypeName} />
                                    <DetailRow
                                        icon={<AlertCircle size={14} />}
                                        label="Status"
                                        value={viewItem.status}
                                        isStatus={true}
                                    />
                                </div>
                            </div>

                            {/* Biography Section */}
                            {viewItem.bio && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full"></div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Biography</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                            {viewItem.bio}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white flex justify-end p-4 border-t border-gray-100 z-20">
                            <button
                                onClick={() => setViewItem(null)}
                                className="px-6 py-2.5 text-sm bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ icon, label, value, isStatus = false }: { icon: React.ReactNode; label: string; value: string; isStatus?: boolean }) => {
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
                <span className="text-[#83261D] shrink-0">{icon}</span>
                <span className="text-xs text-gray-500 font-medium">{label}:</span>
            </div>
            {isStatus ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)} sm:ml-0 ml-6`}>
                    {value || "-"}
                </span>
            ) : (
                <span className="text-xs text-gray-800 font-medium break-words sm:ml-0 ml-6">{value || "-"}</span>
            )}
        </div>
    );
};

export default ArtistList;