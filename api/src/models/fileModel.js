import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  url: String,
});

const File = mongoose.model("File", fileSchema);

export default File;
