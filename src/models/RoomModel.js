import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    buyer: {
        type: String,
        required: [true, 'buyer name required']
    },
    seller:{
        type: String,
        required: [true, 'seller name required']
    },
    roomId: {
        type: String,
        required: [true, 'roomId required'],
        unique: true
    },
    connected:{
        type: [String],
        required: true,
        validate:{
            validator: function(v){
                return v.length <= 2
            },
            message: "Room cannot have more than 2 participants"
        }
    },
    isFull : {
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

roomSchema.pre('save', function(){
    this.isFull = this.connected.length >= 2
})

const Room = mongoose.models.Rooms || mongoose.model("Rooms", roomSchema)

export default Room