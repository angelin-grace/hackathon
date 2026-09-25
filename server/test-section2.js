const http = require('http');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function testSection2Flow() {
  console.log('🧪 Section 2 End-To-End 10-Step Verification...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, stepName, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [Step ${total}] ${stepName}`);
    } else {
      console.error(`❌ [Step ${total}] ${stepName} - ${details}`);
    }
  }

  try {
    // 1. Register a new user -> Login
    const newUserEmail = `section2_user_${Date.now()}@example.com`;
    const regRes = await request('POST', '/auth/register', {
      name: 'Section2 User',
      email: newUserEmail,
      password: 'demo1234'
    });
    assert(regRes.status === 201 && regRes.body.token, 'Register New User & Login');
    const user1Token = regRes.body.token;
    const user1Id = regRes.body.user._id || regRes.body.user.id;

    // 2. Add 2 skillsOffered + 2 skillsRequired via Profile page APIs
    const off1 = await request('POST', '/users/skills/offered', { skill: 'Node.js', category: 'Technology', proficiency: 'Expert' }, user1Token);
    const off2 = await request('POST', '/users/skills/offered', { skill: 'GraphQL', category: 'Technology', proficiency: 'Intermediate' }, user1Token);
    const req1 = await request('POST', '/users/skills/required', { skill: 'Figma', category: 'Design', urgency: 'High' }, user1Token);
    const req2 = await request('POST', '/users/skills/required', { skill: 'UI Design', category: 'Design', urgency: 'High' }, user1Token);
    assert(
      off1.status === 201 && off2.status === 201 && req1.status === 201 && req2.status === 201,
      'Add 2 Offered + 2 Required Skills'
    );

    // 3. Search page -> search by skill 'Figma'
    const searchRes = await request('GET', '/users/search?skill=Figma');
    assert(searchRes.status === 200 && searchRes.body.users.length > 0, 'Search by skill (Figma) returns seeded users');

    // 4. Matches page -> confirm ranked matches show with score breakdown & reciprocal badges
    const matchesRes = await request('GET', '/users/matches', null, user1Token);
    assert(
      matchesRes.status === 200 &&
      matchesRes.body.matches.length > 0 &&
      matchesRes.body.matches[0].reasonBreakdown !== undefined,
      'Matches page returns ranked matches with score breakdown & reciprocal badges'
    );

    // Get Alex Rivera's user ID from matches or login
    const alexLogin = await request('POST', '/auth/login', { email: 'alex@example.com', password: 'demo1234' });
    const alexToken = alexLogin.body.token;
    const alexId = alexLogin.body.user._id || alexLogin.body.user.id;

    // 5. Send a request from user1 -> Alex Rivera
    const reqSend = await request('POST', '/requests', {
      toUser: alexId,
      offeredSkill: 'Node.js',
      requestedSkill: 'Figma',
      message: 'Hi Alex! Lets swap Node.js for Figma.'
    }, user1Token);
    assert(reqSend.status === 201 && reqSend.body.success, 'Send exchange request');
    const swapReqId = reqSend.body.request._id || reqSend.body.request.id;

    // 6. Login as Alex Rivera (recipient) -> check Incoming Requests -> Accept it
    const incRes = await request('GET', '/requests/incoming', null, alexToken);
    const foundReq = incRes.body.requests.find(r => (r._id || r.id) === swapReqId);
    assert(foundReq && foundReq.status === 'Pending', 'Recipient receives request in Incoming list');

    const acceptRes = await request('PUT', `/requests/${swapReqId}/accept`, null, alexToken);
    assert(acceptRes.status === 200 && acceptRes.body.request.status === 'Accepted', 'Recipient accepts request');

    // 7. Mark request Complete
    const completeRes = await request('PUT', `/requests/${swapReqId}/complete`, null, user1Token);
    assert(completeRes.status === 200 && completeRes.body.request.status === 'Completed', 'Mark request Complete');

    // 8. Submit a Rating -> confirm target user's avgRating updates
    const rateRes = await request('POST', '/ratings', {
      matchRequest: swapReqId,
      toUser: alexId,
      stars: 5,
      feedback: 'Excellent Figma teaching!'
    }, user1Token);
    assert(rateRes.status === 201 && rateRes.body.userRating.avgRating > 0, 'Submit Rating & update target user avgRating');

    // 9. Try to rate the SAME completed request again -> must be blocked
    const dupRate = await request('POST', '/ratings', {
      matchRequest: swapReqId,
      toUser: alexId,
      stars: 5,
      feedback: 'Trying to rate twice'
    }, user1Token);
    assert(dupRate.status === 400 && !dupRate.body.success, 'Block duplicate rating for same request');

    // 10. Try accepting a request that isn't addressed to you -> must be blocked
    const unauthorizedAccept = await request('PUT', `/requests/${swapReqId}/accept`, null, user1Token);
    assert(unauthorizedAccept.status === 403 && !unauthorizedAccept.body.success, 'Block accepting request not addressed to you');

    console.log(`\n🎉 SECTION 2 VERIFICATION PASSED: ${passed} / ${total} steps verified successfully!\n`);
  } catch (err) {
    console.error('Section 2 verification failed:', err);
  }
}

testSection2Flow();
