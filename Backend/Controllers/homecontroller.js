import ComplintModel from "../Shema/Complient.js";
import LoginModel from "../Shema/loginSchma.js";

export const GetAllRoleManagement = async (req, res) => {
    try {

     
        const roleManagements = await LoginModel.find({
            role: { $exists: true, $ne: "" },
        }).sort({ createdAt: -1 });

        if (roleManagements.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No Role Managements Found",
            });
        }

        return res.status(200).json({
            success: true,
            data: roleManagements,
        });
    } catch (error) {
        console.error("Get all role managements error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

 export const RateOfComplint = async (req, res) => {
    try {
        const groupedComplaints = await ComplintModel.aggregate([
            {
                $group: {
                    _id: {
                        ward: { $ifNull: ["$ward", "Ward not assigned"] },
                        resolved: { $eq: ["$resloved", true] },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$_id.ward",
                    total: { $sum: "$count" },
                    resolved: {
                        $sum: { $cond: ["$_id.resolved", "$count", 0] },
                    },
                    open: {
                        $sum: { $cond: ["$_id.resolved", 0, "$count"] },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    ward: "$_id",
                    total: 1,
                    resolved: 1,
                    open: 1,
                },
            },
            { $sort: { total: -1, ward: 1 } },
        ]);

        return res.status(200).json({
            success: true,
            data: groupedComplaints,
        });
    } catch (error) {
        console.error("Complaint ward aggregation error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};