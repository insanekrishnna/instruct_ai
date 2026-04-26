import { ToolLayout } from '@/components/ToolLayout';
import { NicheSetup } from '@/components/NicheSetup';

export const metadata = {
  title: 'Settings - Instruct',
  description: 'Manage your creator profile and preferences',
};

export default function SettingsPage() {
  return (
    <ToolLayout
      title="Settings"
      description="Manage your creator profile and preferences. Your settings are stored locally in your browser."
    >
      <NicheSetup />
    </ToolLayout>
  );
}
