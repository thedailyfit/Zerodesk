const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const tenantId = '08f1fadd-59eb-4d07-9ee3-65a2d9a321e3';
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  console.log('Target Tenant:', tenant.name, tenant.id);

  const services = await prisma.service.findMany({ where: { tenantId } });
  console.log(`\n--- SERVICES (${services.length}) ---`);
  services.forEach(s => console.log(` - ${s.name}: ₹${s.price} (${s.durationMins}m, ${s.category})`));

  const staff = await prisma.staffMember.findMany({ where: { tenantId } });
  console.log(`\n--- STAFF (${staff.length}) ---`);
  staff.forEach(s => console.log(` - ${s.name} (${s.roleTitle || 'Staff'}, ${s.specialization || 'General'})`));

  const customers = await prisma.customer.findMany({ where: { tenantId } });
  console.log(`\n--- CUSTOMERS (${customers.length}) ---`);
  customers.forEach(c => console.log(` - ${c.name}: ${c.phone} (Score: ${c.leadScore}, ${c.aiSummary || 'No notes'})`));

  const appointments = await prisma.appointment.findMany({
    where: { tenantId },
    include: { customer: true, service: true, staff: true },
    orderBy: { scheduledAt: 'desc' },
    take: 10,
  });
  console.log(`\n--- APPOINTMENTS (${appointments.length}) ---`);
  appointments.forEach(a => console.log(` - [${a.status}] ${a.customer?.name} with ${a.staff?.name || 'Any'} for ${a.service?.name} on ${a.scheduledAt.toISOString()}`));

  const docs = await prisma.knowledgeDocument.findMany({ where: { tenantId } });
  console.log(`\n--- KNOWLEDGE DOCS (${docs.length}) ---`);
  docs.forEach(d => console.log(` - [${d.category}] ${d.title}`));

  const chunksCount = await prisma.knowledgeChunk.count({ where: { tenantId } });
  console.log(`\n--- KNOWLEDGE CHUNKS COUNT: ${chunksCount} ---`);

  await prisma['$disconnect']();
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
