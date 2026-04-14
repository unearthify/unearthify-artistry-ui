/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Calendar, // Add this
  CalendarPlus, // Add this
  MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddArtist from "./AddArtist";
import ArtistList from "./ArtistList";
import { toast } from "react-hot-toast";
import EventList from "./EventList";
import AddEvent from "./AddEvent";
import ContactedUsers from "./ContactedUsers";

const ArtistDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePage, setActivePage] = useState<
    "artist-list" | "add-artist" | "event-list" | "add-event" | "contacted-users"
  >("artist-list");
  const navigate = useNavigate();
  const [editArtist, setEditArtist] = useState<any>(null);
  const [editEvent, setEditEvent] = useState<any>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/artist-login");
  };

  const menuItems = [
    {
      id: "artist-list",
      label: "Artist List",
      icon: Users,
      onClick: () => {
        setEditArtist(null);
        setActivePage("artist-list");
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: "add-artist",
      label: "Add Artist",
      icon: UserPlus,
      onClick: () => {
        setEditArtist(null);
        setActivePage("add-artist");
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: "event-list",
      label: "Event List",
      icon: Calendar,
      onClick: () => {
        setActivePage("event-list");
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: "add-event",
      label: "Add Event",
      icon: CalendarPlus,
      onClick: () => {
        setActivePage("add-event");
        if (isMobile) setSidebarOpen(false);
      }
    },
    {
      id: "contacted-users",
      label: "Contacted Users",
      icon: MessageCircle,
      onClick: () => {
        setActivePage("contacted-users");
        if (isMobile) setSidebarOpen(false);
      }
    },
  ];

  const pageConfig = {
    "artist-list": {
      title: "Artist Directory",
      subtitle: "View, edit, and organize your own artist profiles",
    },
    "add-artist": {
      title: "Create Artist Profile",
      subtitle: "Create your artist profile with complete details and portfolio",
    },
    "event-list": {
      title: "Event Dashboard",
      subtitle: "Track, manage, and update your events",
    },
    "add-event": {
      title: "Create New Event",
      subtitle: "Create and publish your own event for artists",
    },
    "contacted-users": {
      title: "Contacted Users",
      subtitle: "Users who have reached out to you",
    },
  };

  const currentPage = pageConfig[activePage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} className="text-gray-600" /> : <Menu size={24} className="text-gray-600" />}
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          Unearthify
        </h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#83261D] to-[#6a1f17] shadow-xl z-50 transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isMobile ? "w-72" : "w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 sm:p-6 border-b border-white/10">
            {(() => {
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              const name = user?.name || user?.email || "A";
              const email = user?.email || "";
              const initial = name.charAt(0).toUpperCase();

              const getProfileImage = () => {
                const buffer = user?.profileImage?.data;
                if (!buffer) return null;
                const base64 = btoa(
                  new Uint8Array(buffer).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ""
                  )
                );
                return `data:${user.mimetype};base64,${base64}`;
              };

              const imageUrl = getProfileImage();

              return (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/30 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg bg-white/20 w-full h-full flex items-center justify-center">
                        {initial}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-white font-bold text-sm truncate">{name}</h2>
                    <p className="text-white/60 text-xs truncate">{email}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 sm:py-6 overflow-y-auto">
            <div className="px-3 sm:px-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-lg transition-all duration-200 group
                      ${isActive
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <ChevronRight size={16} className="flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 group"
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium flex-1 text-left">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 min-h-screen
        ${!isMobile && 'lg:ml-64'}
      `}>
        <div className="pt-16 lg:pt-0">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                    {currentPage?.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {currentPage?.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {activePage === "artist-list" && (
                <ArtistList
                  onEdit={(item: any) => {
                    setEditArtist(item);
                    setActivePage("add-artist");
                    if (isMobile) setSidebarOpen(false);
                  }}
                />
              )}
              {activePage === "add-artist" && (
                <AddArtist
                  editData={editArtist}
                  onSuccess={() => {
                    setActivePage("artist-list");
                    setEditArtist(null);
                    toast.success(editArtist ? "Artist updated successfully" : "Artist added successfully");
                  }}
                />
              )}
              {activePage === "event-list" && (
                <EventList
                  onEdit={(item: any) => {
                    setEditEvent(item);
                    setActivePage("add-event");
                    if (isMobile) setSidebarOpen(false);
                  }}
                />
              )}
              {activePage === "add-event" && (
                <AddEvent
                  editData={editEvent}
                  onSuccess={() => {
                    setActivePage("event-list");
                    setEditEvent(null);
                    toast.success(editEvent ? "Event updated successfully" : "Event added successfully");
                  }}
                />
              )}
              {activePage === "contacted-users" && <ContactedUsers />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArtistDashboard;