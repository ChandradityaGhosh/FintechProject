import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const transporter = nodemailer.createTransport({ jsonTransport: true });

const db = {
  users: [
    { id: "u-admin", email: "admin@school.local", password: "admin123", role: "admin", linkedStudentId: null },
    { id: "u-teacher", email: "teacher@school.local", password: "teacher123", role: "teacher", linkedStudentId: null },
    { id: "u-guardian", email: "guardian@school.local", password: "guardian123", role: "guardian", linkedStudentId: "s-1" },
    { id: "u-student", email: "student@school.local", password: "student123", role: "student", linkedStudentId: "s-1" }
  ],
  students: [
    {
      id: "s-1",
      fullName: "Aarav Sharma",
      className: "Class 8-A",
      guardianName: "Priya Sharma",
      guardianEmail: "guardian@school.local",
      admissionDate: "2026-01-01",
      address: "Lake View Colony",
      monthlyFee: 3500,
      busStop: { lat: 22.5726, lng: 88.3639 }
    }
  ],
  charges: [
    { id: "c-1", studentId: "s-1", type: "monthly", amount: 3500, dueDate: "2026-03-05", month: "2026-03", status: "due" },
    { id: "c-2", studentId: "s-1", type: "misc", amount: 500, dueDate: "2026-03-10", month: null, status: "due" }
  ],
  bills: [],
  posts: [],
  groups: [
    { id: "g-1", name: "Class 8-A Parents", members: ["s-1"], createdBy: "u-admin" }
  ],
  promotions: [],
  buses: [
    { id: "bus-1", name: "Route 1", currentLocation: { lat: 22.57, lng: 88.36 }, speedKmph: 24, updatedAt: new Date().toISOString() }
  ],
  contactsOptIn: []
};

const issueToken = (user) => Buffer.from(`${user.id}:${user.role}`).toString("base64");

const auth = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Missing token" });

  let decoded;
  try {
    decoded = Buffer.from(token, "base64").toString("utf8");
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const [id, role] = decoded.split(":");
  const user = db.users.find((u) => u.id === id && u.role === role);
  if (!user) return res.status(401).json({ message: "Invalid user" });

  if (roles.length > 0 && !roles.includes(user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  req.user = user;
  next();
};

const toRad = (v) => (v * Math.PI) / 180;
const haversine = (a, b) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

async function sendEmail({ to, subject, text }) {
  await transporter.sendMail({ from: "noreply@school.local", to, subject, text });
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  return res.json({
    token: issueToken(user),
    role: user.role,
    userId: user.id,
    linkedStudentId: user.linkedStudentId
  });
});

app.get("/students", auth(["admin", "teacher"]), (_req, res) => res.json(db.students));

app.post("/students", auth(["admin"]), (req, res) => {
  const student = { id: uuid(), ...req.body };
  db.students.push(student);
  if (student.guardianEmail) {
    db.users.push({
      id: uuid(),
      email: student.guardianEmail,
      password: "changeme123",
      role: "guardian",
      linkedStudentId: student.id
    });
  }
  res.status(201).json(student);
});

app.get("/payments/status/:studentId", auth(["admin", "guardian", "student"]), (req, res) => {
  const studentId = req.params.studentId;
  if (["guardian", "student"].includes(req.user.role) && req.user.linkedStudentId !== studentId) {
    return res.status(403).json({ message: "Cannot view other students" });
  }

  const charges = db.charges.filter((c) => c.studentId === studentId);
  const totalDue = charges.filter((c) => c.status === "due").reduce((sum, c) => sum + c.amount, 0);
  const missedPayments = charges.filter((c) => c.status === "due" && new Date(c.dueDate) < new Date());
  const paid = charges.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);

  res.json({ charges, totalDue, paid, missedPayments });
});

app.post("/payments/collect", auth(["admin"]), async (req, res) => {
  const { studentId, chargeIds, paymentMethod = "cash" } = req.body;
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });

  const selectedCharges = db.charges.filter((c) => chargeIds.includes(c.id) && c.studentId === studentId);
  if (selectedCharges.length === 0) {
    return res.status(400).json({ message: "No matching charges" });
  }

  selectedCharges.forEach((charge) => {
    charge.status = "paid";
    charge.paidAt = new Date().toISOString();
  });

  const total = selectedCharges.reduce((sum, c) => sum + c.amount, 0);
  const bill = {
    id: uuid(),
    studentId,
    billNumber: `BILL-${Date.now()}`,
    charges: selectedCharges.map((c) => ({ id: c.id, type: c.type, amount: c.amount })),
    total,
    paymentMethod,
    paidAt: new Date().toISOString()
  };

  db.bills.push(bill);

  if (student.guardianEmail) {
    await sendEmail({
      to: student.guardianEmail,
      subject: `Payment confirmation ${bill.billNumber}`,
      text: `Payment of INR ${total} received for ${student.fullName}.`
    });
  }

  res.status(201).json(bill);
});

app.get("/bills/:studentId", auth(["admin", "guardian", "student"]), (req, res) => {
  const { studentId } = req.params;
  if (["guardian", "student"].includes(req.user.role) && req.user.linkedStudentId !== studentId) {
    return res.status(403).json({ message: "Cannot view other students" });
  }

  res.json(db.bills.filter((b) => b.studentId === studentId));
});

