"use client";

import { ArrowLeft, Clock, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const ANIMAL_THEMES: Record<string, { theme: string; border: string; badge: string; emoji: string }> = {
  dog:    { theme: "from-cyan-500/10 to-blue-600/10",       border: "border-cyan-500/20",     badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",       emoji: "🐕" },
  cat:    { theme: "from-fuchsia-500/10 to-purple-600/10",   border: "border-fuchsia-500/20",  badge: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30", emoji: "🐈" },
  cow:    { theme: "from-amber-400/10 to-orange-600/10",     border: "border-amber-500/20",    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",     emoji: "🐄" },
  bird:   { theme: "from-emerald-400/10 to-teal-600/10",     border: "border-emerald-500/20",  badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", emoji: "🐦" },
  horse:  { theme: "from-violet-500/10 to-indigo-600/10",   border: "border-violet-500/20",   badge: "bg-violet-500/20 text-violet-400 border-violet-500/30",   emoji: "🐎" },
  parrot: { theme: "from-rose-500/10 to-red-600/10",       border: "border-rose-500/20",     badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",       emoji: "🦜" },
};

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/translations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.translations) {
        setHistory(data.translations);
      }
    } catch (err) {
      console.error("Error fetching translation history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [router]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/translations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete translation", err);
    }
  };

  const filteredHistory = history.filter((item) => {
    const petName = item.petId?.name || "";
    const breed = item.petId?.breed || "";
    const query = searchQuery.toLowerCase();
    return (
      item.animal.toLowerCase().includes(query) ||
      item.emotion.toLowerCase().includes(query) ||
      item.message.toLowerCase().includes(query) ||
      petName.toLowerCase().includes(query) ||
      breed.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      {/* Background glowing effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" />
            Translation History
          </h1>
        </div>
      </nav>

      <main className="relative z-10 flex-grow flex flex-col px-4 sm:px-6 pb-10 max-w-2xl mx-auto w-full">
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search translations by pet name, emotion, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, index) => {
              const themeInfo = ANIMAL_THEMES[item.animal] || ANIMAL_THEMES["dog"];
              const hasPet = !!item.petId;
              const displayName = hasPet ? item.petId.name : item.animal.charAt(0).toUpperCase() + item.animal.slice(1);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item._id}
                  className={`relative overflow-hidden rounded-2xl border ${themeInfo.border} bg-gradient-to-br ${themeInfo.theme} backdrop-blur-sm p-5 sm:p-6 group`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                        {hasPet && item.petId.photo ? (
                          <Image 
                            src={item.petId.photo} 
                            alt={displayName} 
                            width={48}
                            height={48}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span>{themeInfo.emoji}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-1.5">
                          {displayName}
                          {hasPet && (
                            <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full capitalize font-medium">
                              {item.petId.breed || item.animal}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete translation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${themeInfo.badge}`}>
                    {item.emotion}
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed">
                    &quot;{item.message}&quot;
                  </p>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400">No translations found</h3>
              <p className="text-sm text-gray-600 mt-2">Try adjusting your search or translate something new!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
