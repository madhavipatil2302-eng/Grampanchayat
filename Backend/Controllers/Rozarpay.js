import Rozarpay from "razorpay";
import crypto from "crypto";
import AddGrampnachaytTax from "../Shema/AddGrampanchaytTax.js";
import { QRCodeModel } from "../Shema/QRCode.js";


const instance = new Rozarpay({

    key_id: process.env.Test_API_Key,
    key_secret: process.env.Test_Key_Secret
});

const createOrder = async (req, res) => {

    try {

        const { propertyTaxId, currency = "INR", receipt } = req.body;

        if (!propertyTaxId) {
            return res.status(400).json({
            message: "Property tax ID is required"
            });
        }

        const propertyTax = await AddGrampnachaytTax.findById(propertyTaxId);
        if (!propertyTax) {
            return res.status(404).json({ message: "Property tax record not found" });
        }

        if (propertyTax.paymentId || propertyTax.isPaid) {
            return res.status(400).json({ message: "Property tax is already paid" });
        }

        const numericAmount = Number(propertyTax.totalTax || propertyTax.taxAmount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" });
        }

        const options = {
            amount: Math.round(numericAmount * 100),
            currency,
            receipt: receipt || `property-tax-${propertyTaxId}`,
            payment_capture: 1 // Auto capture payment
        };

        const order = await instance.orders.create(options);

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            data: order,
            keyId: process.env.Test_API_Key
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            propertyTaxId,
            qrRecordId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            upiId,
            transactionId,
            paymentId,
            paymentMethod,
        } = req.body;

        const manualUpiTransactionId = transactionId || paymentId;
        const hasRazorpayData = Boolean(propertyTaxId && razorpay_order_id && razorpay_payment_id && razorpay_signature);
        const hasManualUpiData = Boolean(propertyTaxId && manualUpiTransactionId && (upiId || qrRecordId));

        if (!propertyTaxId || (!hasRazorpayData && !hasManualUpiData)) {
            return res.status(400).json({ message: "Payment details are required" });
        }

        let propertyTax;

        if (hasRazorpayData) {
            const expectedSignature = crypto
                .createHmac("sha256", process.env.Test_Key_Secret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: "Invalid payment signature" });
            }

            const paymentCollection = await instance.orders.fetchPayments(razorpay_order_id);
            const payments = paymentCollection?.items || paymentCollection?.payments || [];
            const matchedPayment = payments.find((payment) => payment?.id === razorpay_payment_id);
            const paymentStatus = String(matchedPayment?.status || '').toLowerCase();
            const isSuccessfulPayment = ["paid", "captured", "authorized"].includes(paymentStatus);

            if (!matchedPayment || !isSuccessfulPayment) {
                return res.status(202).json({
                    success: false,
                    message: "Payment is still processing. Please wait for the payment confirmation.",
                    data: null,
                });
            }

            propertyTax = await AddGrampnachaytTax.findByIdAndUpdate(
                propertyTaxId,
                {
                    $set: {
                        isPaid: true,
                        paymentId: razorpay_payment_id,
                        transactionId: razorpay_payment_id,
                        paymentDate: new Date(),
                        paymentMethod: "Online",
                        pendingAmount: "0",
                    },
                },
                { new: true }
            );

            if (qrRecordId) {
                await QRCodeModel.findOneAndUpdate(
                    { _id: qrRecordId, propertyTaxId },
                    { $set: { isPaid: true, transactionId: razorpay_payment_id } }
                );
            }
        } else {
            const normalizedUpiId = typeof upiId === "string" ? upiId.trim() : "";
            propertyTax = await AddGrampnachaytTax.findByIdAndUpdate(
                propertyTaxId,
                {
                    $set: {
                        isPaid: true,
                        paymentId: manualUpiTransactionId,
                        transactionId: manualUpiTransactionId,
                        paymentDate: new Date(),
                        paymentMethod: paymentMethod || "UPI",
                        pendingAmount: "0",
                        ...(normalizedUpiId ? { upiId: normalizedUpiId } : {}),
                    },
                },
                { new: true }
            );

            if (qrRecordId) {
                await QRCodeModel.findOneAndUpdate(
                    { _id: qrRecordId, propertyTaxId },
                    { $set: { isPaid: true, transactionId: manualUpiTransactionId } }
                );
            }
        }

        if (!propertyTax) {
            return res.status(404).json({ message: "Property tax record not found" });
        }

        return res.status(200).json({ success: true, message: "Payment verified successfully", data: propertyTax });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getOrder = async (req, res) => {

    try {

        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        const order = await instance.orders.fetch(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order
        });

    } catch (error) {
        console.error("Error fetching order:", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export { createOrder, getOrder, verifyPayment };

