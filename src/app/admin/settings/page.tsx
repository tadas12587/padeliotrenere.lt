import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-900 text-[#0B5C71]">Svetainės nustatymai</h1>
        <p className="text-gray-500 text-sm mt-1">
          Logotipas, favicon, kontaktai, socialiniai tinklai ir pagrindinio puslapio turinys.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
