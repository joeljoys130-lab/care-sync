import { useState } from "react";

function App() {
  const [payments, setPayments] = useState([]);

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZTczN2JhMjNkZmFjOTQwNjU1NGMyNyIsInJvbGUiOiJwYXRpZW50IiwiaWF0IjoxNzc2NzYwNzg0LCJleHAiOjE3NzczNjU1ODR9.ppZY8ertbYv325Rk9O8-eF-2w7o4JGY9vRlHLfsIfLs"; // token from Postman testing

  const handlePayment = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: "123", // ID from Postman testing
          amount: 500,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        alert("Payment successful");
      } else {
        alert(data.message || "Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong");
    }
  };

  const getPayments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log(data);
      setPayments(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Payment Demo</h1>

      <button onClick={handlePayment}>Pay Now</button>

      <br /><br />

      <button onClick={getPayments}>View Payment History</button>

      <h2>History</h2>

      {payments.map((p) => (
        <div key={p._id}>
          <p>Amount: ₹{p.amount}</p>
          <p>Status: {p.status}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;