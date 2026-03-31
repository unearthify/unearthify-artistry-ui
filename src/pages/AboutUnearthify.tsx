import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    ArrowLeft,
    Sparkles,
    ChevronRight,
    Heart,
    Globe,
    BookOpen,
    Users,
    Star,
    Target,
} from "lucide-react";

export default function AboutUnearthify() {
    const navigate = useNavigate();

    const missionPoints = [
        {
            icon: Globe,
            text: "Creating platforms that give artists visibility, voice, and access to opportunities",
        },
        {
            icon: Users,
            text: "Connecting artists with wider audiences, patrons, and collaborators across the world",
        },
        {
            icon: BookOpen,
            text: "Building a comprehensive and accessible knowledge hub on Indian art forms and artists",
        },
        {
            icon: Heart,
            text: "Fostering sustainable support systems that enable artists to continue their craft with dignity and livelihood",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white">
            <Navbar />

            {/* ================= HERO SECTION ================= */}
            <section className="relative bg-gradient-to-br from-[#83261D] via-[#9a2f24] to-[#b84c3f] py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 pointer-events-none hidden sm:block">
                    {["🎨", "🪔", "✨"].map((emoji, i) => (
                        <div
                            key={i}
                            className="absolute text-white/5 text-5xl md:text-7xl"
                            style={{
                                top: `${[20, 60, 40][i]}%`,
                                left: `${[75, 85, 90][i]}%`,
                                transform: `rotate(${[15, -20, 10][i]}deg)`,
                            }}>
                            {emoji}
                        </div>
                    ))}
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
                    <div className="max-w-3xl">
                        {/* Badge - Responsive */}
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 mb-3 sm:mb-4 md:mb-6">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
                            <span className="text-white/90 text-xs sm:text-sm font-medium">
                                Not-for-Profit Initiative
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                            About Unearthify
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
                            Dedicated to preserving and promoting Indian art — spanning endangered traditional and tribal art forms as well as evolving contemporary expressions.
                        </p>
                    </div>
                </div>

                {/* Curved bottom edge */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 60"
                        className="w-full h-auto"
                        preserveAspectRatio="none">
                        <path
                            fill="#ffffff"
                            d="M0,0 C480,40 960,40 1440,0 L1440,60 L0,60 Z"
                        />
                    </svg>
                </div>
            </section>

            {/* ================= MAIN CONTENT ================= */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

                    {/* About Section */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <Heart size={20} className="text-[#83261D]" />
                            Who We Are
                        </h2>
                        <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                            <p>
                                Unearthify is a not-for-profit initiative dedicated to preserving and promoting Indian art, spanning endangered traditional and tribal art forms as well as evolving contemporary expressions, and celebrating thousands of years of history.
                            </p>
                            <p>
                                Across India, many traditional and tribal art forms are on the brink of disappearing due to declining awareness, limited patronage, and a lack of sustainable opportunities for the artists who sustain them. Unearthify is committed to preventing this by giving these artists a voice, creating meaningful visibility, and providing platforms that connect them with wider audiences and opportunities, both within India and globally.
                            </p>
                            <p>
                                At the same time, Unearthify embraces contemporary art forms as a vital part of India's current cultural narrative by documenting, showcasing, and supporting modern artistic voices that reflect the country's dynamic and evolving identity. By bringing traditional heritage and contemporary creativity onto a single platform, Unearthify aims to create a holistic ecosystem where Indian art, in all its forms, is recognized and valued.
                            </p>
                            <p>
                                In addition, Unearthify serves as a comprehensive and accessible knowledge hub, offering curated, reliable information on Indian art forms and artists in one place. It is designed to be a go-to resource for enthusiasts, researchers, and institutions seeking to explore India's rich and diverse artistic landscape.
                            </p>
                            <p>
                                At its core, Unearthify is a tribute to the artists, past and present, who dedicate their lives to the pursuit of art. It is a collective call to preserve heritage, empower creators, and ensure that India's artistic legacy continues to thrive and inspire across generations and geographies.
                            </p>
                        </div>
                    </div>

                    {/* Vision & Mission side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Vision */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                                <Star size={20} className="text-[#83261D]" />
                                Vision
                            </h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                To ensure that India's various art forms thrive with recognition, relevance, and respect, empowering artists and bringing India's rich artistic heritage to a global audience.
                            </p>
                        </div>

                        {/* Mission */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                                <Target size={20} className="text-[#83261D]" />
                                Mission
                            </h2>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                To preserve and revitalize endangered traditional and tribal art forms while actively promoting contemporary Indian art.
                            </p>
                        </div>
                    </div>

                    {/* Mission Points */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-1.5 sm:gap-2">
                            <Sparkles size={20} className="text-[#83261D]" />
                            What We Do
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {missionPoints.map((point, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-amber-50/50 rounded-lg sm:rounded-xl border border-amber-100">
                                    <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-[#83261D]/10 rounded-full flex items-center justify-center">
                                        <point.icon size={16} className="text-[#83261D]" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                        {point.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 pb-4">
                        <button
                            onClick={() => navigate("/art-forms")}
                            className="inline-flex items-center justify-center gap-2 bg-[#83261D] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base hover:bg-[#6e1f17] transition-all hover:scale-105 shadow-md">
                            <BookOpen size={16} />
                            Explore Art Forms
                        </button>
                        <button
                            onClick={() => navigate("/artists")}
                            className="inline-flex items-center justify-center gap-2 bg-white text-[#83261D] border border-[#83261D] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base hover:bg-[#83261D]/5 transition-all hover:scale-105">
                            <Users size={16} />
                            Meet the Artists
                        </button>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}
