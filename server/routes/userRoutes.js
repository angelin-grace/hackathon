const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users/me — Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/me — Update bio, availability, name
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, bio, availability } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (availability) user.availability = availability;

    await user.save();
    return res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// POST /api/users/skills/offered — Add an offered skill
router.post('/skills/offered', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { skill, category, proficiency } = req.body;

    if (!skill) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.skillsOffered.push({
      skill: skill.trim(),
      category: category || 'General',
      proficiency: proficiency || 'Intermediate'
    });

    await user.save();
    return res.status(201).json({ success: true, message: 'Offered skill added', user });
  } catch (error) {
    console.error('Error adding offered skill:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/users/skills/offered/:id — Remove offered skill
router.delete('/skills/offered/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const skillId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.skillsOffered = user.skillsOffered.filter(s => s._id.toString() !== skillId);
    await user.save();
    return res.json({ success: true, message: 'Offered skill removed', user });
  } catch (error) {
    console.error('Error removing offered skill:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users/skills/required — Add a required skill
router.post('/skills/required', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { skill, category, urgency } = req.body;

    if (!skill) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.skillsRequired.push({
      skill: skill.trim(),
      category: category || 'General',
      urgency: urgency || 'Medium'
    });

    await user.save();
    return res.status(201).json({ success: true, message: 'Required skill added', user });
  } catch (error) {
    console.error('Error adding required skill:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/users/skills/required/:id — Remove required skill
router.delete('/skills/required/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const skillId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.skillsRequired = user.skillsRequired.filter(s => s._id.toString() !== skillId);
    await user.save();
    return res.json({ success: true, message: 'Required skill removed', user });
  } catch (error) {
    console.error('Error removing required skill:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/search?skill=&category=&availability=&minRating=
router.get('/search', async (req, res) => {
  try {
    const { skill, category, availability, minRating } = req.query;

    const query = {};

    if (availability) {
      query.availability = availability;
    }

    if (minRating) {
      query.avgRating = { $gte: parseFloat(minRating) };
    }

    let users = await User.find(query).select('-password');

    // Filter by skill or category if specified
    if (skill || category) {
      users = users.filter(user => {
        const skillMatch = !skill ||
          user.skillsOffered.some(s => s.skill.toLowerCase().includes(skill.toLowerCase())) ||
          user.skillsRequired.some(s => s.skill.toLowerCase().includes(skill.toLowerCase()));

        const categoryMatch = !category ||
          user.skillsOffered.some(s => s.category.toLowerCase().includes(category.toLowerCase())) ||
          user.skillsRequired.some(s => s.category.toLowerCase().includes(category.toLowerCase()));

        return skillMatch && categoryMatch;
      });
    }

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ success: false, message: 'Server error during search' });
  }
});

// GET /api/matches — Smart reciprocal match engine
// returns [{ user, score, reciprocal, matchedSkills, reasonBreakdown }]
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const currentUserId = (req.user._id || req.user.id).toString();
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allUsers = await User.find({ _id: { $ne: currentUserId } }).select('-password');

    const matches = allUsers.map(otherUser => {
      // Analyze skill overlap
      const currentOffered = currentUser.skillsOffered || [];
      const currentRequired = currentUser.skillsRequired || [];
      const otherOffered = otherUser.skillsOffered || [];
      const otherRequired = otherUser.skillsRequired || [];

      // 1. Current user offers skill that Other user requires (I teach -> They learn)
      const myTeaches = currentOffered.filter(co =>
        otherRequired.some(or => or.skill.toLowerCase().includes(co.skill.toLowerCase()) || co.skill.toLowerCase().includes(or.skill.toLowerCase()))
      );

      // 2. Other user offers skill that Current user requires (They teach -> I learn)
      const theyTeach = otherOffered.filter(oo =>
        currentRequired.some(cr => cr.skill.toLowerCase().includes(oo.skill.toLowerCase()) || oo.skill.toLowerCase().includes(cr.skill.toLowerCase()))
      );

      const isReciprocal = myTeaches.length > 0 && theyTeach.length > 0;

      // Matched skills chips list
      const matchedSkills = [
        ...myTeaches.map(s => `${s.skill} (You teach)`),
        ...theyTeach.map(s => `${s.skill} (They teach)`)
      ];

      // Score Calculation (out of 100)
      let reciprocalScore = 0;
      if (isReciprocal) {
        reciprocalScore = 50;
      } else if (myTeaches.length > 0 || theyTeach.length > 0) {
        reciprocalScore = 25;
      } else {
        // Category similarity score
        const categoryMatch = currentOffered.some(co => otherOffered.some(oo => oo.category === co.category));
        reciprocalScore = categoryMatch ? 10 : 5;
      }

      // Skill Fit Score (up to 25 pts)
      let fitScore = 15;
      if (theyTeach.some(t => t.proficiency === 'Expert')) fitScore += 10;
      else if (theyTeach.some(t => t.proficiency === 'Intermediate')) fitScore += 5;

      // Availability Score (up to 15 pts)
      let availScore = 5;
      if (currentUser.availability === otherUser.availability || currentUser.availability === 'Flexible' || otherUser.availability === 'Flexible') {
        availScore = 15;
      }

      // Rating Score (up to 10 pts)
      const ratingScore = Math.round((otherUser.avgRating / 5) * 10);

      const totalScore = Math.min(99, Math.round(reciprocalScore + fitScore + availScore + ratingScore));

      const reasonBreakdown = {
        reciprocalPoints: reciprocalScore,
        skillFitPoints: fitScore,
        availabilityPoints: availScore,
        ratingPoints: ratingScore,
        summary: isReciprocal
          ? `Perfect 2-Way Match! You teach ${myTeaches[0]?.skill || 'a skill'} and they teach ${theyTeach[0]?.skill || 'a skill'}.`
          : (theyTeach.length > 0
              ? `They can teach you ${theyTeach[0].skill}.`
              : (myTeaches.length > 0 ? `You can teach them ${myTeaches[0].skill}.` : 'Potential skill swap based on interest categories.'))
      };

      return {
        user: otherUser,
        score: totalScore,
        reciprocal: isReciprocal,
        matchedSkills: matchedSkills.length > 0 ? matchedSkills : ['General Exchange'],
        reasonBreakdown
      };
    });

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error calculating matches:', error);
    return res.status(500).json({ success: false, message: 'Server error calculating matches' });
  }
});

module.exports = router;
