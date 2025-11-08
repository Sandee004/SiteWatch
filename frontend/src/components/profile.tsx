import React, { useState } from "react";
import { FiCheck, FiArrowLeft, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await new Promise((res) => setTimeout(res, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-full hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition"
              title="Back to Dashboard"
            >
              <FiArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Profile Settings
            </h1>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        {/* --- PROFILE OVERVIEW CARD --- */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-2xl shadow-md">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-full shadow cursor-pointer transition opacity-0 group-hover:opacity-100"
              title="Change profile picture"
            >
              <FiUser className="h-4 w-4" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-800">
              {name || "Your Name"}
            </h2>
            <p className="text-gray-500">{email || "No email set"}</p>
          </div>
        </div>

        {/* --- EDITABLE FORM --- */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all p-8 space-y-8">
          <p className="text-gray-500 text-sm">
            Update your personal details below. Your email is used for site
            status notifications.
          </p>

          {/* Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSaving}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 shadow-sm"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address{" "}
              <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSaving}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 shadow-sm"
            />
            <p className="text-xs text-gray-500">
              We'll send alerts to this email when a monitored site goes down.
            </p>
          </div>

          {/* Save Button + Status */}
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium shadow hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>

            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <FiCheck className="h-4 w-4" />
                Saved successfully!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
