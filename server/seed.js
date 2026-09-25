const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const MatchRequest = require('./models/MatchRequest');
const Rating = require('./models/Rating');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';

const seedData = async () => {
  try {
    console.log('🌱 Starting SkillSwap database seeding...');

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB.');
    }

    // Hash common password "demo1234"
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('demo1234', salt);

    const seedUsers = [
      // 1. Sarah Chen (Demo Account 1)
      {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        password,
        bio: 'Senior Full-Stack Engineer passionate about React, TypeScript, and Node.js. Looking to level up UX & UI Design skills!',
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
      // 2. Alex Rivera (Demo Account 2 - Reciprocal with Sarah)
      {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password,
        bio: 'Product Designer & Figma specialist. Eager to learn React frontend development to build my own side projects!',
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
      // 3. David Miller (Reciprocal Pair with Elena)
      {
        name: 'David Miller',
        email: 'david@example.com',
        password,
        bio: 'Data Scientist & Python enthusiast. Love explaining complex ML concepts simply. Want to learn conversational French!',
        availability: 'Evenings',
        avgRating: 4.7,
        totalRatings: 8,
        skillsOffered: [
          { skill: 'Python', category: 'Data & AI', proficiency: 'Expert' },
          { skill: 'Data Science', category: 'Data & AI', proficiency: 'Expert' },
          { skill: 'Machine Learning', category: 'Data & AI', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'French', category: 'Language', urgency: 'High' },
          { skill: 'React', category: 'Technology', urgency: 'Medium' }
        ]
      },
      // 4. Elena Rostova (Reciprocal Pair with David & Marcus)
      {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        password,
        bio: 'Polyglot & Classical Guitarist. Native French & Spanish speaker eager to learn Python for data analysis!',
        availability: 'Flexible',
        avgRating: 5.0,
        totalRatings: 14,
        skillsOffered: [
          { skill: 'French', category: 'Language', proficiency: 'Expert' },
          { skill: 'Spanish', category: 'Language', proficiency: 'Expert' },
          { skill: 'Guitar', category: 'Music', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'Python', category: 'Data & AI', urgency: 'High' },
          { skill: 'Digital Marketing', category: 'Business', urgency: 'Medium' }
        ]
      },
      // 5. Marcus Vance (Reciprocal Pair with Elena)
      {
        name: 'Marcus Vance',
        email: 'marcus@example.com',
        password,
        bio: 'Growth Hacker & Product Manager. Specializing in digital marketing and SEO strategies. Want to learn Acoustic Guitar!',
        availability: 'Weekdays',
        avgRating: 4.6,
        totalRatings: 5,
        skillsOffered: [
          { skill: 'Digital Marketing', category: 'Business', proficiency: 'Expert' },
          { skill: 'SEO Strategy', category: 'Business', proficiency: 'Expert' },
          { skill: 'Product Management', category: 'Business', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'Guitar', category: 'Music', urgency: 'High' },
          { skill: 'French', category: 'Language', urgency: 'Medium' }
        ]
      },
      // 6. Sophia Patel (Reciprocal Pair with Liam)
      {
        name: 'Sophia Patel',
        email: 'sophia@example.com',
        password,
        bio: 'Physics & Mathematics major. Love tutoring Calculus and Linear Algebra. Wanting to learn DSLR Photography!',
        availability: 'Evenings',
        avgRating: 4.9,
        totalRatings: 11,
        skillsOffered: [
          { skill: 'Calculus', category: 'Academic', proficiency: 'Expert' },
          { skill: 'Physics', category: 'Academic', proficiency: 'Expert' },
          { skill: 'Linear Algebra', category: 'Academic', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'Photography', category: 'Creative', urgency: 'High' },
          { skill: 'Photoshop', category: 'Design', urgency: 'Medium' }
        ]
      },
      // 7. Liam O'Connor (Reciprocal Pair with Sophia)
      {
        name: 'Liam O\'Connor',
        email: 'liam@example.com',
        password,
        bio: 'Creative Photographer & Digital Artist. Expertise in Photoshop editing and lighting. Need help passing College Calculus!',
        availability: 'Evenings',
        avgRating: 4.8,
        totalRatings: 7,
        skillsOffered: [
          { skill: 'Photography', category: 'Creative', proficiency: 'Expert' },
          { skill: 'Photoshop', category: 'Design', proficiency: 'Expert' },
          { skill: 'Video Editing', category: 'Creative', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'Calculus', category: 'Academic', urgency: 'High' },
          { skill: 'Physics', category: 'Academic', urgency: 'Medium' }
        ]
      },
      // 8. Maya Lin (Reciprocal Pair with Carlos & Alex)
      {
        name: 'Maya Lin',
        email: 'maya@example.com',
        password,
        bio: 'Backend Software Engineer focusing on Java & Microservices. Seeking to learn Spanish for upcoming travels!',
        availability: 'Weekends',
        avgRating: 4.7,
        totalRatings: 6,
        skillsOffered: [
          { skill: 'Java', category: 'Technology', proficiency: 'Expert' },
          { skill: 'Spring Boot', category: 'Technology', proficiency: 'Expert' },
          { skill: 'SQL', category: 'Technology', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'Spanish', category: 'Language', urgency: 'High' },
          { skill: 'Figma', category: 'Design', urgency: 'Medium' }
        ]
      },
      // 9. Carlos Gomez (Reciprocal Pair with Maya)
      {
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        password,
        bio: 'Native Spanish speaker studying CS. Offering conversational Spanish in exchange for Java backend tutoring!',
        availability: 'Weekdays',
        avgRating: 4.5,
        totalRatings: 4,
        skillsOffered: [
          { skill: 'Spanish', category: 'Language', proficiency: 'Expert' },
          { skill: 'Conversational Spanish', category: 'Language', proficiency: 'Expert' }
        ],
        skillsRequired: [
          { skill: 'Java', category: 'Technology', urgency: 'High' },
          { skill: 'Spring Boot', category: 'Technology', urgency: 'Medium' }
        ]
      },
      // 10. Zoe Williams
      {
        name: 'Zoe Williams',
        email: 'zoe@example.com',
        password,
        bio: 'Jazz Pianist & Music Theory tutor. Looking for someone to teach me basic Java programming for music synthesis software.',
        availability: 'Flexible',
        avgRating: 4.4,
        totalRatings: 3,
        skillsOffered: [
          { skill: 'Music Theory', category: 'Music', proficiency: 'Expert' },
          { skill: 'Piano', category: 'Music', proficiency: 'Expert' }
        ],
        skillsRequired: [
          { skill: 'Java', category: 'Technology', urgency: 'Medium' },
          { skill: 'Python', category: 'Technology', urgency: 'Low' }
        ]
      },
      // 11. Ethan Hunt
      {
        name: 'Ethan Hunt',
        email: 'ethan@example.com',
        password,
        bio: 'Cybersecurity analyst in training. Offering Linux Administration & System Security basics in exchange for ML concepts.',
        availability: 'Weekdays',
        avgRating: 4.6,
        totalRatings: 5,
        skillsOffered: [
          { skill: 'Linux', category: 'Technology', proficiency: 'Expert' },
          { skill: 'Cybersecurity', category: 'Technology', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'Machine Learning', category: 'Data & AI', urgency: 'High' }
        ]
      },
      // 12. Chloe Dubois
      {
        name: 'Chloe Dubois',
        email: 'chloe@example.com',
        password,
        bio: 'Graphic Designer and Digital Illustrator. Offering Photoshop portrait editing in exchange for SEO Strategy advice.',
        availability: 'Weekends',
        avgRating: 4.3,
        totalRatings: 2,
        skillsOffered: [
          { skill: 'Photoshop', category: 'Design', proficiency: 'Expert' },
          { skill: 'Digital Illustration', category: 'Creative', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'SEO Strategy', category: 'Business', urgency: 'High' }
        ]
      },
      // 13. Noah Jackson
      {
        name: 'Noah Jackson',
        email: 'noah@example.com',
        password,
        bio: 'Acoustic & Electric Bass player. Offering Bass Guitar lessons in exchange for Video Editing tutoring.',
        availability: 'Evenings',
        avgRating: 4.2,
        totalRatings: 2,
        skillsOffered: [
          { skill: 'Bass Guitar', category: 'Music', proficiency: 'Expert' },
          { skill: 'Audio Engineering', category: 'Creative', proficiency: 'Beginner' }
        ],
        skillsRequired: [
          { skill: 'Video Editing', category: 'Creative', urgency: 'High' }
        ]
      },
      // 14. Amara Okafor
      {
        name: 'Amara Okafor',
        email: 'amara@example.com',
        password,
        bio: 'Biophysics researcher tutoring Advanced Physics & Chemistry. Looking to learn French for international lab rotation.',
        availability: 'Weekdays',
        avgRating: 4.8,
        totalRatings: 5,
        skillsOffered: [
          { skill: 'Physics', category: 'Academic', proficiency: 'Expert' },
          { skill: 'Chemistry', category: 'Academic', proficiency: 'Intermediate' }
        ],
        skillsRequired: [
          { skill: 'French', category: 'Language', urgency: 'High' }
        ]
      },
      // 15. Oliver Wright
      {
        name: 'Oliver Wright',
        email: 'oliver@example.com',
        password,
        bio: 'Beginner student starting out in HTML & CSS. Excited to learn React web development!',
        availability: 'Flexible',
        avgRating: 0,
        totalRatings: 0,
        skillsOffered: [
          { skill: 'HTML', category: 'Technology', proficiency: 'Beginner' },
          { skill: 'CSS', category: 'Technology', proficiency: 'Beginner' }
        ],
        skillsRequired: [
          { skill: 'React', category: 'Technology', urgency: 'High' }
        ]
      }
    ];

    // Clear existing collections
    await User.deleteMany({});
    await MatchRequest.deleteMany({});
    await Rating.deleteMany({});
    console.log('🧹 Cleared existing users, match requests, and ratings.');

    // Insert 15 seed users
    const insertedUsers = await User.insertMany(seedUsers);
    console.log(`✅ Successfully inserted ${insertedUsers.length} seed users into database.`);

    // Create demo request between Alex Rivera and Sarah Chen
    const sarah = insertedUsers.find(u => u.email === 'sarah@example.com');
    const alex = insertedUsers.find(u => u.email === 'alex@example.com');

    if (sarah && alex) {
      const demoReq = await MatchRequest.create({
        fromUser: alex._id,
        toUser: sarah._id,
        offeredSkill: 'Figma',
        requestedSkill: 'React',
        message: "Hi Sarah! I saw you want to learn Figma and offer React. I'd love to swap skills over a weekend project!",
        status: 'Pending'
      });
      console.log('✅ Created demo exchange request from Alex Rivera to Sarah Chen:', demoReq._id);
    }

    console.log('🎉 Seeding complete! All 15 users ready with password "demo1234".\n');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

// Allow direct CLI invocation `node seed.js`
if (require.main === module) {
  seedData().then(() => mongoose.connection.close());
}

module.exports = seedData;
