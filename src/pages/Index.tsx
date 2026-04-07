/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Users,
  Calendar,
  ArrowRight,
  Palette,
  ChevronRight,
  MapPin,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtistCard from "@/components/ArtistCard";
import EventCard from "@/components/EventCard";
import heroBanner from "@/assets/hero-banner.jpg";
import ArtFormCard from "@/components/ArtFormCard";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery, setSearchResults } from "@/store/searchSlice";
import { clearSearch } from "@/store/searchSlice";
import { RootState } from "@/store";
import Fuse from "fuse.js";

const Index = () => {
  const [heroText, setHeroText] = useState("");
  const fullText = "Unearth the Spirit of Indian Art & Artists";
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const searchQuery = useSelector((state: RootState) => state.search.query);
  const isSearching = useSelector(
    (state: RootState) => state.search.isSearching,
  );
  const filteredArtists = useSelector(
    (state: RootState) => state.search.filteredArtists,
  );
  const filteredArtForms = useSelector(
    (state: RootState) => state.search.filteredArtForms,
  );
  const filteredEvents = useSelector(
    (state: RootState) => state.search.filteredEvents,
  );

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setHeroText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const [artistList, setArtistList] = useState<any[]>([]);
  const [artFormList, setArtFormList] = useState<any[]>([]);
  const [eventList, setEventList] = useState<any[]>([]);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/artists`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data;
        setArtistList(data || []);
      })

      .catch((error) => console.error("Error fetching artists:", error));

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((response) => {
        const categories = response.data.data || response.data;

        const artTypes = categories.flatMap((c: any) =>
          (c.artTypes || []).map((type: any) => ({
            ...type,
            categoryName: c.name,
            categoryId: c._id,
            artTypeName: type.name,
          })),
        );

        setArtFormList(artTypes);
      })
      .catch((error) => console.error("Error fetching categories:", error));

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/events`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data;
        setEventList(data || []);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  useEffect(() => {
  const query = searchQuery.trim();

  if (!query) {
    dispatch(setSearchResults({ artists: [], artForms: [], events: [] }));
    return;
  }

  // --- Artists ---
  const artistFuse = new Fuse(artistList, {
    keys: ["name", "artForm", "state", "region", "bio", "city"],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2,
  });
  const artistResults = artistFuse.search(query).map((r) => r.item);

  // --- Art Forms ---
  const artFormFuse = new Fuse(artFormList, {
    keys: ["name", "title", "categoryName", "description"],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2,
  });
  const artFormResults = artFormFuse.search(query).map((r) => r.item);

  // --- Events ---
  const eventFuse = new Fuse(eventList, {
    keys: ["title", "location", "description"],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2,
  });
  const eventResults = eventFuse.search(query).map((r) => r.item);

  dispatch(
    setSearchResults({
      artists: artistResults,
      artForms: artFormResults,
      events: eventResults,
    })
  );
}, [searchQuery, artistList, artFormList, eventList, dispatch]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf8f7] to-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Added pt for navbar spacing */}
      <section className="relative min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[700px] pt-16 sm:pt-20 md:pt-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Indian cultural art"
            className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-[20s]"
          />
          {/* Gradient Overlay - Adjusted for mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#83261D]/90 via-[#83261D]/70 to-transparent" />

          {/* Dotted Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}></div>
        </div>

        {/* Hero Content - Added top padding to account for navbar */}
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center pt-8">
          <div className="max-w-3xl text-white">
            {/* Floating Badge - Responsive */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 animate-fade-in-up">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
              <span className="text-xs sm:text-sm font-medium">
                Discover India's Cultural Heritage
              </span>
            </div>

            {/* Main Title with Typewriter - Fixed positioning */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight animate-fade-in-up animation-delay-200">
              {heroText}
              <span className="inline-block w-0.5 sm:w-1 h-5 sm:h-6 md:h-8 lg:h-10 ml-1 bg-white animate-pulse"></span>
            </h1>

            {/* Description - Responsive */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-2xl leading-relaxed animate-fade-in-up animation-delay-400">
              Celebrating India's rich cultural heritage through the stories of
              master artists, ancient art forms, and vibrant traditions.
            </p>

            {/* CTA Buttons - Properly sized for mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up animation-delay-600">
              <Link to="/artists" className="w-full sm:w-auto">
                <Button className="group bg-white text-[#83261D] hover:bg-yellow-50 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 w-full sm:w-auto">
                  <Users className="mr-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  Explore Artists
                  <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contribute" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-2 border-white/30 bg-transparent text-white hover:bg-white hover:text-[#83261D] px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg rounded-full transition-all duration-300 w-full sm:w-auto">
                  <Sparkles className="mr-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  Contribute
                </Button>
              </Link>
            </div>

            {/* Stats - Responsive grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 mt-6 sm:mt-8 md:mt-12 animate-fade-in-up animation-delay-800">
              {[
                { label: "Artists", value: artistList.length, icon: Users },
                {
                  label: "Art Forms",
                  value: artFormList.length,
                  icon: Palette,
                },
                { label: "Events", value: eventList.length, icon: Calendar },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">
                    {stat.value}+
                  </div>
                  <div className="text-white/80 text-[10px] sm:text-xs md:text-sm flex items-center justify-center gap-0.5 sm:gap-1">
                    <stat.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                    <span className="xs:inline">{stat.label}</span>
                    {/* <span className="xs:hidden">
                      {stat.label.slice(0, 4)}...
                    </span> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-1.5 sm:h-2 bg-white/60 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Search Section - Responsive positioning and padding */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 md:-mt-10 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-[#83261D]/10">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center">
            <div className="flex-1 w-full relative">
              <Search
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                type="text"
                placeholder="Search artists, art forms, events..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="pl-9 sm:pl-12 h-9 sm:h-10 md:h-12 w-full text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 transition-all"
              />
            </div>
            <Button
              onClick={() => dispatch(clearSearch())}
              disabled={!searchQuery}
              className="bg-[#83261D] hover:bg-[#83261D]/90 text-white px-4 sm:px-6 h-9 sm:h-10 md:h-12 rounded-lg sm:rounded-xl disabled:opacity-50 w-full lg:w-auto text-xs sm:text-sm md:text-base">
              {searchQuery ? "Clear" : "Search"}
            </Button>
          </div>
        </div>
      </section>

      {/* Search Results - Responsive grid */}
      {isSearching && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {/* Artists Results */}
              {filteredArtists.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      Artists
                    </h2>
                    <Link
                      to="/artists"
                      className="text-[#83261D] hover:text-[#83261D]/80 flex items-center gap-1 text-xs sm:text-sm font-medium">
                      View All <ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {filteredArtists.slice(0, 4).map((artist: any) => (
                      <ArtistCard
                        key={artist._id || artist.id}
                        {...artist}
                        image={getImageUrl(artist.image || artist.artistImage)}
                        region={artist.state || artist.region}
                        onClick={() => navigate(`/artists/${artist._id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Art Forms Results */}
              {filteredArtForms.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      Art Forms
                    </h2>
                    <Link
                      to="/art-forms"
                      className="text-[#83261D] hover:text-[#83261D]/80 flex items-center gap-1 text-xs sm:text-sm font-medium">
                      View All <ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {filteredArtForms.slice(0, 4).map((item: any) => (
                      <ArtFormCard
                        key={item._id || item.id}
                        title={item.title}
                        category={item.category}
                        artTypeName={item.artTypeName}
                        description={item.description}
                        image={getImageUrl(item.image || item.artFormImage)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Events Results */}
              {filteredEvents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      Events
                    </h2>
                    <Link
                      to="/events"
                      className="text-[#83261D] hover:text-[#83261D]/80 flex items-center gap-1 text-xs sm:text-sm font-medium">
                      View All <ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {filteredEvents.slice(0, 4).map((event: any) => (
                      <EventCard
                        key={event._id}
                        {...event}
                        date={formatDate(event.date)}
                        image={getImageUrl(event.image || event.eventImage)}
                        onClick={() => navigate(`/events/${event._id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredArtists.length === 0 &&
                filteredArtForms.length === 0 &&
                filteredEvents.length === 0 && (
                  <div className="text-center py-8 sm:py-10 md:py-12">
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 opacity-30">
                      🎭
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-1 sm:mb-2">
                      No results found
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-500">
                      Try different keywords or browse our categories
                    </p>
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      {/* Regular Sections - When not searching */}
      {!isSearching && (
        <>
          {/* Featured Artists Section */}
          <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gradient-to-b from-white to-[#fdf8f7]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-12">
                <span className="text-[#83261D] font-semibold text-xs sm:text-sm md:text-base lg:text-xl tracking-wider uppercase mb-1 sm:mb-2 md:mb-4 block">
                  Master Artists
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-4">
                  Featured Artists
                </h2>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 px-4">
                  Discover the stories and craftsmanship of India's most
                  talented artists
                </p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {artistList.slice(0, 4).map((artist) => (
                  <ArtistCard
                    key={artist._id || artist.id}
                    {...artist}
                    image={getImageUrl(artist.image || artist.artistImage)}
                    region={artist.state || artist.region}
                    onClick={() => navigate(`/artists/${artist._id}`)}
                  />
                ))}
              </div>

              <div className="text-center mt-4 sm:mt-6 md:mt-8 lg:mt-12">
                <Link to="/artists">
                  <Button className="bg-white text-[#83261D] border-2 border-[#83261D] hover:bg-[#83261D] hover:text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full text-xs sm:text-sm md:text-base lg:text-lg group transition-all duration-300">
                    View All Artists
                    <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Art Forms Section */}
          <section className="py-8 sm:py-10 md:py-12 lg:py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#83261D]/5">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, #83261D 1px, transparent 0)",
                  backgroundSize: "30px 30px",
                }}></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-12">
                <span className="text-[#83261D] font-semibold text-xs sm:text-sm md:text-base lg:text-xl tracking-wider uppercase mb-1 sm:mb-2 md:mb-4 block">
                  Artistic Heritage
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-4">
                  Explore Art Forms
                </h2>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 px-4">
                  From classical dances to traditional crafts, discover India's
                  diverse artistic expressions
                </p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {artFormList.slice(0, 4).map((item) => (
                  <ArtFormCard
                    key={item._id || item.id}
                    title={item.name}
                    category={item.categoryName}
                    artTypeName={item.artTypeName}
                    description={item.description}
                    image={getImageUrl(item.image || item.artFormImage)}
                  />
                ))}
              </div>

              <div className="text-center mt-4 sm:mt-6 md:mt-8 lg:mt-12">
                <Link to="/art-forms">
                  <Button className="bg-white text-[#83261D] border-2 border-[#83261D] hover:bg-[#83261D] hover:text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full text-xs sm:text-sm md:text-base lg:text-lg group transition-all duration-300">
                    View All Art Forms
                    <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Upcoming Events Section */}
          <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gradient-to-b from-white to-[#fdf8f7]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-12">
                <span className="text-[#83261D] font-semibold text-xs sm:text-sm md:text-base lg:text-xl tracking-wider uppercase mb-1 sm:mb-2 md:mb-4 block">
                  Don't Miss Out
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-4">
                  Upcoming Events
                </h2>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 px-4">
                  Join us in celebrating Indian art and culture through these
                  exciting events
                </p>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {eventList.slice(0, 4).map((event) => (
                  <EventCard
                    key={event._id}
                    {...event}
                    date={formatDate(event.date)}
                    image={getImageUrl(event.image || event.eventImage)}
                    onClick={() => navigate(`/events/${event._id}`)}
                  />
                ))}
              </div>

              <div className="text-center mt-4 sm:mt-6 md:mt-8 lg:mt-12">
                <Link to="/events">
                  <Button className="bg-white text-[#83261D] border-2 border-[#83261D] hover:bg-[#83261D] hover:text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full text-xs sm:text-sm md:text-base lg:text-lg group transition-all duration-300">
                    <Calendar className="mr-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    View All Events
                    <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-8 sm:py-10 md:py-12 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
                <div className="absolute inset-0">
                  <img
                    src={heroBanner}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#83261D]/80 mix-blend-multiply"></div>
                </div>

                <div className="relative py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 text-center">
                  <div className="max-w-3xl mx-auto">
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-yellow-300 mx-auto mb-3 sm:mb-4 md:mb-6" />
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 px-4">
                      Join the Unearthify Community
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base lg:text-xl text-white/90 mb-4 sm:mb-6 md:mb-8 lg:mb-10 leading-relaxed px-4">
                      Help us preserve and celebrate India's artistic heritage.
                      Contribute information about artists, art forms, and
                      events.
                    </p>
                    <Link to="/contribute">
                      <Button className="bg-white text-[#83261D] hover:bg-yellow-50 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 text-xs sm:text-sm md:text-base lg:text-lg rounded-full shadow-2xl group transition-all duration-300">
                        <Sparkles className="mr-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        Start Contributing Today
                        <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Index;
