import { useState } from "react";

function ElectricityBill() {
  const [customerName, setCustomerName] = useState("");
  const [consumption, setConsumption] = useState("");
  const [bill, setBill] = useState(null);

  function handleCalculate(event) {
    event.preventDefault();

    // TODO: Convert consumption to a number.
    // TODO: Decide rate using if / else if / else.
    // TODO: Calculate total bill and usage status.
    setBill({
      customerName,
      consumption,
      rate: "TODO",
      total: "TODO",
      status: "TODO"
    });
  }

  function handleClear() {
    // TODO: Clear all fields and bill result.
  }

  return (
    <section className="card">
      <p className="eyebrow">Activity 4</p>
      <h2>Electricity Bill Calculator</h2>

      <form onSubmit={handleCalculate} className="form-grid">
        <label>
          Customer Name
          <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Enter customer name" />
        </label>

        <label>
          Consumption (kWh)
          <input type="number" value={consumption} onChange={(event) => setConsumption(event.target.value)} placeholder="Enter kWh" />
        </label>

        <div className="button-row">
          <button type="submit">Calculate Bill</button>
          <button type="button" className="secondary" onClick={handleClear}>Clear</button>
        </div>
      </form>

      {bill && (
        <div className="result-panel">
          <p>Customer: {bill.customerName}</p>
          <p>Consumption: {bill.consumption}</p>
          <p>Rate Applied: {bill.rate}</p>
          <p>Total Bill: {bill.total}</p>
          <p>Usage Status: {bill.status}</p>
        </div>
      )}
    </section>
  );
}

export default ElectricityBill;
