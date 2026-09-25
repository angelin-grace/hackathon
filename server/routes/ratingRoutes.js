const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Rating = require('../models/Rating');
const MatchRequest = require('../models/MatchRequest');
const User = require('../models/User');

// POST /api/ratings — Create rating for a completed match request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { matchRequest: matchRequestId, toUser: targetUserId, stars, feedback } = req.body;
    const fromUserId = req.user._id || req.user.id;

    if (!matchRequestId || !targetUserId || stars === undefined || stars === null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: matchRequest, toUser, and stars (1-5) are required'
      });
    }

    const numericStars = Number(stars);
    if (isNaN(numericStars) || numericStars < 1 || numericStars > 5) {
      return res.status(400).json({
        success: false,
        message: 'Stars rating must be a number between 1 and 5'
      });
    }

    // Find match request
    const matchReq = await MatchRequest.findById(matchRequestId);
    if (!matchReq) {
      return res.status(404).json({
        success: false,
        message: 'Match request not found'
      });
    }

    // 1. Validate matchRequest.status === 'Completed'
    if (matchReq.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Ratings are only allowed for Completed exchange requests (current status: '${matchReq.status}')`
      });
    }

    // Verify current user is a participant
    const isParticipant =
      matchReq.fromUser.toString() === fromUserId.toString() ||
      matchReq.toUser.toString() === fromUserId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only rate exchanges you participated in'
      });
    }

    // Verify target user is the opposite user in the exchange
    const validTargetId =
      matchReq.fromUser.toString() === fromUserId.toString()
        ? matchReq.toUser.toString()
        : matchReq.fromUser.toString();

    if (targetUserId.toString() !== validTargetId) {
      return res.status(400).json({
        success: false,
        message: 'Target user does not match the other participant in this match request'
      });
    }

    // 2. Validate no existing rating already exists for that matchRequest + fromUser combo
    const existingRating = await Rating.findOne({
      matchRequest: matchRequestId,
      fromUser: fromUserId
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a rating for this exchange'
      });
    }

    // Create and save rating
    const rating = new Rating({
      matchRequest: matchRequestId,
      fromUser: fromUserId,
      toUser: targetUserId,
      stars: numericStars,
      feedback: feedback || ''
    });

    await rating.save();

    // 3. Recalculate toUser.avgRating as weighted average, increment totalRatings, save to User doc
    const userRatings = await Rating.find({ toUser: targetUserId });
    const totalRatings = userRatings.length;
    const sumStars = userRatings.reduce((acc, curr) => acc + curr.stars, 0);
    const avgRating = totalRatings > 0 ? Number((sumStars / totalRatings).toFixed(1)) : 0;

    await User.findByIdAndUpdate(targetUserId, {
      avgRating,
      totalRatings
    });

    const populatedRating = await Rating.findById(rating._id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: populatedRating,
      userRating: {
        avgRating,
        totalRatings
      }
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting rating'
    });
  }
});

// GET /api/ratings/:userId — All ratings received by userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const ratings = await Rating.find({ toUser: userId })
      .populate('fromUser', 'name email')
      .populate('matchRequest', 'offeredSkill requestedSkill')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user ratings'
    });
  }
});

module.exports = router;
