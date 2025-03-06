const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({

  projectName: 
        {
    type: String,
      required: true
     },
  projectImage: 
  { 
    type: String 

  }, 

  building: { type: String, required: true },

  categories: [
    {
      type: String,
      enum: ["Penetration", "Fire Dampers", "Joints", "Fire Doors", "Fire Windows"], // Expand based on UI
    },
  ],

  address: {
    jobSiteAddressLine1: { type: String, required: true },
    jobSiteAddressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },

  projectAdministration: {
    projectStatus: { type: String, enum: ["Active", "Completed", "Pending"], required: true },
    hierarchyLevelsMobile: { type: Boolean, default: false },
  },

  subcontractorInfo: {
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },

  clientInfo: {
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },

  createdAt: { type: Date, default: Date.now },
});

const Project =  mongoose.model("Project", ProjectSchema);

module.exports  = Project;

