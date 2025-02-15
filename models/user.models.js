import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    resetOpt: { 
        type: String, 
        default: '' 
    },
    resetOptExpiredAt: { 
        type: Number, 
        default: 0 
    }
});

const User = mongoose.model('User',userSchema);
export default User;