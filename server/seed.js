const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const MatchRequest = require('./models/MatchRequest');
const Rating = require('./models/Rating');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';

const seedData = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const seedUsers = [
      {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        password,
        bio: 'Senior Full-Stack Engineer passionate about React, TypeScript, and modern web apps. Looking to level up my UX & UI Design skills!',
        availability: 'Weekends',
        avgRating: 4.9,
        totalRatings: 12,
        skillsOffered: [
          { skill: 'React', category: 'Technology', proficiency: 'Expert' },
          { skill: 'TypeScript', category: 'Technology', proficiency: 'Expert' },
          { skill: 'Node.js', category: 'Technology', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'UI Design', category: 'Design', urgency: 'High' },
          { skill: 'Figma', category: 'Design', urgency: 'High' },
          { skill: 'Spanish', category: 'Language', urgency: 'Medium' }
        ]
      },
      {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password,
        bio: 'Product Designer at a tech startup. Master at Figma & Design Systems. Eager to learn React frontend development to build my own side projects!',
        availability: 'Weekends',
        avgRating: 4.8,
        totalRatings: 9,
        skillsOffered: [
          { skill: 'UI Design', category: 'Design', proficiency: 'Expert' },
          { skill: 'Figma', category: 'Design', proficiency: 'Expert' },
          { skill: 'Tailwind CSS', category: 'Design', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'React', category: 'Technology', urgency: 'High' },
          { skill: 'Node.js', category: 'Technology', urgency: 'Medium' }
        ]
      },
      {
        name: 'David Miller',
        email: 'david@example.com',
        password,
        bio: 'Data Scientist & ML enthusiast. Love explaining complex Python concepts in a simple way. Looking to learn web app development!',
        availability: 'Evenings',
        avgRating: 4.7,
        totalRatings: 6,
        skillsOffered: [
          { skill: 'Python', category: 'Data & AI', proficiency: 'Expert' },
          { skill: 'Data Science', category: 'Data & AI', proficiency: 'Expert' },
          { skill: 'Machine Learning', category: 'Data & AI', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'React', category: 'Technology', urgency: 'High' },
          { skill: 'Web Development', category: 'Technology', urgency: 'High' }
        ]
      },
      {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        password,
        bio: 'Polyglot & Classical Guitarist. Native French speaker and fluent in Spanish. Want to dip my toes into Python programming!',
        availability: 'Flexible',
        avgRating: 5.0,
        totalRatings: 15,
        skillsOffered: [
          { skill: 'French', category: 'Language', proficiency: 'Expert' },
          { skill: 'Spanish', category: 'Language', proficiency: 'Expert' },
          { skill: 'Guitar', category: 'Music', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'Python', category: 'Data & AI', urgency: 'Medium' },
          { skill: 'Data Science', category: 'Data & AI', urgency: 'Low' }
        ]
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@example.com',
        password,
        bio: 'Growth Hacker & Product Manager. Specializing in digital marketing, SEO, and go-to-market strategies. Want to learn Acoustic Guitar!',
        availability: 'Weekdays',
        avgRating: 4.6,
        totalRatings: 4,
        skillsOffered: [
          { skill: 'Product Management', category: 'Business', proficiency: 'Expert' },
          { skill: 'Digital Marketing', category: 'Business', proficiency: 'Expert' },
          { skill: 'SEO Strategy', category: 'Business', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'Guitar', category: 'Music', urgency: 'High' },
          { skill: 'French', category: 'Language', urgency: 'Medium' }
        ]
      }
    ];

    await User.deleteMany({});
    const insertedUsers = await User.insertMany(seedUsers);
    console.log(`✅ Seeded ${insertedUsers.length} initial users.`);

    // Create a demo match request
    const sarah = insertedUsers.find(u => u.email === 'sarah@example.com');
    const alex = insertedUsers.find(u => u.email === 'alex@example.com');

    if (sarah && alex) {
      await MatchRequest.deleteMany({});
      const demoReq = await MatchRequest.create({
        fromUser: alex._id,
        toUser: sarah._id,
        offeredSkill: 'Figma',
        requestedSkill: 'React',
        message: "Hi Sarah! I saw you want to learn Figma and offer React. I'd love to swap skills over a weekend project!",
        status: 'Pending'
      });
      console.log('✅ Created demo exchange request:', demoReq._id);
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

module.exports = seedData;
