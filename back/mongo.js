const mongoose = require('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');

mongoose.connect('mongodb+srv://Xenon:OckWD9EywPtj7sVq@clusterex1.0fimueu.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


const userSchema = new mongoose.Schema({
    email: {type : String, required : true, unique: true},
    password:{type: String, required: true}
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

module.exports ={mongoose, User}