import { ToolLayout } from '@/components/ToolLayout';
import { HookGenerator } from '@/components/HookGenerator';
import { NicheSetup } from '@/components/NicheSetup';

export const metadata = {
  title: 'Hook Generator - Instruct',
  description: 'Generate attention-grabbing hooks for your content',
};

export default function HookPage() {
  return (
    <ToolLayout
      title="Hook Generator"
      description="Generate 8 proven hook formats to stop the scroll. Optimized for Instagram, Twitter, and LinkedIn."
    >
      <NicheSetup />
      <HookGenerator />
    </ToolLayout>
  );
}
