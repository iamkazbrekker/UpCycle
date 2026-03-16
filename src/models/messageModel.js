import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    roommId: {
        type: String,
        required: [true, 'roomId required'],
        index: true
    },
    sender: {
        type: String,
        required: [true, 'sender required']
    },
    text: {
        type: String,
        required: [true, 'Message is required'],
        maxLength : [2000, "message cannot be longer than 2000 characters"]
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
})

messageSchema.index({roomId:1, timmestamp:1})

const Message = mongoose.model("Messages", messageSchema)
export default Message