app.post("/posts", auth(["teacher"]), async (req, res) => {
  const post = {
    id: uuid(),
    teacherId: req.user.id,
    title: req.body.title,
    content: req.body.content,
    imageUrl: req.body.imageUrl || null,
    audienceType: req.body.audienceType,
    audience: req.body.audience || [],
    status: "pending",
    createdAt: new Date().toISOString(),
    comments: []
  };

  db.posts.push(post);

  await sendEmail({
    to: "admin@school.local",
    subject: `Post approval required: ${post.title}`,
    text: `A new post is pending approval for audience type ${post.audienceType}.`
  });

  res.status(201).json(post);
});

app.get("/posts", auth(["admin", "teacher", "guardian", "student"]), (req, res) => {
  if (req.user.role === "admin") return res.json(db.posts);
  if (req.user.role === "teacher") return res.json(db.posts.filter((p) => p.teacherId === req.user.id));

  const studentId = req.user.linkedStudentId;
  const visible = db.posts.filter((p) => {
    if (p.status !== "approved") return false;
    if (p.audienceType === "school") return true;
    if (p.audienceType === "class") {
      const student = db.students.find((s) => s.id === studentId);
      return student ? p.audience.includes(student.className) : false;
    }
    return p.audience.includes(studentId);
  });

  return res.json(visible);
});

app.post("/posts/:postId/approve", auth(["admin"]), async (req, res) => {
  const post = db.posts.find((p) => p.id === req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.status = "approved";
  post.approvedAt = new Date().toISOString();
  post.approvedBy = req.user.id;

  const teacher = db.users.find((u) => u.id === post.teacherId);
  if (teacher) {
    await sendEmail({
      to: teacher.email,
      subject: `Post approved: ${post.title}`,
      text: "Your post has been approved and is now visible to the selected audience."
    });
  }

  res.json(post);
});

app.post("/posts/:postId/comments", auth(["admin", "teacher", "guardian", "student"]), (req, res) => {
  const post = db.posts.find((p) => p.id === req.params.postId && p.status === "approved");
  if (!post) return res.status(404).json({ message: "Approved post not found" });

  post.comments.push({
    id: uuid(),
    userId: req.user.id,
    role: req.user.role,
    text: req.body.text,
    at: new Date().toISOString()
  });

  res.status(201).json(post);
});

app.get("/buses", auth(["admin", "guardian", "student"]), (req, res) => {
  const result = db.buses.map((bus) => {
    const studentId = req.user.linkedStudentId;
    const student = db.students.find((s) => s.id === studentId) || db.students[0];
    const distance = student?.busStop ? haversine(bus.currentLocation, student.busStop) : null;
    const etaMinutes = distance != null && bus.speedKmph > 0 ? Math.round((distance / bus.speedKmph) * 60) : null;
    return { ...bus, etaMinutes, distanceKm: distance ? Number(distance.toFixed(2)) : null };
  });

  res.json(result);
});

app.patch("/buses/:busId/location", auth(["admin"]), (req, res) => {
  const bus = db.buses.find((b) => b.id === req.params.busId);
  if (!bus) return res.status(404).json({ message: "Bus not found" });
  bus.currentLocation = req.body.currentLocation;
  bus.speedKmph = req.body.speedKmph ?? bus.speedKmph;
  bus.updatedAt = new Date().toISOString();
  res.json(bus);
});

app.get("/groups", auth(["admin", "guardian", "student"]), (_req, res) => res.json(db.groups));

app.post("/groups", auth(["admin"]), (req, res) => {
  const group = { id: uuid(), name: req.body.name, members: req.body.members || [], createdBy: req.user.id };
  db.groups.push(group);
  res.status(201).json(group);
});

app.post("/promotions", auth(["admin"]), (req, res) => {
  const promo = {
    id: uuid(),
    title: req.body.title,
    description: req.body.description,
    rewardType: req.body.rewardType,
    rewardValue: req.body.rewardValue,
    imageUrl: req.body.imageUrl || null,
    startsAt: req.body.startsAt,
    endsAt: req.body.endsAt,
    couponCode: req.body.couponCode || null,
    active: true
  };
  db.promotions.push(promo);
  res.status(201).json(promo);
});

app.get("/promotions", auth(["admin", "guardian", "student"]), (_req, res) => {
  res.json(db.promotions.filter((p) => p.active));
});

app.post("/contacts/consent-upload", auth(["guardian", "student"]), (req, res) => {
  const { contacts, consentGranted } = req.body;
  if (!consentGranted) {
    return res.status(400).json({
      message: "Contact sharing requires explicit opt-in consent."
    });
  }

  db.contactsOptIn.push({
    id: uuid(),
    userId: req.user.id,
    linkedStudentId: req.user.linkedStudentId,
    contacts,
    sharedAt: new Date().toISOString()
  });

  res.status(201).json({ message: "Contacts shared with consent" });
});

app.listen(PORT, () => {
  console.log(`School backend running on http://localhost:${PORT}`);
});
