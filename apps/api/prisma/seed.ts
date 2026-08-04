import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ZeroDesk database...\n');

  // ============================================================
  // 1. Demo Tenant
  // ============================================================
  const tenantId = uuid();
  const tenant = await prisma.tenant.create({
    data: {
      id: tenantId,
      clerkOrgId: 'org_demo_glowclinic',
      name: 'Glow Skin & Hair Clinic',
      slug: 'glow-clinic',
      industry: 'skin_hair_clinic',
      timezone: 'Asia/Kolkata',
      subscriptionTier: 'growth',
      subscriptionStatus: 'active',
      settings: {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        businessHours: {
          monday: { open: '10:00', close: '20:00' },
          tuesday: { open: '10:00', close: '20:00' },
          wednesday: { open: '10:00', close: '20:00' },
          thursday: { open: '10:00', close: '20:00' },
          friday: { open: '10:00', close: '20:00' },
          saturday: { open: '10:00', close: '18:00' },
          sunday: null,
        },
      },
    },
  });
  console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`);

  // ============================================================
  // 2. Demo Users
  // ============================================================
  const adminUser = await prisma.user.create({
    data: {
      tenantId,
      clerkUserId: 'user_demo_admin',
      email: 'admin@glowclinic.com',
      name: 'Dr. Priya Menon',
      role: 'ORG_ADMIN',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      tenantId,
      clerkUserId: 'user_demo_manager',
      email: 'reception@glowclinic.com',
      name: 'Anita Sharma',
      role: 'MANAGER',
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      tenantId,
      clerkUserId: 'user_demo_staff',
      email: 'kavita@glowclinic.com',
      name: 'Kavita Nair',
      role: 'STAFF',
    },
  });
  console.log(`✅ Users: ${adminUser.name}, ${managerUser.name}, ${staffUser.name}`);

  // ============================================================
  // 3. Staff Members
  // ============================================================
  const drMeenakshi = await prisma.staffMember.create({
    data: {
      tenantId,
      userId: adminUser.id,
      name: 'Dr. Meenakshi Rao',
      roleTitle: 'Lead Dermatologist',
      specialization: 'Laser Treatments, Chemical Peels',
      isActive: true,
      availability: {
        monday: { start: '10:00', end: '18:00' },
        tuesday: { start: '10:00', end: '18:00' },
        wednesday: { start: '10:00', end: '18:00' },
        thursday: { start: '10:00', end: '18:00' },
        friday: { start: '10:00', end: '18:00' },
        saturday: { start: '10:00', end: '14:00' },
      },
    },
  });

  const drArun = await prisma.staffMember.create({
    data: {
      tenantId,
      name: 'Dr. Arun Krishnan',
      roleTitle: 'Hair Transplant Specialist',
      specialization: 'Hair Restoration, PRP Therapy',
      isActive: true,
      availability: {
        monday: { start: '11:00', end: '19:00' },
        tuesday: { start: '11:00', end: '19:00' },
        thursday: { start: '11:00', end: '19:00' },
        friday: { start: '11:00', end: '19:00' },
        saturday: { start: '11:00', end: '16:00' },
      },
    },
  });
  console.log(`✅ Staff: Dr. Meenakshi, Dr. Arun`);

  // ============================================================
  // 4. Services
  // ============================================================
  const services = await Promise.all([
    prisma.service.create({ data: { tenantId, name: 'Consultation', description: 'Initial skin/hair assessment', durationMins: 20, price: 500, category: 'General' } }),
    prisma.service.create({ data: { tenantId, name: 'Laser Hair Removal (Small Area)', description: 'Underarms, upper lip, chin', durationMins: 30, price: 3000, category: 'Laser' } }),
    prisma.service.create({ data: { tenantId, name: 'Laser Hair Removal (Full Body)', description: 'Complete body laser treatment', durationMins: 120, price: 25000, category: 'Laser' } }),
    prisma.service.create({ data: { tenantId, name: 'Chemical Peel', description: 'Glycolic/Salicylic acid peel', durationMins: 45, price: 5000, category: 'Skin Treatment' } }),
    prisma.service.create({ data: { tenantId, name: 'PRP Hair Therapy', description: 'Platelet-Rich Plasma for hair growth', durationMins: 60, price: 8000, category: 'Hair Treatment' } }),
    prisma.service.create({ data: { tenantId, name: 'Hydrafacial', description: 'Deep cleansing hydra facial', durationMins: 45, price: 4000, category: 'Facial' } }),
    prisma.service.create({ data: { tenantId, name: 'Botox Treatment', description: 'Anti-wrinkle botox injection', durationMins: 30, price: 12000, category: 'Anti-Aging' } }),
    prisma.service.create({ data: { tenantId, name: 'Hair Transplant Consultation', description: 'FUE/FUT assessment', durationMins: 30, price: 1000, category: 'Hair Treatment' } }),
  ]);
  console.log(`✅ Services: ${services.length} created`);

  // ============================================================
  // 5. Pipeline Stages
  // ============================================================
  const stages = await Promise.all([
    prisma.pipelineStage.create({ data: { tenantId, name: 'New Lead', slug: 'new-lead', order: 1, color: '#6366f1', isDefault: true } }),
    prisma.pipelineStage.create({ data: { tenantId, name: 'Contacted', slug: 'contacted', order: 2, color: '#8b5cf6' } }),
    prisma.pipelineStage.create({ data: { tenantId, name: 'Qualified', slug: 'qualified', order: 3, color: '#a855f7' } }),
    prisma.pipelineStage.create({ data: { tenantId, name: 'Proposal Sent', slug: 'proposal-sent', order: 4, color: '#d946ef' } }),
    prisma.pipelineStage.create({ data: { tenantId, name: 'Won', slug: 'won', order: 5, color: '#22c55e' } }),
    prisma.pipelineStage.create({ data: { tenantId, name: 'Lost', slug: 'lost', order: 6, color: '#ef4444' } }),
  ]);
  console.log(`✅ Pipeline: ${stages.length} stages`);

  // ============================================================
  // 6. Demo Customers
  // ============================================================
  const customers = await Promise.all([
    prisma.customer.create({ data: { tenantId, phone: '+919876543210', email: 'rajesh.kumar@email.com', name: 'Rajesh Kumar', language: 'en', leadScore: 85, sentiment: 'POSITIVE', lifetimeValue: 45000, tags: ['VIP', 'Skin Care'], aiSummary: 'Long-time customer interested in laser treatments. Has completed 3 laser sessions.' } }),
    prisma.customer.create({ data: { tenantId, phone: '+918765432109', email: 'priya.s@email.com', name: 'Priya Sharma', language: 'hi', leadScore: 72, sentiment: 'NEUTRAL', lifetimeValue: 28000, tags: ['Regular', 'Hair Treatment'], aiSummary: 'Regular customer for hair treatments. Interested in PRP therapy.' } }),
    prisma.customer.create({ data: { tenantId, phone: '+917654321098', email: 'amit.p@email.com', name: 'Amit Patel', language: 'en', leadScore: 45, sentiment: 'NEUTRAL', lifetimeValue: 12000, tags: ['New'], aiSummary: 'New customer, had first consultation for acne treatment.' } }),
    prisma.customer.create({ data: { tenantId, phone: '+916543210987', email: 'sneha.r@email.com', name: 'Sneha Reddy', language: 'te', leadScore: 92, sentiment: 'POSITIVE', lifetimeValue: 120000, tags: ['VIP', 'Premium', 'Referral'], aiSummary: 'Premium VIP customer. Regular botox and facial treatments. Refers many friends.' } }),
    prisma.customer.create({ data: { tenantId, phone: '+915432109876', name: 'Vikram Singh', language: 'hi', leadScore: 33, sentiment: 'NEGATIVE', lifetimeValue: 5000, tags: ['At Risk'], aiSummary: 'Had a billing complaint. Needs follow-up from management.' } }),
  ]);
  console.log(`✅ Customers: ${customers.length} created`);

  // ============================================================
  // 7. Demo Leads
  // ============================================================
  await Promise.all([
    prisma.lead.create({ data: { tenantId, customerId: customers[0].id, stageId: stages[2].id, ownerId: adminUser.id, title: 'Full Body Laser Package', value: 75000, score: 85, source: 'VOICE' } }),
    prisma.lead.create({ data: { tenantId, customerId: customers[1].id, stageId: stages[1].id, ownerId: managerUser.id, title: 'PRP Hair Therapy (6 sessions)', value: 48000, score: 72, source: 'WHATSAPP' } }),
    prisma.lead.create({ data: { tenantId, customerId: customers[2].id, stageId: stages[0].id, title: 'Acne Scar Treatment', value: 18000, score: 45, source: 'WEB_CHAT' } }),
    prisma.lead.create({ data: { tenantId, customerId: customers[3].id, stageId: stages[4].id, ownerId: adminUser.id, title: 'Annual Premium Membership', value: 100000, score: 92, source: 'VOICE', wonAt: new Date() } }),
  ]);
  console.log(`✅ Leads: 4 created`);

  // ============================================================
  // 8. Knowledge Base Documents
  // ============================================================
  const docs = await Promise.all([
    prisma.knowledgeDocument.create({
      data: {
        tenantId,
        title: 'Laser Hair Removal - Complete Guide',
        category: 'SERVICE',
        content: `Our clinic uses the latest Soprano ICE Platinum diode laser technology for hair removal. The treatment is virtually painless and works on all skin types. Sessions typically last 15-60 minutes depending on the area. For best results, 6-8 sessions are recommended at 4-6 week intervals. Pricing: Small areas (underarms, upper lip) start at ₹3,000 per session. Medium areas (arms, legs) at ₹8,000. Full body packages available at ₹25,000 per session with package discounts of 20% for 6+ sessions.`,
        sourceType: 'MANUAL',
      },
    }),
    prisma.knowledgeDocument.create({
      data: {
        tenantId,
        title: 'Working Hours & Contact Information',
        category: 'FAQ',
        content: `Glow Skin & Hair Clinic is open Monday through Saturday. Weekdays: 10:00 AM to 8:00 PM. Saturday: 10:00 AM to 6:00 PM. Sunday: Closed. Address: Jubilee Hills Road No 36, Hyderabad, Telangana 500033. Phone: +91 40 1234 5678. Email: hello@glowclinic.com. Walk-ins are welcome, but appointments are recommended to avoid wait times.`,
        sourceType: 'MANUAL',
      },
    }),
    prisma.knowledgeDocument.create({
      data: {
        tenantId,
        title: 'Treatment Pricing 2024',
        category: 'PRICING',
        content: `Consultation: ₹500 (waived if treatment booked same day). Laser Hair Removal: Small ₹3,000, Medium ₹8,000, Full Body ₹25,000. Chemical Peel: ₹5,000. Hydrafacial: ₹4,000. PRP Hair Therapy: ₹8,000 per session. Botox: ₹12,000. Hair Transplant: Starting ₹50,000 (FUE). Package discounts: 10% off for 3 sessions, 20% off for 6+ sessions. EMI options available on all treatments above ₹10,000.`,
        sourceType: 'MANUAL',
      },
    }),
    prisma.knowledgeDocument.create({
      data: {
        tenantId,
        title: 'Cancellation & Refund Policy',
        category: 'POLICY',
        content: `Appointments can be cancelled or rescheduled up to 4 hours before the scheduled time at no charge. Cancellations within 4 hours will incur a ₹500 cancellation fee. No-shows will be charged the full consultation fee. Package refunds: Unused sessions can be refunded within 6 months of purchase with a 10% processing fee. Treatment guarantees: If unsatisfied with results, a free follow-up session is provided within 30 days.`,
        sourceType: 'MANUAL',
      },
    }),
  ]);
  console.log(`✅ Knowledge Base: ${docs.length} documents`);

  // ============================================================
  // 9. Voice & WhatsApp Config
  // ============================================================
  await prisma.voiceConfig.create({
    data: {
      tenantId,
      voicePersonality: 'professional',
      greeting: 'Hello! Welcome to Glow Skin & Hair Clinic. How can I help you today?',
      languages: ['en', 'hi', 'te'],
      transferNumber: '+914012345678',
      isActive: true,
      settings: { provider: 'vapi' },
    },
  });

  await prisma.whatsappConfig.create({
    data: {
      tenantId,
      displayPhone: '+914012345678',
      greeting: 'Hi! 👋 Welcome to Glow Skin & Hair Clinic. I\'m your AI assistant. How can I help you?',
      isActive: true,
    },
  });
  console.log(`✅ Voice & WhatsApp configs created`);

  // ============================================================
  // 10. Subscription
  // ============================================================
  await prisma.subscription.create({
    data: {
      tenantId,
      plan: 'growth',
      mrr: 4999,
      voiceMinutesLimit: 500,
      voiceMinutesUsed: 127,
      whatsappMessagesLimit: 2000,
      whatsappMessagesUsed: 345,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✅ Subscription created`);

  console.log('\n🎉 Database seeded successfully!\n');
  console.log(`Tenant ID: ${tenantId}`);
  console.log(`Admin: ${adminUser.email} (${adminUser.role})`);
  console.log(`Manager: ${managerUser.email} (${managerUser.role})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
