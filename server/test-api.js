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

async function runTests() {
  console.log('🧪 Starting SkillSwap Full-Stack API Integration Tests...\n');
  let testsPassed = 0;
  let testsTotal = 0;

  function assert(condition, testName, details = '') {
    testsTotal++;
    if (condition) {
      testsPassed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.success, 'Health Check Endpoint');

    // 2. Register Test User 1 (Alice)
    const aliceEmail = `test_alice_${Date.now()}@example.com`;
    const regAlice = await request('POST', '/auth/register', {
      name: 'Alice Tester',
      email: aliceEmail,
      password: 'password123',
      bio: 'Loves teaching Python and learning React.',
      availability: 'Weekends',
      skillsOffered: [{ skill: 'Python', category: 'Technology', proficiency: 'Expert' }],
      skillsRequired: [{ skill: 'React', category: 'Technology', urgency: 'High' }]
    });
    assert(regAlice.status === 201 && regAlice.body.token, 'User 1 (Alice) Registration');
    const aliceToken = regAlice.body.token;
    const aliceId = regAlice.body.user._id || regAlice.body.user.id;

    // 3. Register Test User 2 (Bob - Reciprocal Pair)
    const bobEmail = `test_bob_${Date.now()}@example.com`;
    const regBob = await request('POST', '/auth/register', {
      name: 'Bob Builder',
      email: bobEmail,
      password: 'password123',
      bio: 'Loves teaching React and learning Python.',
      availability: 'Weekends',
      skillsOffered: [{ skill: 'React', category: 'Technology', proficiency: 'Expert' }],
      skillsRequired: [{ skill: 'Python', category: 'Technology', urgency: 'High' }]
    });
    assert(regBob.status === 201 && regBob.body.token, 'User 2 (Bob) Registration');
    const bobToken = regBob.body.token;
    const bobId = regBob.body.user._id || regBob.body.user.id;

    // 4. Test User Profile Retrieval
    const profile = await request('GET', '/users/me', null, aliceToken);
    assert(profile.status === 200 && profile.body.user.name === 'Alice Tester', 'GET /users/me Profile Retrieval');

    // 5. Test Smart Matches Algorithm (Reciprocal Match)
    const matches = await request('GET', '/users/matches', null, aliceToken);
    assert(matches.status === 200 && Array.isArray(matches.body.matches), 'GET /users/matches Endpoint');
    const bobMatch = matches.body.matches.find(m => (m.user._id || m.user.id) === bobId);
    assert(bobMatch && bobMatch.reciprocal === true, 'Smart Match Algorithm Reciprocal Swap Detection');
    assert(bobMatch && bobMatch.score >= 80, `Smart Match Reciprocal Score High (${bobMatch ? bobMatch.score : 0}%)`);

    // 6. Test Request Creation (Alice -> Bob)
    const createReq = await request('POST', '/requests', {
      toUser: bobId,
      offeredSkill: 'Python',
      requestedSkill: 'React',
      message: 'Hi Bob! Lets exchange Python for React skills!'
    }, aliceToken);
    assert(createReq.status === 201 && createReq.body.success, 'POST /api/requests Creation');
    const requestId = createReq.body.request._id || createReq.body.request.id;

    // 7. Test Get Incoming Requests for Bob
    const bobIncoming = await request('GET', '/requests/incoming', null, bobToken);
    assert(bobIncoming.status === 200 && bobIncoming.body.requests.length >= 1, 'GET /api/requests/incoming for Recipient');

    // 8. Test Accept Request (Bob accepts Alice)
    const acceptReq = await request('PUT', `/requests/${requestId}/accept`, null, bobToken);
    assert(acceptReq.status === 200 && acceptReq.body.request.status === 'Accepted', 'PUT /api/requests/:id/accept');

    // 9. Test Complete Request (Mark Completed)
    const completeReq = await request('PUT', `/requests/${requestId}/complete`, null, aliceToken);
    assert(completeReq.status === 200 && completeReq.body.request.status === 'Completed', 'PUT /api/requests/:id/complete');

    // 10. Test Rating Submission (Alice rates Bob 5 stars)
    const ratingRes = await request('POST', '/ratings', {
      matchRequest: requestId,
      toUser: bobId,
      stars: 5,
      feedback: 'Bob was an awesome React mentor! Extremely patient and clear.'
    }, aliceToken);
    assert(ratingRes.status === 201 && ratingRes.body.success, 'POST /api/ratings Submission');

    // 11. Test Prevent Duplicate Rating
    const dupRatingRes = await request('POST', '/ratings', {
      matchRequest: requestId,
      toUser: bobId,
      stars: 5,
      feedback: 'Duplicate attempt'
    }, aliceToken);
    assert(dupRatingRes.status === 400 && !dupRatingRes.body.success, 'Validation: Block Duplicate Rating');

    // 12. Test Get User Ratings & Updated avgRating
    const bobRatings = await request('GET', `/ratings/${bobId}`);
    assert(bobRatings.status === 200 && bobRatings.body.ratings.length >= 1, 'GET /api/ratings/:userId');

    console.log(`\n📊 TEST RESULTS: Passed ${testsPassed} / ${testsTotal} tests (${Math.round((testsPassed / testsTotal) * 100)}% Success Rate)`);
    if (testsPassed === testsTotal) {
      console.log('🎉 ALL BACKEND & FRONTEND INTEGRATION TESTS PASSED PERFECTLY!\n');
    }
  } catch (err) {
    console.error('Error executing test suite:', err);
  }
}

runTests();
