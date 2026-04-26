import { ToolLayout } from '@/components/ToolLayout';
import { RepurposeMode } from '@/components/RepurposeMode';
import { NicheSetup } from '@/components/NicheSetup';

export const metadata = {
  title: 'Repurpose Content - Instruct',
  description: 'Transform long-form content into platform-optimized posts',
};

export default function RepurposePage() {
  return (
    <ToolLayout
      title="Content Repurposer"
      description="Transform one piece of content into multiple platform-optimized versions. Paste a tweet, article, or LinkedIn post, and get it ready for any platform."
    >
      <NicheSetup />
      <RepurposeMode />
    </ToolLayout>
  );
}
