import mongoose from 'mongoose';
import mongooseSlugPlugin from 'mongoose-slug-plugin';

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, unique: true, required: true}
  });
  const FriendSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  });

  const TaskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    dueDate: {type: String, required: true},
    description: {type: String, required: true},
    done: {type: Boolean, required : true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  });

// configure plugin
TaskSchema.plugin(mongooseSlugPlugin, {tmpl: '<%=title%>'});

// register models
mongoose.model('User', UserSchema);
mongoose.model('Task', TaskSchema);
mongoose.model('Friend', FriendSchema);
mongoose.connect('mongodb://localhost/hw05');