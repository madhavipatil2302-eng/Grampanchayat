import express from "express";
import {
	AddPropertyTax,
	GetAllProertyTax,
	UpdatePropertyTax,
	getPropertyTaxByHouseNumber,
	updatePropertyTaxStatus,
	VarifyOtpForPropertyTaxStatusUpdate,
	ViewPropertyTax,
	DeletePropertyTax
} from "../Controllers/AddPropertyTax.js";
import { createOrder, verifyPayment } from "../Controllers/Rozarpay.js";

const router = express.Router();

router.post("/grampanchayat/add-property-tax", AddPropertyTax);
router.get("/grampanchayat/get-property-tax", GetAllProertyTax);
router.patch("/grampanchayat/update-property-tax/:id", UpdatePropertyTax);
router.post("/grampanchayat/property-tax/lookup", getPropertyTaxByHouseNumber);
router.post("/grampanchayat/property-tax/send-otp", updatePropertyTaxStatus);
router.post("/grampanchayat/property-tax/verify-otp", VarifyOtpForPropertyTaxStatusUpdate);
router.post("/grampanchayat/property-tax/payment/order", createOrder);
router.post("/grampanchayat/property-tax/payment/verify", verifyPayment);
router.get("/grampanchayat/property-tax/:id", ViewPropertyTax);
router.delete("/grampanchayat/property-tax-delete/:id", DeletePropertyTax);

export default router;