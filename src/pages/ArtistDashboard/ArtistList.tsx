/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { MoreVertical, X, User, Mail, Phone, MapPin, Eye, CheckCircle, XCircle, AlertCircle, Bell } from "lucide-react";
import { toast } from "react-hot-toast";
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

const getReminderKey = (id: string) => `reminder_sent_at_${id}`;

const canSendReminder = (submission: Submission): boolean => {
    if (submission.status !== "pending") return false;

    const now = Date.now();
    const createdAt = new Date(submission.createdAt).getTime();
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation < 24) return false;

    const lastSent = localStorage.getItem(getReminderKey(submission._id));
    if (lastSent) {
        const hoursSinceReminder = (now - parseInt(lastSent)) / (1000 * 60 * 60);
        if (hoursSinceReminder < 24) return false;
    }

    return true;
};

const getTimeLeftLabel = (submission: Submission): string | null => {
    if (submission.status !== "pending") return null;

    const now = Date.now();
    const createdAt = new Date(submission.createdAt).getTime();
    const lastSent = localStorage.getItem(getReminderKey(submission._id));
    const referenceTime = lastSent ? parseInt(lastSent) : createdAt;
    const msLeft = referenceTime + 24 * 60 * 60 * 1000 - now;

    if (msLeft <= 0) return null;

    const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));
    return `${hoursLeft}h`;
};

const ArtistList = ({ refreshTrigger, onEdit }: ArtistListProps) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [viewItem, setViewItem] = useState<Submission | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [reminderSending, setReminderSending] = useState<string | null>(null);
    const [, forceUpdate] = useState(0);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/artist-submissions/my`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            setSubmissions(res.data.data || []);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load your submissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubmissions(); }, [refreshTrigger]);

    // Re-check reminder eligibility every minute
    useEffect(() => {
        const interval = setInterval(() => forceUpdate((n) => n + 1), 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            if (openMenuId && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("click", handleDocumentClick);
        return () => document.removeEventListener("click", handleDocumentClick);
    }, [openMenuId]);

    const handleSendReminder = async (submission: Submission) => {
        try {
            setReminderSending(submission._id);
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/artist-submissions/${submission._id}/remind`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            localStorage.setItem(getReminderKey(submission._id), Date.now().toString());
            toast.success("Reminder sent to admin");
            forceUpdate((n) => n + 1);
        } catch {
            toast.error("Failed to send reminder");
        } finally {
            setReminderSending(null);
        }
    };

    const ReminderButton = ({ submission }: { submission: Submission }) => {
        const eligible = canSendReminder(submission);
        const isSending = reminderSending === submission._id;
        const isPending = submission.status === "pending";
        const timeLeft = getTimeLeftLabel(submission);

        if (!isPending) {
            return (
                <button disabled
                    title="Only available for pending submissions"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-400 cursor-not-allowed">
                    <Bell size={12} />
                    <span className="hidden sm:inline">Remind</span>
                </button>
            );
        }

        if (!eligible) {
            return (
                <button disabled
                    title={timeLeft ? `Available in ${timeLeft}` : "Available after 24hrs from submission"}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-400 cursor-not-allowed">
                    <Bell size={12} />
                    <span className="hidden sm:inline">{timeLeft ?? "24h"}</span>
                </button>
            );
        }

        return (
            <button
                onClick={() => handleSendReminder(submission)}
                disabled={isSending}
                title="Send reminder to admin"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50">
                <Bell size={12} className={isSending ? "animate-pulse" : ""} />
                <span className="hidden sm:inline">{isSending ? "..." : "Remind"}</span>
            </button>
        );
    };

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
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            localStorage.removeItem(getReminderKey(id));
            toast.success("Deleted successfully");
            await fetchSubmissions();
            setOpenMenuId(null);
        } catch {
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
        if (onEdit) onEdit({ ...item, _source: "submission" });
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
            {/* Desktop Table */}
            <div className="hidden md:block">
                <table className="w-full border-collapse min-w-[900px]">
                    <thead className="bg-gray-50">
                        <tr className="border-b">
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Artist</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Email</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Phone</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Location</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Art Type</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Submitted</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Status</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Reminder</th>
                            <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-gray-500">
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
                                        <ReminderButton submission={s} />
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="relative" ref={openMenuId === s._id ? menuRef : null}>
                                            <button
                                                onClick={(e) => toggleMenu(s._id, e)}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                                <MoreVertical size={16} className="text-gray-500" />
                                            </button>
                                            {openMenuId === s._id && (
                                                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32"
                                                    onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={(e) => handleView(s, e)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">
                                                        View
                                                    </button>
                                                    {onEdit && (
                                                        <button onClick={(e) => handleUpdate(s, e)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50">
                                                            Update
                                                        </button>
                                                    )}
                                                    <button onClick={(e) => handleDeleteClick(s._id, e)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-gray-50">
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

            {/* Mobile Card View */}
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
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <StatusBadge status={s.status} />
                                                <ReminderButton submission={s} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative" ref={openMenuId === s._id ? menuRef : null}>
                                        <button onClick={(e) => toggleMenu(s._id, e)}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                            <MoreVertical size={18} className="text-gray-500" />
                                        </button>
                                        {openMenuId === s._id && (
                                            <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                                                <button onClick={(e) => handleView(s, e)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    View
                                                </button>
                                                {onEdit && (
                                                    <button onClick={(e) => handleUpdate(s, e)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                                                        Update
                                                    </button>
                                                )}
                                                <button onClick={(e) => handleDeleteClick(s._id, e)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50">
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

            {/* View Modal */}
            {viewItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setViewItem(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] flex items-center justify-between p-4 z-20">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Eye size={18} className="text-white" />
                                </div>
                                <h2 className="text-base sm:text-lg font-semibold text-white">Submission Details</h2>
                            </div>
                            <button onClick={() => setViewItem(null)}
                                className="p-1.5 rounded-lg hover:bg-white/20 transition-all">
                                <X size={20} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 space-y-3 border border-gray-100">
                                {viewItem.image && (
                                    <div className="flex justify-center mb-4">
                                        <img src={viewItem.image} alt={viewItem.name}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full"></div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Artist Information</p>
                                </div>
                                <DetailRow icon={<User size={14} />} label="Name" value={viewItem.name} />
                                <DetailRow icon={<Mail size={14} />} label="Email" value={viewItem.email} />
                                <DetailRow icon={<Phone size={14} />} label="Phone" value={viewItem.phone} />
                                <DetailRow icon={<MapPin size={14} />} label="Location"
                                    value={[viewItem.city, viewItem.state, viewItem.country].filter(Boolean).join(", ")} />
                                <DetailRow icon={<Eye size={14} />} label="Art Type" value={viewItem.artTypeName} />
                                <DetailRow icon={<AlertCircle size={14} />} label="Status" value={viewItem.status} isStatus />
                            </div>

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

                        <div className="sticky bottom-0 bg-white flex justify-end p-4 border-t border-gray-100">
                            <button onClick={() => setViewItem(null)}
                                className="px-6 py-2.5 text-sm bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg font-medium hover:shadow-lg transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ icon, label, value, isStatus = false }: {
    icon: React.ReactNode; label: string; value: string; isStatus?: boolean;
}) => {
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "approved": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "rejected": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
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