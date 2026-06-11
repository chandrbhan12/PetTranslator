"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Camera, User, Mail, Calendar, LogOut, PawPrint, Sparkles, Check, Plus, Trash2, X, Trash } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const ANIMAL_EMOJIS: Record<string, string> = {
  dog: "🐕", cat: "🐈", cow: "🐄", bird: "🐦", horse: "🐎", parrot: "🦜",
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const petFileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<{ id: string; name: string; email: string; profileImage?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");

  // Pets & translations state
  const [pets, setPets] = useState<any[]>([]);
  const [translationCount, setTranslationCount] = useState(0);
  const [showAddPetModal, setShowAddPetModal] = useState(false);

  // New Pet Form state
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petGender, setPetGender] = useState("Unknown");
  const [petPhoto, setPetPhoto] = useState("");
  const [petUploading, setPetUploading] = useState(false);
  const [petFormError, setPetFormError] = useState("");

  const fetchProfileAndStats = async (token: string) => {
    try {
      // Fetch profile
      const profileRes = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (profileData.user) {
        setUser(profileData.user);
        setNewName(profileData.user.name);
      } else {
        router.push("/login");
        return;
      }

      // Fetch pets
      const petsRes = await fetch("/api/pets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const petsData = await petsRes.json();
      if (petsData.pets) {
        setPets(petsData.pets);
      }

      // Fetch translations (to count them)
      const transRes = await fetch("/api/translations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transData = await transRes.json();
      if (transData.translations) {
        setTranslationCount(transData.translations.length);
      }

    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfileAndStats(token);
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileImage: base64 }),
      });

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      setUploading(false);
      showSaved();
    };
    reader.readAsDataURL(file);
  };

  const handleNameSave = async () => {
    if (!newName.trim() || newName === user?.name) {
      setEditName(false);
      return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });

    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    setEditName(false);
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handlePetPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPetUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPetPhoto(event.target?.result as string);
      setPetUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setPetFormError("");

    if (!petName.trim()) {
      setPetFormError("Pet Name is required");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: petName,
          type: petType,
          breed: petBreed,
          age: petAge ? Number(petAge) : undefined,
          gender: petGender,
          photo: petPhoto,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPetFormError(data.error || "Failed to add pet");
        return;
      }

      // Reset form and close modal
      setPetName("");
      setPetType("dog");
      setPetBreed("");
      setPetAge("");
      setPetGender("Unknown");
      setPetPhoto("");
      setShowAddPetModal(false);

      // Reload profile data
      if (token) fetchProfileAndStats(token);
      showSaved();
    } catch (err) {
      setPetFormError("Error occurred. Please try again.");
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm("Are you sure you want to delete this pet?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        if (token) fetchProfileAndStats(token);
        showSaved();
      }
    } catch (err) {
      console.error("Delete pet failed", err);
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
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/15 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between max-w-xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </nav>

      <main className="relative z-10 flex-grow flex flex-col items-center px-4 sm:px-6 pb-10">
        <div className="w-full max-w-xl">

          {/* Saved Toast */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm px-5 py-2.5 rounded-full backdrop-blur-md"
              >
                <Check className="w-4 h-4" />
                Updated successfully
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8 mt-4">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-2 ring-indigo-500/30 ring-offset-4 ring-offset-[#050505] transition-all duration-300 group-hover:ring-indigo-500/60">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Upload Button Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-transform border-[3px] border-[#050505]"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div className="mt-5 flex items-center gap-2">
              {editName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-lg font-bold text-white text-center focus:outline-none focus:border-indigo-500/50 w-48"
                    onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                  />
                  <button onClick={handleNameSave} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                    Save
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditName(true)} className="group flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user?.name}</h2>
                  <span className="text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                </button>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
          </div>

          {/* Profile Info Cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Translations Card */}
            <div className="relative rounded-2xl overflow-hidden col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl" />
              <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a12]" />
              <div className="relative z-10 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center flex-shrink-0">
                  <PawPrint className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs">Translations</p>
                  <p className="text-white text-sm sm:text-base font-bold">{translationCount} total</p>
                </div>
              </div>
            </div>

            {/* Pets Counter Card */}
            <div className="relative rounded-2xl overflow-hidden col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl" />
              <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a12]" />
              <div className="relative z-10 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] sm:text-xs">My Pets</p>
                  <p className="text-white text-sm sm:text-base font-bold">{pets.length} registered</p>
                </div>
              </div>
            </div>
          </div>

          {/* MY PETS SECTION */}
          <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                My Pets Registry
              </h3>
              <button
                onClick={() => setShowAddPetModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Pet
              </button>
            </div>

            {pets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <div key={pet._id} className="relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                        {pet.photo ? (
                          <Image 
                            src={pet.photo} 
                            alt={pet.name} 
                            width={48}
                            height={48}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span>{ANIMAL_EMOJIS[pet.type] || "🐾"}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight text-white group-hover:text-indigo-400 transition-colors">{pet.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{pet.breed || pet.type}</p>
                        {pet.age !== undefined && (
                          <p className="text-[10px] text-gray-600">{pet.age} {pet.age === 1 ? "year" : "years"} old • {pet.gender}</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeletePet(pet._id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/[0.01] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                <PawPrint className="w-10 h-10 text-gray-700 mb-2" />
                <h4 className="text-xs font-semibold text-gray-500">No pets registered yet</h4>
                <p className="text-[10px] text-gray-600 mt-1 max-w-[200px]">Add your pet to get tailored voice emotion decodes.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/" className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group">
              <Sparkles className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-gray-400">Start Translating</span>
            </Link>
            <Link href="/history" className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group">
              <PawPrint className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-gray-400">View History</span>
            </Link>
          </div>

        </div>
      </main>

      {/* ADD PET MODAL */}
      <AnimatePresence>
        {showAddPetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPetModal(false)}
              className="absolute inset-0 bg-[#000]/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c16] shadow-2xl p-6 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  Register Your Pet
                </h3>
                <button
                  onClick={() => setShowAddPetModal(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {petFormError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-4 font-semibold">
                  {petFormError}
                </div>
              )}

              <form onSubmit={handleAddPet} className="space-y-4">
                {/* Pet Photo Upload */}
                <div className="flex flex-col items-center mb-2">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center text-3xl shadow-md">
                      {petPhoto ? (
                        <img src={petPhoto} alt="Pet Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>{ANIMAL_EMOJIS[petType] || "🐾"}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => petFileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg border-2 border-[#0c0c16]"
                    >
                      {petUploading ? (
                        <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                    <input
                      ref={petFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePetPhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1">Upload pet image (optional)</span>
                </div>

                {/* Pet Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Pet Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Max, Luna"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>

                {/* Pet Type Select */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Pet Type *</label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.keys(ANIMAL_EMOJIS).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPetType(type)}
                        title={type}
                        className={`py-2 rounded-xl flex flex-col items-center justify-center border transition-all text-xl capitalize ${
                          petType === type
                            ? "bg-indigo-500/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                            : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <span>{ANIMAL_EMOJIS[type]}</span>
                        <span className="text-[9px] mt-0.5 hidden sm:block">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Breed */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Breed / Specie</label>
                    <input
                      type="text"
                      placeholder="e.g. Golden Retriever"
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Age (years)</label>
                    <input
                      type="number"
                      placeholder="e.g. 3"
                      value={petAge}
                      onChange={(e) => setPetAge(e.target.value)}
                      min="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Gender</label>
                  <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                    {["Male", "Female", "Unknown"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPetGender(g)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          petGender === g
                            ? "bg-indigo-500 text-white shadow-md"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 mt-2"
                >
                  Save Pet Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
