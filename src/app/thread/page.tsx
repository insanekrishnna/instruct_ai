import { ToolLayout } from '@/components/ToolLayout';
import { ThreadGenerator } from '@/components/ThreadGenerator';
import { NicheSetup } from '@/components/NicheSetup';

export const metadata = {
  title: 'Thread & Carousel Generator - Instruct',
  description: 'Create Twitter threads or Instagram carousel scripts',
};

export default function ThreadPage() {
  return (
    <ToolLayout
      title="Thread & Carousel Generator"
      description="Create compelling Twitter threads or Instagram carousel scripts. Turn topics into engaging multi-slide content."
    >
      <NicheSetup />
      <ThreadGenerator />
    </ToolLayout>
  );
}
