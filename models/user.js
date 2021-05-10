const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema(
	{
		username       : {
			type      : String,
			minlength : 3,
			required  : true,
			unique    : true
		},
		passwordHash   : String,
		userType       : String,
		name           : String,
		email          : String,
		gender         : String,
		age            : Number,
		educationLevel : String,
		nativeLang     : String,
		englishLevel   : String,
		courses        : [
			{
				type : mongoose.Schema.Types.ObjectId,
				ref  : 'Course'
			}
		]
	},
	{ timestamps: true }
);

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
	transform : (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
		delete returnedObject.passwordHash;
	}
});

module.exports = mongoose.model('User', userSchema);
