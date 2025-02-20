"use client";

import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div>
      <button onClick={toggleTheme}>
        {resolvedTheme === "dark" ? "ライトテーマに変更" : "ダークテーマに変更"}
      </button>
    </div>
  );
}
