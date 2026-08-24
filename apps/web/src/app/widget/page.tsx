'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatWidget } from '@/components/widget/chat-widget';

export const dynamic = 'force-dynamic';

function WidgetContent() {
  const searchParams = useSearchParams();
  
  const botName = searchParams.get('botName') || 'ZeroDesk Assistant';
  const primaryColor = searchParams.get('color') || '#2563eb';
  const tone = searchParams.get('tone') || 'empathetic';
  const welcomeMessage = searchParams.get('welcomeMessage') || undefined;

  return (
    <ChatWidget
      botName={botName}
      primaryColor={primaryColor}
      tone={tone}
      welcomeMessage={welcomeMessage}
      isPreview={false}
    />
  );
}

export default function StandaloneWidgetPage() {
  return (
    <div className="bg-transparent min-h-screen">
      <Suspense fallback={
        <div className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 animate-pulse flex items-center justify-center text-white" />
      }>
        <WidgetContent />
      </Suspense>
    </div>
  );
}
