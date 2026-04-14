/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { MoreVertical, X, User, Phone, Mail, Palette, MessageSquare, Eye } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const getMyContactRequestsApi = () => {
  const token = localStorage.getItem("token");
  return axios.get(`${BASE_URL}/api/contact-requests/my-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const deleteContactRequestApi = (id: string) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${BASE_URL}/api/contact-artists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const ContactedUsers = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewContact, setViewContact] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [artTypeFilter, setArtTypeFilter] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase());
    const matchesArtType = !artTypeFilter || c.artTypeName === artTypeFilter;
    return matchesSearch && matchesArtType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, artTypeFilter]);
  useEffect(() => { fetchContacts(); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await getMyContactRequestsApi();
      setContacts(res.data.data || res.data);
    } catch (err) {
      console.error("Error fetching contacts", err);
      toast.error("Failed to load contact requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      await deleteContactRequestApi(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      toast.success("Contact request deleted");
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete contact request");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleView = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewContact(item);
    setOpenMenuId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83261D] mx-auto mb-4" />
          <p className="text-gray-500">Loading contact requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone..."
          className="w-full sm:w-72 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#83261D] outline-none"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse min-w-[700px]">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">User Name</th>
              <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Email</th>
              <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Phone</th>
              <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Art Type</th>
              <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Artist Name</th>
              <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Date</th>
              <th className="p-3 sm:p-4 text-left text-xs font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  {contacts.length === 0 ? "No contact requests yet" : "No results match your search"}
                </td>
              </tr>
            ) : (
              currentContacts.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50 transition-colors">
                  {/* User avatar + name */}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-800">{c.name || "-"}</span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{c.email || "-"}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{c.phone || "-"}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{c.artTypeName || "-"}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">{c.artistName || "-"}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="relative" ref={openMenuId === c._id ? menuRef : null}>
                      <button
                        onClick={(e) => toggleMenu(c._id, e)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                      {openMenuId === c._id && (
                        <div
                          className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleView(c, e)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => handleDelete(c._id, e)}
                            disabled={deletingId === c._id}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-gray-50"
                          >
                            {deletingId === c._id ? "Deleting..." : "Delete"}
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
        {currentContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {contacts.length === 0 ? "No contact requests yet" : "No results match your search"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentContacts.map((c) => (
              <div key={c._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {c.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">{c.name || "-"}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{c.artTypeName || "-"}</p>
                    </div>
                  </div>
                  <div className="relative" ref={openMenuId === c._id ? menuRef : null}>
                    <button
                      onClick={(e) => toggleMenu(c._id, e)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                    {openMenuId === c._id && (
                      <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                        <button
                          onClick={(e) => handleView(c, e)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => handleDelete(c._id, e)}
                          disabled={deletingId === c._id}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          {deletingId === c._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 text-xs break-all">{c.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 text-xs">{c.phone || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                    <span>Artist: {c.artistName || "-"}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === i + 1 ? "bg-[#83261D] text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* View Modal */}
      {viewContact && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewContact(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] flex items-center justify-between p-4 z-20 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Eye size={18} className="text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-white">Contact Request Details</h2>
              </div>
              <button
                onClick={() => setViewContact(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* User Info */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 space-y-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User Info</p>
                </div>
                {/* Avatar */}
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {viewContact.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
                <DetailRow icon={<User size={14} />} label="Name" value={viewContact.name} />
                <DetailRow icon={<Phone size={14} />} label="Phone" value={viewContact.phone} />
                <DetailRow icon={<Mail size={14} />} label="Email" value={viewContact.email} />
              </div>

              {/* Art Info */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 space-y-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Art Info</p>
                </div>
                <DetailRow icon={<Palette size={14} />} label="Artist" value={viewContact.artistName} />
                <DetailRow icon={<Palette size={14} />} label="Art Type" value={viewContact.artTypeName} />
              </div>

              {/* Message */}
              {viewContact.message && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#83261D] to-[#B45F4A] rounded-full" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 flex gap-2">
                    <MessageSquare size={14} className="text-[#83261D] mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{viewContact.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white flex justify-end p-4 border-t border-gray-100 rounded-b-2xl">
              <button
                onClick={() => setViewContact(null)}
                className="px-6 py-2.5 text-sm bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg font-medium hover:shadow-lg transition-all"
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

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
    <div className="flex items-center gap-2">
      <span className="text-[#83261D] shrink-0">{icon}</span>
      <span className="text-xs text-gray-500 font-medium">{label}:</span>
    </div>
    <span className="text-xs text-gray-800 font-medium break-words sm:ml-0 ml-6">{value || "-"}</span>
  </div>
);

export default ContactedUsers;