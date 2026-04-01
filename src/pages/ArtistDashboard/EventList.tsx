/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { MoreVertical, X, Calendar, MapPin, Tag, FileText, Bell, Calendar as CalendarIcon, Repeat, Clock } from "lucide-react";

const getReminderKey = (id: string) => `reminder_sent_at_${id}`;

const canSendReminder = (submission: any): boolean => {
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

const getTimeLeftLabel = (submission: any): string | null => {
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

const EventList = ({ onEdit }: any) => {
  const [events, setEvents] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [reminderSending, setReminderSending] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/event-submissions/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(res.data);
      setEvents(res.data.data || []);
    } catch {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // close menu outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".event-menu")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSendReminder = async (event: any) => {
    try {
      setReminderSending(event._id);

      await axios.post(
        `${API_BASE_URL}/api/event-submissions/${event._id}/remind`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      localStorage.setItem(getReminderKey(event._id), Date.now().toString());

      toast.success("Reminder sent to admin");
      forceUpdate(n => n + 1);
    } catch {
      toast.error("Failed to send reminder");
    } finally {
      setReminderSending(null);
    }
  };

  const ReminderButton = ({ event }: { event: any }) => {
    const eligible = canSendReminder(event);
    const isSending = reminderSending === event._id;
    const isPending = event.status === "pending";
    const timeLeft = getTimeLeftLabel(event);

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
        onClick={() => handleSendReminder(event)}
        disabled={isSending}
        title="Send reminder to admin"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50">
        <Bell size={12} className={isSending ? "animate-pulse" : ""} />
        <span className="hidden sm:inline">{isSending ? "..." : "Remind"}</span>
      </button>
    );
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id);
      await axios.delete(`${API_BASE_URL}/api/event-submissions/${id}/permanent`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      localStorage.removeItem(getReminderKey(id));
      toast.success("Event Deleted");
      await fetchEvents();
      setOpenMenu(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteId(null);
    }
  };

  const getRecurrenceColor = (recurrence: string) => {
    switch (recurrence) {
      case 'daily': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'weekly': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'monthly': return 'bg-green-100 text-green-700 border-green-200';
      case 'yearly': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#83261D] mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading events...</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && events.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-lg">No events found</p>
          <p className="text-sm text-gray-400 mt-2">Create your first event to get started</p>
        </div>
      )}

      {/* List - Responsive Grid/Card Layout */}
      {!loading && events.length > 0 && (
        <div className="divide-y divide-gray-100">
          {events.map((e, index) => (
            <div
              key={e._id}
              className="group relative overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Image Section */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <img
                        src={e.image}
                        alt={e.title}
                        className="w-full lg:w-32 h-56 lg:h-32 rounded-2xl object-cover shadow-md group-hover:shadow-xl transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Menu Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg sm:text-xl mb-2 group-hover:text-[#83261D] transition-colors duration-300">
                          {e.title}
                        </h3>
                      </div>

                      {/* Actions - Three dot button */}
                      <div className="relative event-menu flex-shrink-0">
                        <button
                          onClick={() => setOpenMenu(openMenu === e._id ? null : e._id)}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group-hover:bg-gray-100"
                        >
                          <MoreVertical size={18} className="text-gray-400 group-hover:text-gray-600" />
                        </button>

                        {openMenu === e._id && (
                          <div className="absolute right-0 top-12 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 animate-fadeIn">
                            <button
                              onClick={() => {
                                setViewItem(e);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                onEdit(e);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                            >
                              Update Event
                            </button>
                            <button
                              onClick={() => handleDelete(e._id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors"
                            >
                              {deleteId === e._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3">

                      {/* Location */}
                      <div className="flex items-center gap-2 bg-amber-50/60 rounded-xl px-3 py-2 hover:bg-amber-100/60 transition-colors">
                        <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                          <MapPin size={13} className="text-[#83261D]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Location</span>
                          <span className="text-xs font-medium text-gray-600 truncate">{e.location}</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 bg-sky-50/60 rounded-xl px-3 py-2 hover:bg-sky-100/60 transition-colors">
                        <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                          <CalendarIcon size={13} className="text-sky-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Event Date</span>
                          <span className="text-xs font-medium text-gray-600">{formatDate(e.date)}</span>
                        </div>
                      </div>

                    </div>

                    {/* Divider */}
                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    {/* Footer: Category + Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Category</span>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#83261D] bg-[#83261D]/10 px-3 py-1 rounded-full">
                          {e.categories}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {e.recurrence && e.recurrence !== "none" && (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 px-1">Recurrence</span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getRecurrenceColor(e.recurrence)}`}>
                              <Repeat size={12} />
                              {e.recurrence.charAt(0).toUpperCase() + e.recurrence.slice(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Status</span>
                        {e.status === "approved" && (
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Approved
                          </span>
                        )}
                        {e.status === "pending" && (
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {e.status === "rejected" && (
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-700 bg-red-50 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Rejected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">Reminder</span>
                        <ReminderButton event={e} />
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    {/* Description Preview */}
                    {e.description && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 px-1">Description</span>
                        <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                          {e.description}
                        </p>
                      </div>

                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODAL - Premium Popup */}
      {viewItem && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="sticky top-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] flex items-center justify-between p-5 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Event Details</h2>
                  <p className="text-xs text-white/70 mt-0.5">Complete information</p>
                </div>
              </div>
              <button
                onClick={() => setViewItem(null)}
                className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200 hover:rotate-90"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Event Image with overlay */}
              {viewItem.image && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <img
                    src={viewItem.image}
                    alt={viewItem.title}
                    className="w-full h-72 object-cover rounded-2xl shadow-lg relative z-10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl z-20"></div>
                </div>
              )}

              {/* Event Title with badge */}
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">{viewItem.title}</h3>
                {viewItem.recurrence && viewItem.recurrence !== "none" && (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${getRecurrenceColor(viewItem.recurrence)}`}>
                    <Repeat size={14} />
                    {viewItem.recurrence.charAt(0).toUpperCase() + viewItem.recurrence.slice(1)} Event
                  </span>
                )}
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <MapPin size={18} className="text-[#83261D]" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</p>
                  </div>
                  <p className="text-base text-gray-800 font-medium">{viewItem.location}</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <CalendarIcon size={18} className="text-[#83261D]" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</p>
                  </div>
                  <p className="text-base text-gray-800 font-medium">
                    {new Date(viewItem.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Category + Status Row */}
              {viewItem.categories && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Category */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Tag size={18} className="text-[#83261D]" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</p>
                    </div>
                    <span className="inline-flex px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 rounded-xl text-sm font-medium">
                      {viewItem.categories}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${viewItem.status === "approved" ? "bg-emerald-100" :
                        viewItem.status === "pending" ? "bg-amber-100" : "bg-red-100"
                        }`}>
                        <Clock size={18} className={
                          viewItem.status === "approved" ? "text-emerald-600" :
                            viewItem.status === "pending" ? "text-amber-600" : "text-red-600"
                        } />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                    </div>

                    {viewItem.status === "approved" && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Approved
                      </span>
                    )}
                    {viewItem.status === "pending" && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        Pending
                      </span>
                    )}
                    {viewItem.status === "rejected" && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Rejected
                      </span>
                    )}
                  </div>

                </div>
              )}

              {/* Description Section */}
              {viewItem.description && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText size={18} className="text-[#83261D]" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</p>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {viewItem.description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer with close button */}
            <div className="sticky bottom-0 bg-white flex justify-end p-5 border-t border-gray-100">
              <button
                onClick={() => setViewItem(null)}
                className="px-8 py-3 text-sm bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
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

export default EventList;