/**
 * Automated Verification Script for CampusConnect
 * Tests all workflows: Authentication, Student, Staff, Admin, Timeline, Notifications, Permissions, Filters, CSV Export.
 */
const API_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('🧪 Starting CampusConnect End-to-End Workflow Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, desc) => {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return { token: data.token, user: data.user };
  };

  try {
    // 1. Authenticate all 3 roles
    console.log('1️⃣ Authenticating Student, Staff, and Admin...');
    const admin = await login('admin@campus.edu', 'admin123');
    const staff = await login('staff@campus.edu', 'staff123');
    const student = await login('student@campus.edu', 'student123');

    assert(admin.user.role === 'admin', 'Admin authenticated with role "admin"');
    assert(staff.user.role === 'staff', 'Staff authenticated with role "staff"');
    assert(student.user.role === 'student', 'Student authenticated with role "student"');

    // 2. Student Complaint Workflow
    console.log('\n2️⃣ Testing Student Complaint Submission & Isolation...');
    const newComplaintRes = await fetch(`${API_URL}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student.token}`,
      },
      body: JSON.stringify({
        title: 'Water leakage in Dorm B 3rd floor',
        description: 'Persistent pipe leak causing water accumulation near stairs.',
        category: 'infrastructure',
      }),
    });
    const newComplaint = await newComplaintRes.json();
    assert(newComplaintRes.status === 201 && newComplaint._id, 'Student created a new complaint');

    // Verify student /api/complaints/my returns their complaints
    const studentMyRes = await fetch(`${API_URL}/api/complaints/my`, {
      headers: { Authorization: `Bearer ${student.token}` },
    });
    const studentMy = await studentMyRes.json();
    assert(
      Array.isArray(studentMy) && studentMy.some((c) => c._id === newComplaint._id),
      'Student sees own new complaint in /api/complaints/my'
    );
    assert(
      studentMy.every((c) => c.createdBy === student.user._id || c.createdBy?._id === student.user._id),
      'Student only sees their own complaints (isolation confirmed)'
    );

    // 3. Notification delivery for new complaint
    console.log('\n3️⃣ Testing Notifications on Complaint Submission...');
    const adminNotifRes = await fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    const adminNotifs = await adminNotifRes.json();
    assert(
      adminNotifs.some((n) => n.complaintId === newComplaint._id && n.type === 'complaint_submitted'),
      'Admin received notification for newly submitted complaint'
    );

    // Verify student cannot see admin's notification
    const studentNotifRes = await fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${student.token}` },
    });
    const studentNotifs = await studentNotifRes.json();
    assert(
      studentNotifs.every((n) => n.recipientId === student.user._id),
      'Notifications are strictly isolated to the authenticated recipient'
    );

    // 4. Admin Assignment Workflow & Timeline
    console.log('\n4️⃣ Testing Admin Assignment & Activity Timeline...');
    const assignRes = await fetch(`${API_URL}/api/complaints/${newComplaint._id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({ assignedTo: staff.user._id }),
    });
    assert(assignRes.ok, 'Admin successfully assigned complaint to staff member');

    // Staff receives assignment notification
    const staffNotifRes = await fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${staff.token}` },
    });
    const staffNotifs = await staffNotifRes.json();
    const assignmentNotif = staffNotifs.find(
      (n) => n.complaintId === newComplaint._id && n.type === 'complaint_assigned'
    );
    assert(!!assignmentNotif, 'Assigned staff member received complaint_assigned notification');

    // 5. Staff Visibility & Workflow
    console.log('\n5️⃣ Testing Staff Access, Filtering & Status Updates...');
    const staffAllRes = await fetch(`${API_URL}/api/complaints/all`, {
      headers: { Authorization: `Bearer ${staff.token}` },
    });
    const staffComplaints = await staffAllRes.json();
    assert(
      staffComplaints.some((c) => c._id === newComplaint._id),
      'Staff sees newly assigned complaint in /api/complaints/all'
    );
    assert(
      staffComplaints.every(
        (c) =>
          c.assignedTo?._id === staff.user._id ||
          c.assignedTo === staff.user._id ||
          c.createdBy?._id === staff.user._id ||
          c.createdBy === staff.user._id
      ),
      'Staff only sees complaints assigned to them or created by them'
    );

    // Staff updates status to in-progress
    const staffStatusRes = await fetch(`${API_URL}/api/complaints/${newComplaint._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staff.token}`,
      },
      body: JSON.stringify({ status: 'in-progress' }),
    });
    assert(staffStatusRes.ok, 'Staff successfully updated status to "in-progress"');

    // 6. Comments & Discussion
    console.log('\n6️⃣ Testing Comments & Activity Timeline Events...');
    const commentRes = await fetch(`${API_URL}/api/comments/${newComplaint._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staff.token}`,
      },
      body: JSON.stringify({ message: 'Plumber dispatched, working on repair.' }),
    });
    assert(commentRes.status === 201, 'Staff posted a comment on the complaint');

    // Check timeline events on complaint details
    const detailsRes = await fetch(`${API_URL}/api/complaints/${newComplaint._id}`, {
      headers: { Authorization: `Bearer ${student.token}` },
    });
    const details = await detailsRes.json();
    const eventTypes = details.timeline.map((e) => e.type);
    assert(eventTypes.includes('created'), 'Timeline includes "created" event');
    assert(eventTypes.includes('assigned'), 'Timeline includes "assigned" event');
    assert(eventTypes.includes('comment_added'), 'Timeline includes "comment_added" event');

    // 7. Security: Unauthorized Access Prevention
    console.log('\n7️⃣ Testing Security & Permission Boundaries...');
    // Create another student to test cross-student isolation
    const student2Res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Student',
        email: `student2_${Date.now()}@campus.edu`,
        password: 'password123',
        role: 'student',
        department: 'Physics',
      }),
    });
    const student2 = await student2Res.json();

    const unauthorizedDetail = await fetch(`${API_URL}/api/complaints/${newComplaint._id}`, {
      headers: { Authorization: `Bearer ${student2.token}` },
    });
    assert(
      unauthorizedDetail.status === 403,
      'Unrelated student is blocked from viewing another student complaint (HTTP 403)'
    );

    const unauthorizedAll = await fetch(`${API_URL}/api/complaints/all`, {
      headers: { Authorization: `Bearer ${student2.token}` },
    });
    assert(
      unauthorizedAll.status === 403,
      'Student is blocked from accessing /api/complaints/all (HTTP 403)'
    );

    const unauthorizedStats = await fetch(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${student2.token}` },
    });
    assert(
      unauthorizedStats.status === 403,
      'Student is blocked from accessing /api/admin/stats (HTTP 403)'
    );

    // 8. Admin Workload Summary & CSV Export
    console.log('\n8️⃣ Testing Staff Workload Summary & CSV Export...');
    const workloadRes = await fetch(`${API_URL}/api/admin/workload`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    const workload = await workloadRes.json();
    assert(Array.isArray(workload) && workload.length > 0, 'Admin can fetch staff workload summary');
    assert(
      workload.every((w) => typeof w.total === 'number' && typeof w.pending === 'number'),
      'Staff workload contains valid status count metrics'
    );

    // CSV Export
    const csvRes = await fetch(`${API_URL}/api/complaints/export`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    const csvText = await csvRes.text();
    assert(csvRes.status === 200, 'Admin can export complaints as CSV');
    assert(csvText.includes('ID,Title,Category,Status'), 'CSV contains correct header columns');
    assert(!csvText.includes('password'), 'CSV does not leak passwords or credentials');

    // 9. Notification Read Management
    console.log('\n9️⃣ Testing Notification Read Operations...');
    if (staffNotifs.length > 0) {
      const notifId = staffNotifs[0]._id;
      const readOneRes = await fetch(`${API_URL}/api/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${staff.token}` },
      });
      assert(readOneRes.ok, 'User can mark a single notification as read');

      const readAllRes = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${staff.token}` },
      });
      assert(readAllRes.ok, 'User can mark all notifications as read');
    }

    // 10. Clean up: Delete test complaint
    console.log('\n🔟 Testing Authorized Deletion & Cleanup...');
    const deleteRes = await fetch(`${API_URL}/api/complaints/${newComplaint._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    assert(deleteRes.ok, 'Admin successfully deleted test complaint');

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
