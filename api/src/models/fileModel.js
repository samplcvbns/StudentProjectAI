import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const File = mongoose.model("File", fileSchema);

export default File;
