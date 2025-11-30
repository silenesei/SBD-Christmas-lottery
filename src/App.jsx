import { useReducer, useEffect, useState } from "react";
import "./App.css";

const TOTAL_TICKETS = 200;

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return action.payload;
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, { available: [], history: [] });
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("http://localhost:4000/tickets");
        const data = await res.json();
        dispatch({ type: "INIT", payload: data });
      } catch (err) {
        console.error("Błąd pobierania stanu loterii:", err);
      }
    };
    fetchState();
  }, []);

  const buyTickets = async () => {
    if (!name.trim()) {
      alert("Podaj imię i nazwisko");
      return;
    }
    const amountNum = Number(amount);
    if (!amountNum || amountNum < 10) {
      alert("Kwota minimalna to 10 PLN");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), amount: amountNum }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      alert(`Wylosowano losy dla ${name.trim()}: ${data.tickets.join(", ")}`);
      setName("");
      setAmount("");

      const stateRes = await fetch("http://localhost:4000/tickets");
      const stateData = await stateRes.json();
      dispatch({ type: "INIT", payload: stateData });
    } catch (err) {
      alert("Błąd połączenia z serwerem");
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Loteria świąteczna</h1>
      <h2>Stanley Black&Decker</h2>
      <h3>Wpłata minimalna: 10 zł</h3>
      <h3>
        <a href="https://www.ratujemyzwierzaki.pl/sbdlosowaniemikolajki">
          Link do zbiórki
        </a>
      </h3>

      <input
        type="text"
        placeholder="Imię i nazwisko"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Kwota wpłaty"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={buyTickets}>Wygeneruj los</button>

      <p>
        Dostępne losy: {state.available.length}/{TOTAL_TICKETS}
      </p>
    </div>
  );
}
