import React, { useState, useCallback, useEffect } from "react";
import { FiRefreshCw, FiPlus, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface Site {
  id: string;
  url: string;
  status: "up" | "down" | "unknown";
  lastChecked: string | null;
}

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();

  // ===== Fetch sites from backend =====
  const fetchSites = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("http://localhost:8000/sites", {
        credentials: "include", // important for session-based guests
      });
      const data: Site[] = await res.json();
      setSites(data);
    } catch (err) {
      console.error("Failed to fetch sites:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // ===== Add a new site =====
  const handleAddSite = useCallback(async () => {
    if (!urlInput.trim()) return;
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/add_site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add site");
      setUrlInput("");
      fetchSites();
    } catch (err) {
      console.error(err);
      alert("Error adding site. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [urlInput, fetchSites]);

  // ===== Refresh site statuses =====
  const handleRefresh = useCallback(() => {
    fetchSites();
  }, [fetchSites]);

  // ===== Enter key support =====
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddSite();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            NYSC Watch
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="p-2 rounded-full hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition"
              title="Profile Settings"
            >
              <FiSettings className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        {/* Add New Site Section */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Add New Site
          </h2>
          <p className="text-gray-500 mb-5">
            Monitor a new website by entering its URL below
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            />
            <button
              onClick={handleAddSite}
              disabled={isLoading || !urlInput.trim()}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow hover:bg-indigo-700 transition disabled:opacity-60"
            >
              <FiPlus className="h-5 w-5" />
              {isLoading ? "Adding..." : "Add Site"}
            </button>
          </div>
        </div>

        {/* Sites Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-2xl font-bold text-gray-800">
              Monitored Sites
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 bg-white/80 hover:bg-gray-100 shadow-sm transition disabled:opacity-60"
            >
              <FiRefreshCw
                className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {sites.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl py-12 text-center text-gray-500 shadow-sm">
              No sites being monitored yet. Add one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 p-5"
                >
                  <div className="space-y-4">
                    {/* URL */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Website
                      </p>
                      <p className="font-mono text-sm text-gray-800 break-all">
                        {site.url}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        {site.status === "up" ? (
                          <>
                            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-green-500/40 shadow" />
                            <span className="text-sm font-semibold text-green-600">
                              Online
                            </span>
                          </>
                        ) : site.status === "down" ? (
                          <>
                            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-red-500/40 shadow" />
                            <span className="text-sm font-semibold text-red-600">
                              Offline
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-gray-500">
                            Unknown
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Last Checked */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Last Checked
                      </p>
                      <p className="text-sm text-gray-700">
                        {site.lastChecked
                          ? new Date(site.lastChecked).toLocaleString()
                          : "Not checked yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
