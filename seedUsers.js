const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const uri = 'mongodb+srv://kowsalya:admin@cluster0.jygw7.mongodb.net/outpassDB?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});

    const users = [
      { name: 'kows', password: 'student123', role: 'student' },
      { name: 'jeev', password: 'hod123', role: 'hod' },
      { name: 'kiru', password: 'staff123', role: 'staff' },
    ];

    const hashedUsers = await Promise.all(users.map(async user => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    }));

    await User.insertMany(hashedUsers);
    console.log('✅ Users added with hashed passwords');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit();
  });
