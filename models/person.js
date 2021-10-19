const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
require('dotenv').config()

const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(result => {
        console.log('Connected to MongoDB')
    })
    .catch(error => {
        console.log('Error connecting to MongoDB: ', error.message);
    });

const personSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3, unique: true},
    number: {type: String, required: true, minlength: 8}
});


personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

personSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Person', personSchema);
