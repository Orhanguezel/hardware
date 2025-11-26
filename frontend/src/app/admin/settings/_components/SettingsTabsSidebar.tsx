// =============================================================
// FILE: src/app/admin/settings/_components/SettingsTabsSidebar.tsx
// =============================================================

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tab, TabId } from "../settings.types";

interface Props {
  tabs: Tab[];
  activeTab: TabId;
  onChange: (tabId: TabId) => void;
}

export function SettingsTabsSidebar({ tabs, activeTab, onChange }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onChange(tab.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
