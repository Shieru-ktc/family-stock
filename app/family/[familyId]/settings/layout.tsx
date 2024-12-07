import { ReactNode } from "react";

import SettingsNavLink from "./settings-navlink";

export default async function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SettingsNavLink />
      {children}
    </>
  );
}
