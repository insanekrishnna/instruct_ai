import { ToolLayout } from '@/components/ToolLayout';
import { CaptionGenerator } from '@/components/CaptionGenerator';
import { NicheSetup } from '@/components/NicheSetup';

export const metadata = {
  title: 'Caption Generator - Instruct',
  description: 'Generate viral captions with AI',
};

export default function GeneratePage() {
  return (
    <ToolLayout
      title="Caption Generator"
      description="Create viral, engagement-driven captions with AI. Choose your style, add images, and get instant suggestions with engagement scores."
    >
      <NicheSetup />
      <CaptionGenerator />
    </ToolLayout>
  );
}
