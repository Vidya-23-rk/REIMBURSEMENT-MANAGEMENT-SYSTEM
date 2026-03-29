import { PrismaClient, Role, RuleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── 1. Create Company ──────────────────────────────
  const company = await prisma.company.create({
    data: {
      name: 'TechCorp Solutions',
      country: 'India',
      currency: 'INR',
    },
  });
  console.log(`✅ Company created: ${company.name} (${company.currency})`);

  // ─── 2. Create Admin ────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Admin User',
      email: 'admin@techcorp.com',
      passwordHash: adminPassword,
      role: Role.admin,
      isManagerApprover: false,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ─── 3. Create Manager (isManagerApprover = true) ───
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Priya Sharma',
      email: 'priya@techcorp.com',
      passwordHash: managerPassword,
      role: Role.manager,
      isManagerApprover: true,
    },
  });
  console.log(`✅ Manager created: ${manager.email} (isManagerApprover: true)`);

  // ─── 4. Create Finance Approver (Manager role) ──────
  const financePassword = await bcrypt.hash('finance123', 12);
  const financeApprover = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Rahul Mehta',
      email: 'rahul@techcorp.com',
      passwordHash: financePassword,
      role: Role.manager,
      isManagerApprover: false,
    },
  });
  console.log(`✅ Finance Approver created: ${financeApprover.email}`);

  // ─── 5. Create Director (Manager role) ──────────────
  const directorPassword = await bcrypt.hash('director123', 12);
  const director = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Anita Desai',
      email: 'anita@techcorp.com',
      passwordHash: directorPassword,
      role: Role.manager,
      isManagerApprover: false,
    },
  });
  console.log(`✅ Director created: ${director.email}`);

  // ─── 6. Create Employees ────────────────────────────
  const empPassword = await bcrypt.hash('employee123', 12);

  const emp1 = await prisma.user.create({
    data: {
      companyId: company.id,
      managerId: manager.id,
      name: 'Amit Kumar',
      email: 'amit@techcorp.com',
      passwordHash: empPassword,
      role: Role.employee,
    },
  });
  console.log(`✅ Employee created: ${emp1.email} (manager: ${manager.name})`);

  const emp2 = await prisma.user.create({
    data: {
      companyId: company.id,
      managerId: manager.id,
      name: 'Sneha Patel',
      email: 'sneha@techcorp.com',
      passwordHash: empPassword,
      role: Role.employee,
    },
  });
  console.log(`✅ Employee created: ${emp2.email} (manager: ${manager.name})`);

  // ─── 7. Create Approval Rule with 3 Steps ──────────
  // Hybrid rule: auto-approve if 60% approve OR Finance (key approver) approves
  const rule = await prisma.approvalRule.create({
    data: {
      companyId: company.id,
      name: 'Standard Approval Chain',
      ruleType: RuleType.hybrid,
      percentageThreshold: 60,
      active: true,
      approvalSteps: {
        create: [
          {
            approverId: manager.id,
            stepOrder: 1,
            isKeyApprover: false,
          },
          {
            approverId: financeApprover.id,
            stepOrder: 2,
            isKeyApprover: true, // Finance is key approver
          },
          {
            approverId: director.id,
            stepOrder: 3,
            isKeyApprover: false,
          },
        ],
      },
    },
    include: { approvalSteps: true },
  });
  console.log(`✅ Approval Rule created: "${rule.name}" with ${rule.approvalSteps.length} steps`);
  console.log(`   → Step 1: ${manager.name}, Step 2: ${financeApprover.name} (Key), Step 3: ${director.name}`);

  // ─── 8. Create a High-Value Rule ────────────────────
  const highValueRule = await prisma.approvalRule.create({
    data: {
      companyId: company.id,
      name: 'High-Value Expense Rule',
      minAmount: 50000,
      ruleType: RuleType.none, // All must approve
      active: true,
      approvalSteps: {
        create: [
          {
            approverId: financeApprover.id,
            stepOrder: 1,
            isKeyApprover: false,
          },
          {
            approverId: director.id,
            stepOrder: 2,
            isKeyApprover: false,
          },
          {
            approverId: admin.id,
            stepOrder: 3,
            isKeyApprover: false,
          },
        ],
      },
    },
    include: { approvalSteps: true },
  });
  console.log(`✅ High-Value Rule created: "${highValueRule.name}" (min: ₹50,000, all must approve)`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('──────────────────────────────────────────');
  console.log('  Login Credentials:');
  console.log('──────────────────────────────────────────');
  console.log('  Admin:    admin@techcorp.com    / admin123');
  console.log('  Manager:  priya@techcorp.com    / manager123');
  console.log('  Finance:  rahul@techcorp.com    / finance123');
  console.log('  Director: anita@techcorp.com    / director123');
  console.log('  Employee: amit@techcorp.com     / employee123');
  console.log('  Employee: sneha@techcorp.com    / employee123');
  console.log('──────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
