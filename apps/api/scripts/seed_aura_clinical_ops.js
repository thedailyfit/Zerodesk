const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const tenantId = '08f1fadd-59eb-4d07-9ee3-65a2d9a321e3';
  console.log('✨ Seeding complete Aura Skin & Aesthetic Clinic clinical practice data...');

  // 1. Ensure Tenant exists and is updated
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {
      name: 'Aura Skin & Aesthetic Clinic',
      slug: 'aura-skin-clinic',
      industry: 'skin_hair_clinic',
      timezone: 'Asia/Kolkata',
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
      settings: {
        currency: 'INR',
        currencySymbol: '₹',
        address: '2nd Floor, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru (Opposite Toit, Metro Pillar 124)',
        phone: '+91 80 4123 8900',
        businessHours: {
          monday: { open: '10:00', close: '19:30' },
          tuesday: { open: '10:00', close: '19:30' },
          wednesday: { open: '10:00', close: '19:30' },
          thursday: { open: '10:00', close: '19:30' },
          friday: { open: '10:00', close: '19:30' },
          saturday: { open: '10:00', close: '19:30' },
          sunday: { open: '11:00', close: '16:00' },
        },
      },
    },
    create: {
      id: tenantId,
      clerkOrgId: 'org_aura_skin_clinic',
      name: 'Aura Skin & Aesthetic Clinic',
      slug: 'aura-skin-clinic',
      industry: 'skin_hair_clinic',
      timezone: 'Asia/Kolkata',
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
    },
  });
  console.log('✅ Tenant verified: Aura Skin & Aesthetic Clinic');

  // 2. Staff Members (Dr. Ananya Rao & Dr. Priya Sharma & Kavita Menon)
  await prisma.staffMember.deleteMany({ where: { tenantId } });

  const drAnanya = await prisma.staffMember.create({
    data: {
      tenantId,
      name: 'Dr. Ananya Rao',
      roleTitle: 'Lead Dermatologist & Medical Director',
      specialization: 'MBBS, MD (Dermatology, AIIMS Gold Medalist) — Aesthetic Injectables & Laser Surgery',
      isActive: true,
      availability: {
        monday: { start: '10:00', end: '19:30' },
        tuesday: { start: '10:00', end: '19:30' },
        wednesday: { start: '10:00', end: '19:30' },
        thursday: { start: '10:00', end: '19:30' },
        friday: { start: '10:00', end: '19:30' },
        saturday: { start: '10:00', end: '19:30' },
        sunday: { start: '11:00', end: '16:00' },
      },
    },
  });

  const drPriya = await prisma.staffMember.create({
    data: {
      tenantId,
      name: 'Dr. Priya Sharma',
      roleTitle: 'Senior Aesthetic Physician',
      specialization: 'MBBS, DDVL — Soprano Laser Hair Reduction, Chemical Peels & HydraFacials',
      isActive: true,
      availability: {
        monday: { start: '10:00', end: '19:30' },
        tuesday: { start: '10:00', end: '19:30' },
        wednesday: { start: '10:00', end: '19:30' },
        thursday: { start: '10:00', end: '19:30' },
        friday: { start: '10:00', end: '19:30' },
        saturday: { start: '10:00', end: '19:30' },
      },
    },
  });

  const nurseKavita = await prisma.staffMember.create({
    data: {
      tenantId,
      name: 'Kavita Menon',
      roleTitle: 'Lead Clinical Aesthetician',
      specialization: 'Korean HydraFacial Protocols, Carbon Laser & Pre-Op Patient Care',
      isActive: true,
      availability: {
        monday: { start: '10:00', end: '19:30' },
        tuesday: { start: '10:00', end: '19:30' },
        wednesday: { start: '10:00', end: '19:30' },
        thursday: { start: '10:00', end: '19:30' },
        friday: { start: '10:00', end: '19:30' },
        saturday: { start: '10:00', end: '19:30' },
      },
    },
  });
  console.log(`✅ Staff created: Dr. Ananya Rao, Dr. Priya Sharma, Kavita Menon`);

  // 3. Services with proper categories
  await prisma.service.deleteMany({ where: { tenantId } });

  const serviceDefs = [
    {
      name: 'Doctor Consultation with Dr. Ananya Rao MD',
      description: 'Comprehensive clinical evaluation with AIIMS Gold Medalist dermatologist Dr. Ananya Rao. Includes skin scan analysis and 7-day complimentary follow-up.',
      durationMins: 20,
      price: 800,
      category: 'Consultations',
    },
    {
      name: 'HydraFacial Deluxe (Korean Glass Skin Glow)',
      description: '7-step clinical Korean glass glow protocol: vacuum extraction, glycolic exfoliation, antioxidant infusion, and soothing medical LED therapy.',
      durationMins: 45,
      price: 4500,
      category: 'Facials & Glow',
    },
    {
      name: 'Full Body Laser Hair Reduction (Soprano Titanium)',
      description: 'Virtually painless triple-wavelength diode laser with ice-cold sapphire contact cooling. Covers full body in 90 minutes. Safe for all Indian skin types.',
      durationMins: 90,
      price: 14999,
      category: 'Laser Treatments',
    },
    {
      name: 'Underarms Laser Hair Reduction',
      description: 'Targeted high-speed Soprano Titanium laser treatment for underarms. 80%+ hair reduction in 4-6 sittings.',
      durationMins: 20,
      price: 2499,
      category: 'Laser Treatments',
    },
    {
      name: 'Chemical Peels (Acne, Glow & Pigmentation)',
      description: 'Dermatologist-formulated medical peels (Salicylic, Glycolic, Lactic, and Mandelic) targeting active acne, dark spots, melasma, and texture.',
      durationMins: 30,
      price: 2800,
      category: 'Skin Rejuvenation',
    },
    {
      name: 'Botox Anti-Wrinkle Treatment (Allergan USA)',
      description: 'US FDA-approved Allergan Botox for forehead lines, crow\'s feet, and frown lines. Administered exclusively by Dr. Ananya Rao. Price is ₹350 per unit.',
      durationMins: 30,
      price: 350,
      category: 'Injectables',
    },
    {
      name: 'Juvederm Ultra XC Dermal Fillers',
      description: 'Hyaluronic acid dermal fillers for lip enhancement, cheek volume restoration, and nasolabial folds. Natural, long-lasting contouring. ₹22,000 per 1ml syringe.',
      durationMins: 45,
      price: 22000,
      category: 'Injectables',
    },
    {
      name: 'PRP Hair Therapy (GFC Growth Factor)',
      description: 'Next-generation Growth Factor Concentrate (GFC) spun from patient blood to stimulate hair follicles, arrest hair fall, and thicken hair shafts.',
      durationMins: 60,
      price: 5000,
      category: 'Hair & Scalp',
    },
    {
      name: 'Carbon Laser Peel (Hollywood Red Carpet Glow)',
      description: 'Q-switched Nd:YAG laser peel with liquid carbon paste for pore tightening, blackhead removal, instant glow, and skin rejuvenation with zero downtime.',
      durationMins: 45,
      price: 3800,
      category: 'Facials & Glow',
    },
  ];

  const createdServices = [];
  for (const s of serviceDefs) {
    const created = await prisma.service.create({ data: { tenantId, ...s } });
    createdServices.push(created);
  }
  console.log(`✅ Services created: ${createdServices.length} aesthetic clinical treatments`);

  // 4. Customers / Patients
  await prisma.customer.deleteMany({ where: { tenantId } });

  const patientDefs = [
    {
      name: 'Rohan Gupta',
      phone: '+918919205848',
      email: 'rohan.gupta@example.com',
      leadScore: 95,
      sentiment: 'Very Positive',
      aiSummary: 'VIP returning patient. Regular HydraFacial every 4 weeks. Interested in Full Body Soprano Laser package.',
      tags: ['VIP', 'HydraFacial', 'Laser Lead'],
    },
    {
      name: 'Priya Patel',
      phone: '+919820123456',
      email: 'priya.patel@example.com',
      leadScore: 88,
      sentiment: 'Positive',
      aiSummary: 'Sensitive skin. Regular attendee for chemical peels and gentle facials with Dr. Ananya Rao.',
      tags: ['Sensitive Skin', 'Peels'],
    },
    {
      name: 'Rahul Verma',
      phone: '+919811234567',
      email: 'rahul.verma@example.com',
      leadScore: 82,
      sentiment: 'Positive',
      aiSummary: 'Completed 2 sessions of Soprano Titanium laser. Very satisfied with painless cooling experience.',
      tags: ['Laser Hair Reduction', 'Package Patient'],
    },
    {
      name: 'Sneha Reddy',
      phone: '+919849012345',
      email: 'sneha.reddy@example.com',
      leadScore: 90,
      sentiment: 'Very Positive',
      aiSummary: 'Scheduled for Botox touch-up (crow\'s feet). Prefers afternoon appointments with Dr. Ananya.',
      tags: ['Botox', 'High LTV'],
    },
    {
      name: 'Vikram Malhotra',
      phone: '+919876543210',
      email: 'vikram.m@example.com',
      leadScore: 78,
      sentiment: 'Positive',
      aiSummary: 'Undergoing 4-session GFC PRP Hair Therapy course. Noticeable reduction in vertex thinning.',
      tags: ['PRP Hair', 'GFC'],
    },
    {
      name: 'Ananya Sen',
      phone: '+919830123456',
      email: 'ananya.sen@example.com',
      leadScore: 85,
      sentiment: 'Positive',
      aiSummary: 'Acne scar treatment protocol. Combines salicylic peels with carbon laser peel.',
      tags: ['Acne Scar', 'Carbon Laser'],
    },
  ];

  const createdPatients = [];
  for (const p of patientDefs) {
    const created = await prisma.customer.create({ data: { tenantId, ...p } });
    createdPatients.push(created);
  }
  console.log(`✅ Patients created: ${createdPatients.length} realistic clinical patients`);

  // 5. Appointments (Today, Tomorrow, and Recent)
  await prisma.appointment.deleteMany({ where: { tenantId } });

  const now = new Date();
  const today11 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0);
  const today14 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30, 0);
  const today16 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);
  const tomorrow10 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30, 0);
  const tomorrow15 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0, 0);

  const apptDefs = [
    {
      customerId: createdPatients[0].id, // Rohan Gupta
      serviceId: createdServices[1].id, // HydraFacial
      staffId: drPriya.id,
      scheduledAt: today11,
      durationMins: 45,
      status: 'CONFIRMED',
      notes: 'Korean Glass Glow sitting 3. Patient requested extra vacuum extraction on T-zone.',
      source: 'VOICE_AI',
    },
    {
      customerId: createdPatients[1].id, // Priya Patel
      serviceId: createdServices[0].id, // Consultation
      staffId: drAnanya.id,
      scheduledAt: today14,
      durationMins: 20,
      status: 'CONFIRMED',
      notes: 'Follow-up skin review for mild rosacea flare. Prescribed soothing serum check.',
      source: 'PHONE_RECEPTION',
    },
    {
      customerId: createdPatients[2].id, // Rahul Verma
      serviceId: createdServices[2].id, // Full Body Laser
      staffId: drPriya.id,
      scheduledAt: today16,
      durationMins: 90,
      status: 'SCHEDULED',
      notes: 'Session 3 of 6 Soprano Titanium. Shaving completed at home.',
      source: 'WHATSAPP_AI',
    },
    {
      customerId: createdPatients[3].id, // Sneha Reddy
      serviceId: createdServices[5].id, // Botox
      staffId: drAnanya.id,
      scheduledAt: tomorrow10,
      durationMins: 30,
      status: 'SCHEDULED',
      notes: 'Allergan Botox forehead lines (approx 24 units). Dr. Ananya personal request.',
      source: 'VOICE_AI',
    },
    {
      customerId: createdPatients[4].id, // Vikram Malhotra
      serviceId: createdServices[7].id, // PRP Hair
      staffId: drAnanya.id,
      scheduledAt: tomorrow15,
      durationMins: 60,
      status: 'SCHEDULED',
      notes: 'GFC sitting 2. Blood draw to be done by Nurse Kavita 15 mins prior.',
      source: 'DASHBOARD',
    },
  ];

  for (const a of apptDefs) {
    await prisma.appointment.create({ data: { tenantId, ...a } });
  }
  console.log(`✅ Appointments created: ${apptDefs.length} clinical bookings`);

  // 6. Knowledge Base Documents & Chunks
  await prisma.knowledgeChunk.deleteMany({ where: { tenantId } });
  await prisma.knowledgeDocument.deleteMany({ where: { tenantId } });

  const doc1 = await prisma.knowledgeDocument.create({
    data: {
      tenantId,
      title: 'Aura Skin Clinic Master Clinical & Operations Guide',
      category: 'CLINICAL_OPERATIONS',
      sourceType: 'MANUAL',
      content: `AURA SKIN & AESTHETIC CLINIC — CLINICAL PRACTICE GUIDE
Lead Medical Director: Dr. Ananya Rao, MBBS, MD (Dermatology, Venereology & Leprosy — AIIMS Gold Medalist, 11+ years clinical dermatology & aesthetic experience).
Associate Physician: Dr. Priya Sharma, MBBS, DDVL (Aesthetic Cosmetologist & Laser Specialist, 7+ years experience).
Clinical Nurse: Kavita Menon, BSc Nursing (Senior Aesthetician).

LOCATION & ACCESS:
- Address: 2nd Floor, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038.
- Landmarks: Directly opposite Toit Brewpub, near Indiranagar Metro Station (Metro Pillar 124).
- Valet Parking: Complimentary valet parking available at ground level.
- Wheelchair Access: Elevator access directly to the 2nd-floor reception.

HOURS & TIMINGS:
- Monday to Saturday: 10:00 AM to 7:30 PM.
- Sunday: 11:00 AM to 4:00 PM (Appointments only).

CONSULTATION POLICY:
- Consultation Fee: ₹800 per visit.
- 7-Day Follow-Up Policy: Any follow-up consultation within 7 days of the initial visit is completely complimentary.
- Prescriptions: Digital prescriptions sent to patient WhatsApp immediately after consultation.`,
    },
  });

  const doc2 = await prisma.knowledgeDocument.create({
    data: {
      tenantId,
      title: 'Aura Clinic Complete Treatment Rate Card & Packages',
      category: 'RATE_CARD',
      sourceType: 'MANUAL',
      content: `AURA SKIN CLINIC TREATMENT RATE CARD & PACKAGES (2026):

1. HydraFacial Deluxe (Korean Glass Skin Glow):
- Single Session: ₹4,500 (45 minutes)
- Package of 3 Sessions: ₹11,999 (Save ₹1,500)
- Protocol: Deep vortex vacuum suction, Salicylic acid blackhead extraction, Glycolic acid peel, Hyaluronic acid infusion, and Collagen-boosting Medical Red/Blue LED light therapy.

2. Full Body Laser Hair Reduction (Soprano Titanium):
- Single Session: ₹14,999 (90 minutes)
- Package of 6 Sessions: ₹69,999 (Save ₹20,000)
- Technology: Painless Alma Soprano Titanium with triple-cluster diode wavelengths (755nm + 810nm + 1064nm) and continuous ICE Plus sapphire contact cooling. Safe and effective on all Indian skin tones (Fitzpatrick III-V).

3. Underarms Laser Hair Reduction:
- Single Session: ₹2,499 (20 minutes)
- Package of 6 Sessions: ₹11,999 (Save ₹3,000)

4. Chemical Peels (Acne, Glow & Pigmentation):
- Single Session: ₹2,800 (30 minutes)
- Package of 4 Sessions: ₹9,999 (Save ₹1,200)
- Formulations: Salicylic peel (for active inflammatory acne), Glycolic peel (for uneven pigmentation and melasma), and Mandelic peel (for sensitive skin).

5. Botox Anti-Wrinkle Treatment (Allergan USA):
- Price: ₹350 per unit
- Typical Requirements: Forehead horizontal lines (10-15 units), Crow's feet eye lines (10-16 units), Frown lines / Glabella (15-20 units). Total treatment typically ranges between ₹7,000 and ₹11,000. Administered exclusively by Dr. Ananya Rao MD.

6. Juvederm Dermal Fillers (Hyaluronic Acid):
- Price: ₹22,000 per 1ml syringe (Juvederm Ultra XC / Voluma)
- Applications: Natural lip volume, jawline contouring, chin projection, and deep smile line filling. Results last 12-18 months.

7. PRP Hair Therapy (GFC Growth Factor Concentrate):
- Single Session: ₹5,000 (60 minutes)
- Package of 4 Sessions: ₹17,500 (Save ₹2,500)
- Protocol: Autologous growth factors concentrated in sterile centrifuge tubes, injected into the scalp dermis to stimulate dormant follicles and halt male/female pattern hair loss.

8. Carbon Laser Peel (Hollywood Red Carpet Glow):
- Single Session: ₹3,800 (45 minutes)
- Package of 3 Sessions: ₹9,999
- Protocol: Liquid medical carbon applied to skin, then vaporized using Q-switched Nd:YAG laser to unclog pores, reduce sebum production, and provide instant glow with zero downtime.`,
    },
  });

  const doc3 = await prisma.knowledgeDocument.create({
    data: {
      tenantId,
      title: 'Pre-Procedure & Post-Procedure Clinical Instructions',
      category: 'PATIENT_AFTERCARE',
      sourceType: 'MANUAL',
      content: `CLINICAL AFTERCARE & SAFETY INSTRUCTIONS:

PRE-PROCEDURE PREPARATION:
- Laser Hair Reduction: Shave the treatment area 24 hours prior. Do NOT wax, pluck, or thread for 3 weeks before laser. Avoid active tanning or bleached skin.
- Chemical Peels & HydraFacials: Discontinue active topical retinoids, tretinoin, AHA/BHA exfoliants, and benzoyl peroxide 48 hours before the procedure.
- Botox & Dermal Fillers: Avoid blood-thinning supplements (aspirin, Vitamin E, fish oil, ginkgo biloba) and alcohol for 24 hours prior to minimize bruising risk.

POST-PROCEDURE AFTERCARE:
- Laser Hair Removal: Mild erythema (redness) is normal and resolves within 2-4 hours. Apply soothing aloe vera gel. Do not take hot showers, saunas, or engage in vigorous gym exercise for 24 hours. Always apply broad-spectrum SPF 50+ sunscreen.
- Chemical Peels: Do not scratch, pick, or peel flaking skin. Use a gentle sulfate-free cleanser and intensive barrier repair ceramide moisturizer. Avoid direct sun exposure for 7 days.
- Botox / Fillers: Keep head upright for 4 hours post-injection. Avoid vigorous exercise, facial massages, or sleeping face-down for 24 hours.

EMERGENCY PROTOCOL:
- If a patient experiences severe swelling, difficulty swallowing, or sudden visual disturbances after an injectable, advise emergency hospital transfer immediately or dial 108/112.`,
    },
  });

  // Chunks for each document
  const chunksData = [
    {
      documentId: doc1.id,
      chunkText: `Aura Skin & Aesthetic Clinic is located at 2nd Floor, 100 Feet Road, Indiranagar, Bengaluru, opposite Toit Brewpub, near Metro Pillar 124. Valet parking and elevator access are available. Clinic hours are Monday to Saturday 10:00 AM to 7:30 PM, and Sunday 11:00 AM to 4:00 PM. Consultation fee with Dr. Ananya Rao MD (AIIMS Gold Medalist) is ₹800, which includes a complimentary 7-day follow-up.`,
      chunkIndex: 0,
    },
    {
      documentId: doc1.id,
      chunkText: `Our medical team is led by Dr. Ananya Rao, MBBS, MD (Dermatology, Venereology & Leprosy — AIIMS Gold Medalist) with 11+ years of clinical experience specializing in aesthetic injectables and advanced lasers. Dr. Priya Sharma, MBBS, DDVL, is our senior aesthetician specializing in Soprano Titanium laser hair removal and clinical peels. Nurse Kavita Menon leads Korean HydraFacial treatments.`,
      chunkIndex: 1,
    },
    {
      documentId: doc2.id,
      chunkText: `HydraFacial Deluxe costs ₹4,500 per session (package of 3 for ₹11,999). It is a 45-minute 7-step Korean glass skin glow protocol that includes vacuum vortex extraction, glycolic exfoliation, salicylic blackhead cleansing, antioxidant peptide infusion, and medical LED therapy. It is completely painless with zero downtime.`,
      chunkIndex: 0,
    },
    {
      documentId: doc2.id,
      chunkText: `Full Body Laser Hair Reduction with Alma Soprano Titanium costs ₹14,999 per session (package of 6 for ₹69,999). Underarms laser is ₹2,499 per session (package of 6 for ₹11,999). Soprano Titanium uses triple-wavelength technology (755nm, 810nm, 1064nm) with ICE Plus sapphire contact cooling, making it virtually painless and safe for Indian skin types.`,
      chunkIndex: 1,
    },
    {
      documentId: doc2.id,
      chunkText: `Botox Anti-Wrinkle Treatment (Allergan USA) is ₹350 per unit. Forehead lines take 10-15 units, crow's feet take 10-16 units, and frown lines take 15-20 units. Total treatment ranges from ₹7,000 to ₹11,000. Juvederm Dermal Fillers are ₹22,000 per 1ml syringe for lips, cheeks, and smile lines. All injectables are administered exclusively by Dr. Ananya Rao MD.`,
      chunkIndex: 2,
    },
    {
      documentId: doc2.id,
      chunkText: `PRP Hair Therapy with Growth Factor Concentrate (GFC) is ₹5,000 per session (package of 4 for ₹17,500). It uses concentrated autologous growth factors to halt hair loss and stimulate new hair growth. Carbon Laser Peel (Hollywood Red Carpet Glow) is ₹3,800 per session (package of 3 for ₹9,999) for pore tightening, blackhead reduction, and instant glow. Medical Chemical Peels for acne and dark spots are ₹2,800 per session (package of 4 for ₹9,999).`,
      chunkIndex: 3,
    },
    {
      documentId: doc3.id,
      chunkText: `Pre-procedure instructions: For laser hair removal, shave 24 hours prior and avoid waxing or plucking. For chemical peels and HydraFacials, stop retinoids, tretinoin, and AHA/BHA 48 hours before. Post-procedure care: Apply soothing aloe vera or prescribed moisturizer and broad-spectrum SPF 50+ sunscreen. Avoid hot saunas and direct sun exposure. In case of acute medical emergencies, call 108/112 or visit the nearest emergency room.`,
      chunkIndex: 0,
    },
  ];

  for (const chunk of chunksData) {
    await prisma.knowledgeChunk.create({
      data: {
        tenantId,
        documentId: chunk.documentId,
        chunkText: chunk.chunkText,
        chunkIndex: chunk.chunkIndex,
      },
    });
  }
  console.log(`✅ Knowledge Base created: 3 documents, ${chunksData.length} calibrated clinical chunks`);

  await prisma['$disconnect']();
  console.log('🎉 Aura Skin & Aesthetic Clinic seeding completed successfully!');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
