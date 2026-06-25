import { db, User, Member, Trainer, Subscription, ProgressEntry, Notification } from "./db";

function id() { return Math.random().toString(36).slice(2, 10); }
const fmt = (d: Date) => d.toISOString().split("T")[0];
const ago = (days: number) => { const d = new Date(); d.setDate(d.getDate() - days); return d; };
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());

export function seedIfEmpty() {
  const users = db.users.getAll();
  if (users.length > 0) return;

  // ---- User IDs ----
  const ownerId = id();
  const t1UserId = id(), t2UserId = id(), t3UserId = id();
  const m1u = id(), m2u = id(), m3u = id(), m4u = id(), m5u = id(),
        m6u = id(), m7u = id(), m8u = id(), m9u = id(), m10u = id(), m11u = id(), m12u = id();

  const newUsers: User[] = [
    { id: ownerId,   phone: "1111111111", password: "admin123", name: "Alex Carter",   role: "owner",   createdAt: "2024-01-01" },
    { id: t1UserId,  phone: "2222222222", password: "train123", name: "Jordan Reyes",  role: "trainer", createdAt: "2024-01-05" },
    { id: t2UserId,  phone: "3333333333", password: "train456", name: "Sam Torres",    role: "trainer", createdAt: "2024-02-01" },
    { id: t3UserId,  phone: "7777777777", password: "train789", name: "Dana Mills",    role: "trainer", createdAt: "2024-03-10" },
    { id: m1u,  phone: "4444444444", password: "mem123",  name: "Riley Chase",    role: "member", createdAt: "2024-03-01" },
    { id: m2u,  phone: "5555555555", password: "mem456",  name: "Morgan Lee",     role: "member", createdAt: "2024-03-15" },
    { id: m3u,  phone: "6666666666", password: "mem789",  name: "Casey Blake",    role: "member", createdAt: "2024-04-01" },
    { id: m4u,  phone: "8888888888", password: "mem000",  name: "Taylor Kim",     role: "member", createdAt: "2024-04-10" },
    { id: m5u,  phone: "9999999999", password: "mem111",  name: "Avery Stone",    role: "member", createdAt: "2024-05-01" },
    { id: m6u,  phone: "1010101010", password: "mem222",  name: "Drew Parker",    role: "member", createdAt: "2024-05-20" },
    { id: m7u,  phone: "1212121212", password: "mem333",  name: "Quinn Foster",   role: "member", createdAt: "2024-06-01" },
    { id: m8u,  phone: "1313131313", password: "mem444",  name: "Blake Rivera",   role: "member", createdAt: "2024-06-10" },
    { id: m9u,  phone: "1414141414", password: "mem555",  name: "Skyler James",   role: "member", createdAt: "2024-07-01" },
    { id: m10u, phone: "1515151515", password: "mem666",  name: "Rowan Murphy",   role: "member", createdAt: "2024-08-01" },
    { id: m11u, phone: "1616161616", password: "mem777",  name: "Finley Cross",   role: "member", createdAt: "2025-01-15" },
    { id: m12u, phone: "1717171717", password: "mem888",  name: "Sage Coleman",   role: "member", createdAt: "2025-03-01" },
  ];

  // ---- Trainer records ----
  const tId1 = id(), tId2 = id(), tId3 = id();
  const newTrainers: Trainer[] = [
    { id: tId1, userId: t1UserId, name: "Jordan Reyes", phone: "2222222222", email: "jordan@citysfitness.com", specialization: "Strength & Conditioning", status: "active", joinDate: "2024-01-05", memberCount: 5 },
    { id: tId2, userId: t2UserId, name: "Sam Torres",   phone: "3333333333", email: "sam@citysfitness.com",    specialization: "Cardio & HIIT",           status: "active", joinDate: "2024-02-01", memberCount: 4 },
    { id: tId3, userId: t3UserId, name: "Dana Mills",   phone: "7777777777", email: "dana@citysfitness.com",   specialization: "Yoga & Mobility",         status: "active", joinDate: "2024-03-10", memberCount: 3 },
  ];

  // ---- Member records ----
  const mId1 = id(), mId2 = id(), mId3 = id(), mId4 = id(), mId5 = id(), mId6 = id(),
        mId7 = id(), mId8 = id(), mId9 = id(), mId10 = id(), mId11 = id(), mId12 = id();

  const newMembers: Member[] = [
    { id: mId1,  userId: m1u,  name: "Riley Chase",  phone: "4444444444", email: "riley@mail.com",  status: "active",    joinDate: "2024-03-01", trainerId: tId1, emergencyContact: "5550001111" },
    { id: mId2,  userId: m2u,  name: "Morgan Lee",   phone: "5555555555", email: "morgan@mail.com", status: "active",    joinDate: "2024-03-15", trainerId: tId1, emergencyContact: "5550002222" },
    { id: mId3,  userId: m3u,  name: "Casey Blake",  phone: "6666666666", email: "casey@mail.com",  status: "inactive",  joinDate: "2024-04-01", trainerId: tId2 },
    { id: mId4,  userId: m4u,  name: "Taylor Kim",   phone: "8888888888", email: "taylor@mail.com", status: "active",    joinDate: "2024-04-10", trainerId: tId1 },
    { id: mId5,  userId: m5u,  name: "Avery Stone",  phone: "9999999999", email: "avery@mail.com",  status: "active",    joinDate: "2024-05-01", trainerId: tId2, emergencyContact: "5550005555" },
    { id: mId6,  userId: m6u,  name: "Drew Parker",  phone: "1010101010", email: "drew@mail.com",   status: "active",    joinDate: "2024-05-20", trainerId: tId2 },
    { id: mId7,  userId: m7u,  name: "Quinn Foster", phone: "1212121212", email: "quinn@mail.com",  status: "active",    joinDate: "2024-06-01", trainerId: tId3 },
    { id: mId8,  userId: m8u,  name: "Blake Rivera", phone: "1313131313", email: "blake@mail.com",  status: "suspended", joinDate: "2024-06-10", trainerId: tId1 },
    { id: mId9,  userId: m9u,  name: "Skyler James", phone: "1414141414", email: "skyler@mail.com", status: "active",    joinDate: "2024-07-01", trainerId: tId3 },
    { id: mId10, userId: m10u, name: "Rowan Murphy",  phone: "1515151515", email: "rowan@mail.com",  status: "active",    joinDate: "2024-08-01", trainerId: tId2 },
    { id: mId11, userId: m11u, name: "Finley Cross",  phone: "1616161616", email: "finley@mail.com", status: "active",    joinDate: "2025-01-15", trainerId: tId3 },
    { id: mId12, userId: m12u, name: "Sage Coleman",  phone: "1717171717", email: "sage@mail.com",   status: "active",    joinDate: "2025-03-01", trainerId: tId1 },
  ];

  // ---- Subscriptions ----
  const today = new Date();
  const newSubs: Subscription[] = [
    // Active members - varied plans
    { id: id(), memberId: mId1,  plan: "annual",    amount: 480, status: "active",  startDate: fmt(ago(120)), endDate: fmt(addDays(ago(120), 365)), paidDate: fmt(ago(120)), notes: "Paid upfront" },
    { id: id(), memberId: mId2,  plan: "quarterly", amount: 130, status: "active",  startDate: fmt(ago(30)),  endDate: fmt(addMonths(ago(30), 3)),  paidDate: fmt(ago(30)) },
    { id: id(), memberId: mId4,  plan: "monthly",   amount: 50,  status: "active",  startDate: fmt(ago(10)),  endDate: fmt(addMonths(ago(10), 1)),  paidDate: fmt(ago(10)) },
    { id: id(), memberId: mId5,  plan: "quarterly", amount: 130, status: "active",  startDate: fmt(ago(45)),  endDate: fmt(addMonths(ago(45), 3)),  paidDate: fmt(ago(45)) },
    { id: id(), memberId: mId6,  plan: "monthly",   amount: 50,  status: "active",  startDate: fmt(ago(5)),   endDate: fmt(addMonths(ago(5), 1)),   paidDate: fmt(ago(5)) },
    { id: id(), memberId: mId7,  plan: "annual",    amount: 480, status: "active",  startDate: fmt(ago(60)),  endDate: fmt(addDays(ago(60), 365)),  paidDate: fmt(ago(60)) },
    { id: id(), memberId: mId9,  plan: "monthly",   amount: 50,  status: "active",  startDate: fmt(ago(25)),  endDate: fmt(addMonths(ago(25), 1)),  paidDate: fmt(ago(25)), notes: "Expiring soon" },
    { id: id(), memberId: mId10, plan: "quarterly", amount: 130, status: "active",  startDate: fmt(ago(15)),  endDate: fmt(addMonths(ago(15), 3)),  paidDate: fmt(ago(15)) },
    { id: id(), memberId: mId11, plan: "monthly",   amount: 50,  status: "active",  startDate: fmt(ago(20)),  endDate: fmt(addMonths(ago(20), 1)),  paidDate: fmt(ago(20)), notes: "First month" },
    { id: id(), memberId: mId12, plan: "quarterly", amount: 130, status: "active",  startDate: fmt(ago(3)),   endDate: fmt(addMonths(ago(3), 3)),   paidDate: fmt(ago(3)) },
    // Expired / inactive
    { id: id(), memberId: mId3,  plan: "monthly",   amount: 50,  status: "expired", startDate: fmt(ago(90)),  endDate: fmt(ago(60)) },
    { id: id(), memberId: mId8,  plan: "monthly",   amount: 50,  status: "expired", startDate: fmt(ago(70)),  endDate: fmt(ago(40)) },
    // Pending
    { id: id(), memberId: mId8,  plan: "monthly",   amount: 50,  status: "pending", startDate: fmt(today),    endDate: fmt(addMonths(today, 1)) },
    // Historical paid subs for revenue charts
    { id: id(), memberId: mId1,  plan: "monthly",   amount: 50,  status: "expired", startDate: fmt(ago(210)), endDate: fmt(ago(180)), paidDate: fmt(ago(210)) },
    { id: id(), memberId: mId2,  plan: "monthly",   amount: 50,  status: "expired", startDate: fmt(ago(180)), endDate: fmt(ago(150)), paidDate: fmt(ago(180)) },
    { id: id(), memberId: mId4,  plan: "monthly",   amount: 50,  status: "expired", startDate: fmt(ago(150)), endDate: fmt(ago(120)), paidDate: fmt(ago(150)) },
    { id: id(), memberId: mId5,  plan: "quarterly", amount: 130, status: "expired", startDate: fmt(ago(135)), endDate: fmt(ago(45)),  paidDate: fmt(ago(135)) },
    { id: id(), memberId: mId6,  plan: "monthly",   amount: 50,  status: "expired", startDate: fmt(ago(60)),  endDate: fmt(ago(30)),  paidDate: fmt(ago(60)) },
    { id: id(), memberId: mId9,  plan: "monthly",   amount: 50,  status: "expired", startDate: fmt(ago(55)),  endDate: fmt(ago(25)),  paidDate: fmt(ago(55)) },
  ];

  // ---- Progress entries ----
  const newProgress: ProgressEntry[] = [
    // Riley Chase — strong improvement arc
    { id: id(), memberId: mId1, date: fmt(ago(120)), weight: 195, bodyFat: 24, chest: 41, waist: 36, hips: 38, biceps: 14, benchPress: 135, squat: 185, deadlift: 225, notes: "First session. Feeling motivated!" },
    { id: id(), memberId: mId1, date: fmt(ago(90)),  weight: 190, bodyFat: 22, chest: 41, waist: 35, hips: 38, biceps: 14.5, benchPress: 155, squat: 205, deadlift: 245, notes: "Good month, diet on track" },
    { id: id(), memberId: mId1, date: fmt(ago(60)),  weight: 185, bodyFat: 20, chest: 41.5, waist: 34, hips: 37, biceps: 15, benchPress: 175, squat: 225, deadlift: 275, notes: "Hit new bench PR!" },
    { id: id(), memberId: mId1, date: fmt(ago(30)),  weight: 180, bodyFat: 18, chest: 42, waist: 33, hips: 37, biceps: 15.5, benchPress: 195, squat: 245, deadlift: 295, notes: "Feeling great, energy up" },
    { id: id(), memberId: mId1, date: fmt(ago(7)),   weight: 176, bodyFat: 16, chest: 42, waist: 32, hips: 36, biceps: 16, benchPress: 205, squat: 265, deadlift: 315, notes: "Best shape of my life" },

    // Morgan Lee
    { id: id(), memberId: mId2, date: fmt(ago(90)),  weight: 145, bodyFat: 28, waist: 32, hips: 40, biceps: 11, squat: 85, notes: "Starting journey" },
    { id: id(), memberId: mId2, date: fmt(ago(60)),  weight: 141, bodyFat: 26, waist: 31, hips: 39, biceps: 11.5, squat: 105 },
    { id: id(), memberId: mId2, date: fmt(ago(30)),  weight: 138, bodyFat: 24, waist: 30, hips: 38, biceps: 12, squat: 125, notes: "Cardio improving a lot" },
    { id: id(), memberId: mId2, date: fmt(ago(5)),   weight: 135, bodyFat: 22, waist: 29, hips: 37, biceps: 12, squat: 140, notes: "On a roll!" },

    // Taylor Kim
    { id: id(), memberId: mId4, date: fmt(ago(60)),  weight: 170, bodyFat: 19, benchPress: 145, squat: 195, deadlift: 245 },
    { id: id(), memberId: mId4, date: fmt(ago(30)),  weight: 168, bodyFat: 18, benchPress: 165, squat: 215, deadlift: 265, notes: "Solid progress" },
    { id: id(), memberId: mId4, date: fmt(ago(8)),   weight: 165, bodyFat: 17, benchPress: 185, squat: 235, deadlift: 285 },

    // Avery Stone
    { id: id(), memberId: mId5, date: fmt(ago(45)),  weight: 155, bodyFat: 26, waist: 31, benchPress: 95,  squat: 115 },
    { id: id(), memberId: mId5, date: fmt(ago(15)),  weight: 151, bodyFat: 24, waist: 30, benchPress: 115, squat: 135, notes: "HIIT sessions really helping" },

    // Quinn Foster
    { id: id(), memberId: mId7, date: fmt(ago(55)),  weight: 130, bodyFat: 22, waist: 27, hips: 36, biceps: 11 },
    { id: id(), memberId: mId7, date: fmt(ago(25)),  weight: 128, bodyFat: 20, waist: 26, hips: 35, biceps: 11.5, notes: "Yoga flexibility much better" },

    // Skyler James
    { id: id(), memberId: mId9, date: fmt(ago(20)),  weight: 178, bodyFat: 21, benchPress: 155, squat: 205, deadlift: 255 },
    { id: id(), memberId: mId9, date: fmt(ago(5)),   weight: 175, bodyFat: 19, benchPress: 175, squat: 225, deadlift: 275 },

    // Finley Cross
    { id: id(), memberId: mId11, date: fmt(ago(18)), weight: 160, bodyFat: 23, waist: 30, squat: 95, notes: "New member, eager to improve" },
    { id: id(), memberId: mId11, date: fmt(ago(4)),  weight: 158, bodyFat: 22, waist: 29, squat: 110 },
  ];

  // ---- Notifications ----
  const newNotifs: Notification[] = [
    { id: id(), userId: ownerId, title: "Subscription Expiring", message: "Skyler James's subscription expires in 5 days.", type: "warning", read: false, createdAt: ago(1).toISOString() },
    { id: id(), userId: ownerId, title: "New Member Joined",     message: "Sage Coleman just joined City's Fitness!", type: "success", read: false, createdAt: ago(3).toISOString() },
    { id: id(), userId: ownerId, title: "Payment Overdue",       message: "Blake Rivera has a pending subscription — follow up needed.", type: "warning", read: false, createdAt: ago(5).toISOString() },
    { id: id(), userId: ownerId, title: "Revenue Milestone",     message: "This month's revenue hit $1,080 — best month yet!", type: "success", read: false, createdAt: ago(7).toISOString() },
    { id: id(), userId: ownerId, title: "Member Inactive",       message: "Casey Blake has been inactive for 60+ days.", type: "info", read: false, createdAt: ago(10).toISOString() },
    // Member notifications
    { id: id(), userId: m1u, title: "Welcome to City's Fitness!", message: "Your trainer Jordan Reyes will reach out soon. Let's crush your goals!", type: "success", read: false, createdAt: ago(120).toISOString() },
    { id: id(), userId: m1u, title: "Progress Milestone",        message: "You've lost 19 lbs since joining — incredible work, Riley!", type: "success", read: false, createdAt: ago(7).toISOString() },
    { id: id(), userId: m2u, title: "Welcome!",                  message: "Welcome to City's Fitness, Morgan! Your journey starts now.", type: "success", read: false, createdAt: ago(90).toISOString() },
    { id: id(), userId: m9u, title: "Subscription Reminder",     message: "Your monthly subscription renews in 5 days. Make sure your info is up to date.", type: "warning", read: false, createdAt: ago(1).toISOString() },
  ];

  db.users.save(newUsers);
  db.trainers.save(newTrainers);
  db.members.save(newMembers);
  db.subscriptions.save(newSubs);
  db.progress.save(newProgress);
  db.notifications.save(newNotifs);
}
