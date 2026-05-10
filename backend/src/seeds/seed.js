require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Course, Module, Lecture, Enrollment, Quiz, Question } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('🗑️  Database reset');

    const hash = await bcrypt.hash('admin123', 12);
    const hash2 = await bcrypt.hash('pass123', 12);

    const admin = await User.create({ name: 'Admin User', email: 'admin@miniudemy.com', password_hash: hash, role: 'admin' });
    const instructor = await User.create({ name: 'Jane Smith', email: 'instructor@miniudemy.com', password_hash: hash2, role: 'instructor', bio: 'Senior web developer with 10+ years of experience teaching online.' });
    const student1 = await User.create({ name: 'Alex Johnson', email: 'student1@miniudemy.com', password_hash: hash2, role: 'student' });
    const student2 = await User.create({ name: 'Maria Garcia', email: 'student2@miniudemy.com', password_hash: hash2, role: 'student' });

    console.log('👤 Users created');

    const course1 = await Course.create({
      title: 'The Complete Web Development Bootcamp',
      subtitle: 'Become a full-stack web developer with just one course',
      description: 'Welcome to the Complete Web Development Bootcamp. With over 50 hours of content, this is the most comprehensive web development course available online. You will learn HTML, CSS, JavaScript, Node.js, React, PostgreSQL, and more.',
      thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=640',
      category: 'development', level: 'beginner', price: 0,
      instructor_id: instructor.id, is_published: true,
    });

    const course2 = await Course.create({
      title: 'Data Science & Machine Learning with Python',
      subtitle: 'Learn data analysis, visualization, and ML algorithms',
      description: 'Master data science, machine learning, and deep learning with Python. This course covers NumPy, Pandas, Matplotlib, Scikit-Learn, TensorFlow, and real-world projects.',
      thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640',
      category: 'data-science', level: 'intermediate', price: 0,
      instructor_id: instructor.id, is_published: true,
    });

    const course3 = await Course.create({
      title: 'UI/UX Design Masterclass',
      subtitle: 'Design beautiful interfaces from scratch',
      description: 'Learn the principles of user interface and user experience design. From wireframing to prototyping, master Figma and build a professional portfolio.',
      thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=640',
      category: 'design', level: 'beginner', price: 0,
      instructor_id: instructor.id, is_published: true,
    });

    console.log('📚 Courses created');

    // Course 1 Modules & Lectures
    const m1 = await Module.create({ course_id: course1.id, title: 'Getting Started with HTML', order: 0 });
    await Lecture.create({ module_id: m1.id, title: 'Introduction to Web Development', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 480, order: 0 });
    await Lecture.create({ module_id: m1.id, title: 'HTML Document Structure', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 620, order: 1 });
    await Lecture.create({ module_id: m1.id, title: 'Working with Forms', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 540, order: 2 });

    const m2 = await Module.create({ course_id: course1.id, title: 'CSS Fundamentals', order: 1 });
    await Lecture.create({ module_id: m2.id, title: 'CSS Selectors & Properties', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 720, order: 0 });
    await Lecture.create({ module_id: m2.id, title: 'Flexbox & Grid Layout', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 900, order: 1 });

    const m3 = await Module.create({ course_id: course1.id, title: 'JavaScript Basics', order: 2 });
    await Lecture.create({ module_id: m3.id, title: 'Variables & Data Types', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 660, order: 0 });
    await Lecture.create({ module_id: m3.id, title: 'Functions & Scope', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 780, order: 1 });
    await Lecture.create({ module_id: m3.id, title: 'DOM Manipulation', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 840, order: 2 });

    // Course 2 Modules
    const m4 = await Module.create({ course_id: course2.id, title: 'Python for Data Science', order: 0 });
    await Lecture.create({ module_id: m4.id, title: 'NumPy Essentials', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 600, order: 0 });
    await Lecture.create({ module_id: m4.id, title: 'Pandas DataFrames', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 720, order: 1 });

    const m5 = await Module.create({ course_id: course2.id, title: 'Machine Learning', order: 1 });
    await Lecture.create({ module_id: m5.id, title: 'Linear Regression', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 900, order: 0 });

    // Course 3 Modules
    const m6 = await Module.create({ course_id: course3.id, title: 'Design Principles', order: 0 });
    await Lecture.create({ module_id: m6.id, title: 'Color Theory & Typography', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 540, order: 0 });
    await Lecture.create({ module_id: m6.id, title: 'Layout & Composition', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 480, order: 1 });

    console.log('📖 Modules & Lectures created');

    // Quiz for Module 1
    const quiz = await Quiz.create({ module_id: m1.id, title: 'HTML Basics Quiz' });
    await Question.create({ quiz_id: quiz.id, text: 'What does HTML stand for?', options: JSON.stringify(['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language']), correct_index: 0 });
    await Question.create({ quiz_id: quiz.id, text: 'Which tag is used for the largest heading?', options: JSON.stringify(['<heading>', '<h6>', '<h1>', '<head>']), correct_index: 2 });
    await Question.create({ quiz_id: quiz.id, text: 'Which element is used for line break?', options: JSON.stringify(['<break>', '<lb>', '<br>', '<newline>']), correct_index: 2 });

    // Quiz for Module 3
    const quiz2 = await Quiz.create({ module_id: m3.id, title: 'JavaScript Fundamentals Quiz' });
    await Question.create({ quiz_id: quiz2.id, text: 'Which keyword declares a block-scoped variable?', options: JSON.stringify(['var', 'let', 'define', 'dim']), correct_index: 1 });
    await Question.create({ quiz_id: quiz2.id, text: 'What is typeof null in JavaScript?', options: JSON.stringify(['"null"', '"undefined"', '"object"', '"boolean"']), correct_index: 2 });

    console.log('📝 Quizzes created');

    // Enrollments
    await Enrollment.create({ student_id: student1.id, course_id: course1.id });
    await Enrollment.create({ student_id: student1.id, course_id: course2.id });
    await Enrollment.create({ student_id: student2.id, course_id: course1.id });
    await Enrollment.create({ student_id: student2.id, course_id: course3.id });

    console.log('✅ Enrollments created');
    console.log('\n🎉 Seed complete! Demo credentials:');
    console.log('   Admin:      admin@miniudemy.com / admin123');
    console.log('   Instructor: instructor@miniudemy.com / pass123');
    console.log('   Student 1:  student1@miniudemy.com / pass123');
    console.log('   Student 2:  student2@miniudemy.com / pass123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
