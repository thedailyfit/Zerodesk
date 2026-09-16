import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CURATED_INDIAN_VOICES = [
  // ==========================================
  // ELEVENLABS (High-Fidelity Indian English & Hinglish)
  // ==========================================
  {
    provider: 'elevenlabs',
    voiceId: '90ipbRoKi4CpHXvKVtl0',
    name: 'Kavya (Empathetic Receptionist)',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Indian English & Hinglish',
    sampleText: 'Namaste! Welcome to our clinic. How may I assist you with scheduling your appointment today?',
    previewUrl: 'https://cdn.0desk.ai/audio/kavya-preview.mp3',
    isDefault: true,
    isActive: true,
    tags: ['Best for OPDs', 'Warm & Empathetic', 'Bilingual Hinglish', 'ElevenLabs Turbo v2.5'],
  },
  {
    provider: 'elevenlabs',
    voiceId: 'cgSgspJ2msm6clMCkdW9',
    name: 'Aditi (Executive Consultant)',
    gender: 'female',
    language: 'en-IN',
    accent: 'Indian English (Clear & Polished)',
    sampleText: 'Good day! Thank you for contacting our desk. I can assist you with portfolio inquiries, brochures, and site visit scheduling.',
    previewUrl: 'https://cdn.0desk.ai/audio/aditi-preview.mp3',
    isDefault: false,
    isActive: true,
    tags: ['Luxury Real Estate', 'Consultancy', 'High Ticket', 'ElevenLabs Multilingual v2'],
  },
  {
    provider: 'elevenlabs',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah (International Concierge)',
    gender: 'female',
    language: 'en-US',
    accent: 'Global Neutral Accent',
    sampleText: 'Hello and welcome! I am your 24/7 front desk concierge. How can I facilitate your visit or reservation today?',
    previewUrl: 'https://cdn.0desk.ai/audio/sarah-preview.mp3',
    isDefault: false,
    isActive: true,
    tags: ['Boutique Hotels', 'NRI Friendly', 'Luxury Hospitality', 'ElevenLabs Multilingual v2'],
  },
  {
    provider: 'elevenlabs',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam (Senior Business Advisor)',
    gender: 'male',
    language: 'en-IN',
    accent: 'Indian English (Authoritative)',
    sampleText: 'Hello! Thank you for reaching out. I can assist you with demo class scheduling, loan schemes, or vehicle servicing bookings.',
    previewUrl: 'https://cdn.0desk.ai/audio/adam-preview.mp3',
    isDefault: false,
    isActive: true,
    tags: ['Coaching Admissions', 'Fintech Loans', 'Auto Dealerships', 'ElevenLabs Turbo v2.5'],
  },
  {
    provider: 'elevenlabs',
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel (Medical Specialist)',
    gender: 'male',
    language: 'en-IN',
    accent: 'Indian English (Calm & Precise)',
    sampleText: 'Greetings. I am here to assist you with specialist OPD consultations, diagnostic follow-ups, and lab reports.',
    previewUrl: 'https://cdn.0desk.ai/audio/daniel-preview.mp3',
    isDefault: false,
    isActive: true,
    tags: ['Hospitals', 'Diagnostics', 'Specialists', 'ElevenLabs Multilingual v2'],
  },

  // ==========================================
  // SARVAM AI (Bulbul:v2 Indic Text-to-Speech)
  // ==========================================
  {
    provider: 'sarvam',
    voiceId: 'bulbul:kavya-hi',
    name: 'Bulbul Kavya (Native Hindi & Hinglish)',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Native Hindi (Conversational Desk)',
    sampleText: 'नमस्ते! हमारे क्लिनिक में आपका स्वागत है। क्या मैं आपके लिए डॉक्टर का अपॉइंटमेंट बुक करूँ?',
    previewUrl: 'https://cdn.0desk.ai/audio/bulbul-kavya.mp3',
    isDefault: false,
    isActive: true,
    tags: ['100% Native Hindi', 'Zero Robotic Tone', 'Bilingual Hinglish', 'Sarvam Bulbul v2'],
  },
  {
    provider: 'sarvam',
    voiceId: 'bulbul:arjun-hi',
    name: 'Bulbul Arjun (Native Hindi Executive)',
    gender: 'male',
    language: 'hi-IN',
    accent: 'Native Hindi (Fast & Direct)',
    sampleText: 'नमस्ते! टेस्ट ड्राइव या सर्विस बुकिंग के लिए मैं आपकी पूरी मदद कर सकता हूँ। बताएं कब आना चाहेंगे?',
    previewUrl: 'https://cdn.0desk.ai/audio/bulbul-arjun.mp3',
    isDefault: false,
    isActive: true,
    tags: ['Auto Service', 'Admissions', 'Hindi Native', 'Sarvam Bulbul v2'],
  },
  {
    provider: 'sarvam',
    voiceId: 'bulbul:priya-te',
    name: 'Bulbul Priya (Native Telugu)',
    gender: 'female',
    language: 'te-IN',
    accent: 'Native Telugu (Warm & Polite)',
    sampleText: 'నమస్కారం! మా క్లినిక్‌కి స్వాగతం. డాక్టర్ అపాయింట్‌మెంట్ లేదా వివరాల కోసం నేను మీకు ఎలా సహాయపడగలను?',
    previewUrl: 'https://cdn.0desk.ai/audio/bulbul-priya.mp3',
    isDefault: false,
    isActive: true,
    tags: ['South India Hub', 'Telugu Native', 'Regional Support', 'Sarvam Bulbul v2'],
  },
  {
    provider: 'sarvam',
    voiceId: 'bulbul:ananya-ta',
    name: 'Bulbul Ananya (Native Tamil)',
    gender: 'female',
    language: 'ta-IN',
    accent: 'Native Tamil (Polite Concierge)',
    sampleText: 'வணக்கம்! எங்கள் சேவை மையத்திற்கு வரவேற்கிறோம். இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
    previewUrl: 'https://cdn.0desk.ai/audio/bulbul-ananya.mp3',
    isDefault: false,
    isActive: true,
    tags: ['Tamil Nadu Hub', 'Tamil Native', 'Regional Support', 'Sarvam Bulbul v2'],
  },
  {
    provider: 'sarvam',
    voiceId: 'bulbul:vikram-kn',
    name: 'Bulbul Vikram (Native Kannada)',
    gender: 'male',
    language: 'kn-IN',
    accent: 'Native Kannada (Professional)',
    sampleText: 'ನಮಸ್ಕಾರ! ನಮ್ಮ ಸ್ವಾಗತ ಮೇಜಿಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಾಗಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    previewUrl: 'https://cdn.0desk.ai/audio/bulbul-vikram.mp3',
    isDefault: false,
    isActive: true,
    tags: ['Karnataka Hub', 'Kannada Native', 'Bangalore SMBs', 'Sarvam Bulbul v2'],
  },
];

async function seedVoices() {
  console.log('🎙️ Seeding Curated Indian Voice AI Personas into Mumbai Database...');
  for (const v of CURATED_INDIAN_VOICES) {
    const upserted = await prisma.globalVoiceRegistry.upsert({
      where: { voiceId: v.voiceId },
      update: {
        provider: v.provider,
        name: v.name,
        gender: v.gender,
        language: v.language,
        accent: v.accent,
        sampleText: v.sampleText,
        previewUrl: v.previewUrl,
        isDefault: v.isDefault,
        isActive: v.isActive,
        tags: v.tags,
      },
      create: {
        provider: v.provider,
        voiceId: v.voiceId,
        name: v.name,
        gender: v.gender,
        language: v.language,
        accent: v.accent,
        sampleText: v.sampleText,
        previewUrl: v.previewUrl,
        isDefault: v.isDefault,
        isActive: v.isActive,
        tags: v.tags,
      },
    });
    console.log(`✅ [${upserted.provider.toUpperCase()}] ${upserted.name} (${upserted.voiceId})`);
  }
  console.log('🎉 Successfully seeded 10 curated Indian Voice Personas into GlobalVoiceRegistry!');
}

seedVoices()
  .catch((e) => {
    console.error('❌ Error seeding voices:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
