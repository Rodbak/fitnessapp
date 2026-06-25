import { db, User, Member, Trainer, Subscription, ProgressEntry, Notification } from "./db";

function id() {
  return Math.random().toString(36).slice(2, 10);
}

export function seedIfEmpty() {
  const users = db.users.getAll();
  if (users.length > 0) return;

  const ownerId = id();
  const trainer1Id = id();
  const trainer2Id = id();
  const member1Id = id();
  const member2Id = id();
  const member3Id = id();

  const newUsers: User[] = [
    { id: ownerId, phone: "1111111111", password: "admin123", name: "Alex Owner", role: "owner", createdAt: "2024-01-01" },
    { id: trainer1Id, phone: "2222222222", password: "train123", name: "Jordan Fit", role: "trainer", createdAt: "2024-01-05" },
    { id: trainer2Id, phone: "3333333333", password: "train456", name: "Sam Strong", role: "trainer", createdAt: "2024-02-01" },
    { id: member1Id, phone: "4444444444", password: "mem123", name: "Riley Chase", role: "member", createdAt: "2024-03-01" },
    { id: member2Id, phone: "5555555555", password: "mem456", name: "Morgan Lee", role: "member", createdAt: "2024-04-01" },
    { id: member3Id, phone: "6666666666", password: "mem789", name: "Casey Blake", role: "member", createdAt: "2024-05-01" },
  ];

  const tId1 = id();
  const tId2 = id();
  const newTrainers: Trainer[] = [
    { id: tId1, userId: trainer1Id, name: "Jordan Fit", phone: "2222222222", specialization: "Strength & Conditioning", status: "active", joinDate: "2024-01-05", memberCount: 2 },
    { id: tId2, userId: trainer2Id, name: "Sam Strong", phone: "3333333333", specialization: "Cardio & Yoga", status: "active", joinDate: "2024-02-01", memberCount: 1 },
  ];

  const mId1 = id();
  const mId2 = id();
  const mId3 = id();
  const newMembers: Member[] = [
    { id: mId1, userId: member1Id, name: "Riley Chase", phone: "4444444444", email: "riley@example.com", status: "active", joinDate: "2024-03-01", trainerId: tId1 },
    { id: mId2, userId: member2Id, name: "Morgan Lee", phone: "5555555555", email: "morgan@example.com", status: "active", joinDate: "2024-04-01", trainerId: tId1 },
    { id: mId3, userId: member3Id, name: "Casey Blake", phone: "6666666666", email: "casey@example.com", status: "inactive", joinDate: "2024-05-01", trainerId: tId2 },
  ];

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());

  const newSubs: Subscription[] = [
    { id: id(), memberId: mId1, plan: "monthly", amount: 50, status: "active", startDate: fmt(today), endDate: fmt(addMonths(today, 1)), paidDate: fmt(today) },
    { id: id(), memberId: mId2, plan: "quarterly", amount: 130, status: "active", startDate: fmt(today), endDate: fmt(addMonths(today, 3)), paidDate: fmt(today) },
    { id: id(), memberId: mId3, plan: "monthly", amount: 50, status: "expired", startDate: fmt(addMonths(today, -2)), endDate: fmt(addMonths(today, -1)) },
  ];

  const newProgress: ProgressEntry[] = [
    { id: id(), memberId: mId1, date: "2024-03-01", weight: 185, bodyFat: 22, chest: 40, waist: 34, benchPress: 135, squat: 185 },
    { id: id(), memberId: mId1, date: "2024-04-01", weight: 180, bodyFat: 20, chest: 40.5, waist: 33, benchPress: 155, squat: 205 },
    { id: id(), memberId: mId1, date: "2024-05-01", weight: 176, bodyFat: 18, chest: 41, waist: 32, benchPress: 175, squat: 225 },
    { id: id(), memberId: mId2, date: "2024-04-01", weight: 140, bodyFat: 25, waist: 30, squat: 95 },
    { id: id(), memberId: mId2, date: "2024-05-01", weight: 137, bodyFat: 23, waist: 29, squat: 115 },
  ];

  const newNotifs: Notification[] = [
    { id: id(), userId: ownerId, title: "New Member", message: "Riley Chase just joined City's Fitness!", type: "success", read: false, createdAt: new Date().toISOString() },
    { id: id(), userId: ownerId, title: "Subscription Expired", message: "Casey Blake's subscription expired last month.", type: "warning", read: false, createdAt: new Date().toISOString() },
    { id: id(), userId: member1Id, title: "Welcome!", message: "Welcome to City's Fitness, Riley! Your trainer Jordan Fit will reach out soon.", type: "success", read: false, createdAt: new Date().toISOString() },
  ];

  db.users.save(newUsers);
  db.trainers.save(newTrainers);
  db.members.save(newMembers);
  db.subscriptions.save(newSubs);
  db.progress.save(newProgress);
  db.notifications.save(newNotifs);
}
