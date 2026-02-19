export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">System Settings</h1>

      <div className="space-y-8">
        {/* API Configuration */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">External Services</h2>
          <div className="space-y-4">
            {[
              { name: "LibreTranslate API", url: "LIBRETRANSLATE_API_URL" },
              { name: "Faster Whisper API", url: "FASTER_WHISPER_API_URL" },
            ].map((service) => (
              <div key={service.url}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {service.name}
                </label>
                <input
                  type="text"
                  defaultValue={process.env[service.url] || ""}
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">Feature Toggles</h2>
          <div className="space-y-4">
            {["Enable Dictation", "Enable File Upload", "Enable Translation"].map((feature) => (
              <label key={feature} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-slate-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Save Settings
        </button>
      </div>
    </div>
  );
}
