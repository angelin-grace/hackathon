const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const MatchRequest = require('../models/MatchRequest');
const User = require('../models/User');

// POST /api/requests — Create a skill exchange request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { toUser, offeredSkill, requestedSkill, message } = req.body;
    const fromUser = req.user._id || req.user.id;

    if (!toUser || !offeredSkill || !requestedSkill) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: toUser, offeredSkill, and requestedSkill are required'
      });
    }

    if (toUser.toString() === fromUser.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a skill exchange request to yourself'
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(toUser);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    const newRequest = new MatchRequest({
      fromUser,
      toUser,
      offeredSkill,
      requestedSkill,
      message: message || '',
      status: 'Pending'
    });

    await newRequest.save();

    const populatedRequest = await MatchRequest.findById(newRequest._id)
      .populate('fromUser', 'name email bio availability avgRating totalRatings')
      .populate('toUser', 'name email bio availability avgRating totalRatings');

    return res.status(201).json({
      success: true,
      message: 'Skill exchange request sent successfully',
      request: populatedRequest
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating request'
    });
  }
});

// GET /api/requests/incoming — Pending or all incoming requests where toUser = req.user
router.get('/incoming', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const requests = await MatchRequest.find({ toUser: currentUserId })
      .populate('fromUser', 'name email bio availability avgRating totalRatings skillsOffered skillsRequired')
      .populate('toUser', 'name email bio availability avgRating totalRatings skillsOffered skillsRequired')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching incoming requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching incoming requests'
    });
  }
});

// GET /api/requests/outgoing — Requests where fromUser = req.user
router.get('/outgoing', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const requests = await MatchRequest.find({ fromUser: currentUserId })
      .populate('fromUser', 'name email bio availability avgRating totalRatings skillsOffered skillsRequired')
      .populate('toUser', 'name email bio availability avgRating totalRatings skillsOffered skillsRequired')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching outgoing requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching outgoing requests'
    });
  }
});

// PUT /api/requests/:id/accept — Only toUser can accept
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const currentUserId = (req.user._id || req.user.id).toString();

    const matchRequest = await MatchRequest.findById(requestId);
    if (!matchRequest) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    if (matchRequest.toUser.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the recipient of the request can accept it'
      });
    }

    if (matchRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Request cannot be accepted because it is currently '${matchRequest.status}'`
      });
    }

    matchRequest.status = 'Accepted';
    await matchRequest.save();

    const updated = await MatchRequest.findById(requestId)
      .populate('fromUser', 'name email bio availability avgRating totalRatings')
      .populate('toUser', 'name email bio availability avgRating totalRatings');

    return res.json({
      success: true,
      message: 'Exchange request accepted',
      request: updated
    });
  } catch (error) {
    console.error('Error accepting request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error accepting request'
    });
  }
});

// PUT /api/requests/:id/reject — Only toUser can reject
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const currentUserId = (req.user._id || req.user.id).toString();

    const matchRequest = await MatchRequest.findById(requestId);
    if (!matchRequest) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    if (matchRequest.toUser.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the recipient of the request can reject it'
      });
    }

    matchRequest.status = 'Rejected';
    await matchRequest.save();

    const updated = await MatchRequest.findById(requestId)
      .populate('fromUser', 'name email bio availability avgRating totalRatings')
      .populate('toUser', 'name email bio availability avgRating totalRatings');

    return res.json({
      success: true,
      message: 'Exchange request rejected',
      request: updated
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error rejecting request'
    });
  }
});

// PUT /api/requests/:id/complete — Status -> Completed, unlocks rating eligibility
// Validate: only fromUser or toUser of that request can mark complete
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const currentUserId = (req.user._id || req.user.id).toString();

    const matchRequest = await MatchRequest.findById(requestId);
    if (!matchRequest) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    const isParticipant =
      matchRequest.fromUser.toString() === currentUserId ||
      matchRequest.toUser.toString() === currentUserId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only participants of this request can mark it as complete'
      });
    }

    if (matchRequest.status !== 'Accepted') {
      return res.status(400).json({
        success: false,
        message: `Only Accepted requests can be marked as Completed (current status: ${matchRequest.status})`
      });
    }

    matchRequest.status = 'Completed';
    await matchRequest.save();

    const updated = await MatchRequest.findById(requestId)
      .populate('fromUser', 'name email bio availability avgRating totalRatings')
      .populate('toUser', 'name email bio availability avgRating totalRatings');

    return res.json({
      success: true,
      message: 'Exchange request marked as Completed! You can now rate your exchange partner.',
      request: updated
    });
  } catch (error) {
    console.error('Error completing request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error marking request complete'
    });
  }
});

module.exports = router;
