import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import axios from "axios";

const PaymentHistory = () => {
    const [orders, setOrders] = useState([]); // ✅ รายการ Order ทั้งหมด
    const [selectedOrderID, setSelectedOrderID] = useState(""); // ✅ Order ID ที่เลือก
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    // ✅ โหลดรายการ Order ทั้งหมด
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/orders/4", {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ Orders Data:", response.data);

            if (response.data.orders.length > 0) {
                setOrders(response.data.orders);
            } else {
                setError("❌ No orders found.");
            }
        } catch (err) {
            console.error("❌ Fetch Orders Error:", err);
            setError("❌ Failed to fetch orders.");
        }
    };

    // ✅ ฟังก์ชันโหลดข้อมูล Payment ตาม Order ID
    const fetchPaymentDetails = async (orderID) => {
        if (!orderID) return;
        try {
            console.log(`Fetching payment details for Order ID: ${orderID}`);
            const response = await axios.get(`http://localhost:5000/api/payments/${orderID}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ Payment Data:", response.data);

            if (response.data.OrderID) {
                setPaymentDetails(response.data);
            } else {
                setError("❌ No payment found for this order.");
                setPaymentDetails(null);
            }
        } catch (err) {
            console.error("❌ Fetch Payment Error:", err);
            setError("❌ Failed to fetch payment details.");
        }
    };

    return (
        <motion.div
            className="container my-5 p-4 rounded shadow-lg bg-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.card}
        >
            <h2 className="text-center text-primary fw-bold mb-4">
                <span style={{ color: "#1d3557" }}>Payment History</span>
            </h2>

            {error && <p className="alert alert-danger text-center">{error}</p>}

            {/* ✅ Dropdown ให้เลือก Order ID */}
            <div className="mb-4 text-center">
                <label className="fw-bold">Select Order ID: </label>
                <select
                    className="form-select w-50 mx-auto"
                    value={selectedOrderID}
                    onChange={(e) => {
                        setSelectedOrderID(e.target.value);
                        fetchPaymentDetails(e.target.value);
                    }}
                >
                    <option value="">-- Select Order --</option>
                    {orders.map((order) => (
                        <option key={order.OrderID} value={order.OrderID}>
                            Order {order.OrderID} - {new Date(order.OrderDate).toLocaleString()}
                        </option>
                    ))}
                </select>
            </div>

            {/* ✅ แสดงข้อมูล Payment */}
            {paymentDetails ? (
                <div className="p-3 mb-4 rounded shadow-sm" style={styles.paymentDetails}>
                    <h4 className="text-center text-dark fw-bold">Payment Information</h4>
                    <p><strong>Payment ID:</strong> {paymentDetails.PaymentID}</p>
                    <p><strong>Order ID:</strong> {paymentDetails.OrderID}</p>
                    <p><strong>Payment Method:</strong> {paymentDetails.PaymentMethod}</p>
                    <p><strong>Amount:</strong> {parseFloat(paymentDetails.Amount).toLocaleString()} บาท</p>
                    <p><strong>Payment Date:</strong> {new Date(paymentDetails.PaymentDate).toLocaleString()}</p>
                    <p>
                        <strong>Status:</strong> 
                        <span className="badge ms-2" style={getStatusStyle(paymentDetails.Status)}>
                            {paymentDetails.Status}
                        </span>
                    </p>
                </div>
            ) : (
                <p className="text-center text-danger fs-4">Please select an Order ID to view payment details.</p>
            )}
        </motion.div>
    );
};

// ✅ ฟังก์ชันกำหนดสีของสถานะ Payment
const getStatusStyle = (status) => {
    switch (status) {
        case "Completed": return { backgroundColor: "#2a9d8f", color: "white", padding: "8px 12px", borderRadius: "5px" };
        case "Pending": return { backgroundColor: "#f4a261", color: "white", padding: "8px 12px", borderRadius: "5px" };
        default: return { backgroundColor: "#ddd", color: "black", padding: "8px 12px", borderRadius: "5px" };
    }
};

// ✅ สไตล์ UI
const styles = {
    card: {
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    },
    paymentDetails: {
        backgroundColor: "#f1faee",
        borderRadius: "10px",
        padding: "15px",
    },
};

export default PaymentHistory;
