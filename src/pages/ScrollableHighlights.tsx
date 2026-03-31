import React, { useEffect, useRef, useState } from "react";

const sectionsData = [
  {
    title: "Complete Agent Lifecycle Hub",
    description:
      "A flexible, modular platform that lets you design, run, monitor and manage agents end-to-end.",
  },
  {
    title: "Ready-Made Blueprints for Rapid Builds",
    description:
      "Unlock pre-built blueprints to reduce development effort by 70% and move from idea to launch in weeks.",
  },
  {
    title: "Total Control of Your Data & IP",
    description:
      "You own your data end-to-end with enterprise-grade privacy, compliance, and governance.",
  },
  {
    title: "Designed for Enterprise Scale & Security",
    description:
      "Built for mission-critical workloads with advanced scalability, reliability, and protection.",
  },
];

export default function ScrollableHighlights() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"));
          setActiveIndex(index);
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((el) => observer.observe(el));

    return () => sectionRefs.current.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="w-full flex gap-16 py-20 px-10 bg-gradient-to-br from-purple-500/30 to-purple-700/50">
      
      {/* LEFT SIDE — Titles that animate */}
      <div className="w-1/3 sticky top-24 h-fit">
        <div className="border-l-4 border-purple-300 pl-5 space-y-10">
          {sectionsData.map((item, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                activeIndex === index
                  ? "opacity-100 translate-x-0"
                  : "opacity-30 translate-x-3"
              }`}
            >
              <h2 className="text-2xl font-bold text-white">{item.title}</h2>
              {activeIndex === index && (
                <p className="text-white/90 mt-2 text-sm">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE — Scroll Sections */}
      <div className="w-2/3 space-y-32">
        {sectionsData.map((item, index) => (
          <div
            key={index}
            data-index={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            className="min-h-[70vh] flex items-center justify-center bg-white/10 rounded-xl p-10 backdrop-blur"
          >
            <h3 className="text-white text-4xl font-semibold text-center">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
