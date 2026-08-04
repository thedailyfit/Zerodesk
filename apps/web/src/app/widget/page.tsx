'use client';

import { useSearchParams } from 'next/navigation';
import { ChatWidget } from '@/components/widget/chat-widget';

export default function StandaloneWidgetPage() {
  const searchParams = useSearchParams();
  
  const botName = searchParams.get('botName') || 'ZeroDesk Assistant';
  const primaryColor = searchParams.get('color') || '#8b5cf6';
  const tone = searchParams.get('tone') || 'empathetic';
  const welcomeMessage = searchParams.get('welcomeMessage') || undefined;

  return (
    <div className="bg-transparent min-h-screen">
      <ChatWidget
        botName={botName}
        primaryColor={primaryColor}
        tone={tone}
        welcomeMessage={welcomeMessage}
        isPreview={false}
      />
    </div>
  );
}
