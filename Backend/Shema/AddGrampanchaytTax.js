import mongoose from "mongoose";

const AddGrampnachaytTaxSchema = new mongoose.Schema(
  {
    // House Information
    houseNo: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Tax Information
    taxAmount: {
      type: String,
    },

    waterTax: {
      type: String,
    },

    houseRent: {
      type: String,
    },

    propertyTax: {
      type: String,
    },

    sanitationTax: {
      type: String,
    },

    lightTax: {
      type: String,
    },

    totalTax: {
      type: String,
    },

    // Payment Information
    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentDate: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer", "Online"],
    },

    transactionId: {
      type: String,
      trim: true,
    },

    upiId: {
      type: String,
      trim: true,
      lowercase: true,
    },

    paymentId: {
      type: String,
      trim: true,
    },

    // Financial Year
    financialYear: {
      type: String,
      default: "2026-27",
    },

    // Due Date
    dueDate: {
      type: Date,
    },

    // Pending amount
    pendingAmount: {
      type: String,
      default: "0",
    },

    // Additional Information
    address: {
      type: String,
      trim: true,
    },

    village: {
      type: String,
      trim: true,
    },

    taluka: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    // Record status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const AddGrampnachaytTax = mongoose.model(
  "AddGrampnachaytTax",
  AddGrampnachaytTaxSchema
);

export default AddGrampnachaytTax;