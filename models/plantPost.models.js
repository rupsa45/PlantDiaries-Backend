import mongoose from 'mongoose'

const plantPostSchema = new mongoose.Schema({
  createdBy: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  plantName: {
    type: String,
    required: true,
  },
  aboutPlant: {
    type: String,
    required: true,
  },
  image: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  placeName: { 
    type: String, 
    required: true 
  },
  location: {
    type: {
      type: String, // 'Point'
      enum: ["Point"], // 'Point' is the only value
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    }
  },
  category: {
    type: [String],
    required: true, 
    enum: [
      "Succulents", 
      "Herbs", 
      "Trees", 
      "Flowers", 
      "Indoor Plants",
      "Outdoor Plants",
      "Medicinal Plants",
      "Climbers",
      "Creepers",
      "Desert Plants",
      "Shrubs",
      "Grasses",
      "Fruit Plants",
      "Vegetable Plants",
      "Tropical Plants",
      "Evergreen Plants",
      "Others"], 
  },
  tags: {
    type: [String], 
    required: false, //optional
  },
  contactEmail: {
    type: String,
    required: true
  }
});


// Create a geospatial index on the location field
plantPostSchema.index({ location: "2dsphere" });

const PlantPost = mongoose.model("PlantPost", plantPostSchema);

export default PlantPost;