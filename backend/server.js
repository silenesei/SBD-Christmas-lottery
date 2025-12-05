const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const TICKETS_FILE = __dirname + "/tickets.json";
const TOTAL_TICKETS = 200;

// początkowa pula losów
let state = {
  available: Array.from({ length: TOTAL_TICKETS }, (_, i) => i + 1),
  history: [],
};

// wczytanie stanu z pliku, jeśli istnieje
if (fs.existsSync(TICKETS_FILE)) {
  try {
    const savedState = JSON.parse(fs.readFileSync(TICKETS_FILE, "utf-8"));
    state = savedState;
    console.log("Wczytano stan z tickets.json");
  } catch (err) {
    console.error("Błąd wczytywania tickets.json:", err);
  }
}

// GET - pobierz aktualny stan
app.get("/tickets", (req, res) => {
  res.json(state);
});

// POST - kupowanie losów
app.post("/buy", (req, res) => {
  const { name, amount } = req.body;

  if (!name || !amount || amount < 10) {
    return res
      .status(400)
      .json({ error: "Podaj poprawne dane i kwotę min. 10 zł" });
  }

  const numTickets = Math.floor(amount / 10);

  if (state.available.length === 0) {
    return res.status(400).json({ error: "Brak dostępnych losów" });
  }

  const ticketsToBuy = Math.min(numTickets, state.available.length);
  const newTickets = [];

  for (let i = 0; i < ticketsToBuy; i++) {
    const idx = Math.floor(Math.random() * state.available.length);
    newTickets.push(state.available[idx]);
    state.available.splice(idx, 1);
  }

  state.history.push({ name, tickets: newTickets });

  // zapis do pliku
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(state, null, 2));

  res.json({ tickets: newTickets });
});

// GET - resetowanie losów / faza testowa

// app.get("/reset", (req, res) => {
//   state = {
//     available: Array.from({ length: TOTAL_TICKETS }, (_, i) => i + 1),
//     history: [],
//   };

//   fs.writeFile(TICKETS_FILE, JSON.stringify(state, null, 2), (err) => {
//     if (err) return res.status(500).json({ message: "Błąd resetowania" });
//     res.json({ message: "Reset udany" });
//   });
// });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
