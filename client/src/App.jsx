import { useReducer, useEffect, useState } from "react";
import "./App.css";
import winterVideo from "./assets/winter_video.mp4";
import sbdLogo from "./assets/sbd_logo.png";
import mistletoe from "./assets/mistletoe.png";
import christmasMusic from "./assets/christmas-music.mp3";

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
  const [ticketAlert, setTicketAlert] = useState({
    message: "",
    visible: false,
  });

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch(
          "https://sbd-christmas-lottery-production.up.railway.app/tickets"
        );
        const data = await res.json();
        dispatch({ type: "INIT", payload: data });
      } catch (err) {
        console.error("Błąd pobierania stanu loterii:", err);
      }
    };
    fetchState();
  }, []);

  useEffect(() => {
    const player = document.getElementById("carol-player");
    const playBtn = document.getElementById("play-btn");
    const pauseBtn = document.getElementById("pause-btn");

    playBtn.addEventListener("click", () => player.play());
    pauseBtn.addEventListener("click", () => player.pause());

    return () => {
      playBtn.removeEventListener("click", () => player.play());
      pauseBtn.removeEventListener("click", () => player.pause());
    };
  }, []);

  const showTicketAlert = (name, tickets) => {
    setTicketAlert({
      message: (
        <>
          <p>
            Losy dla <b>{name}</b>:
          </p>
          <p>
            <b>{tickets.join(", ")}</b>
          </p>
        </>
      ),
      visible: true,
    });
  };

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
      const res = await fetch(
        "https://sbd-christmas-lottery-production.up.railway.app/buy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), amount: amountNum }),
        }
      );
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      showTicketAlert(name.trim(), data.tickets);
      setName("");
      setAmount("");

      const stateRes = await fetch(
        "https://sbd-christmas-lottery-production.up.railway.app/tickets"
      );
      const stateData = await stateRes.json();
      dispatch({ type: "INIT", payload: stateData });
    } catch (err) {
      alert("Błąd połączenia z serwerem");
      console.error(err);
    }
  };

  return (
    <div className="main-page">
      {ticketAlert.visible && (
        <div
          className="alert-overlay"
          onClick={() => setTicketAlert({ message: "", visible: false })}
        >
          <div className="custom-alert" onClick={(e) => e.stopPropagation()}>
            {ticketAlert.message}
            <button
              onClick={() => setTicketAlert({ message: "", visible: false })}
            >
              ✖
            </button>
          </div>
        </div>
      )}
      <video
        className="background-video"
        src={winterVideo}
        loop
        autoPlay
        muted
      ></video>
      <div id="audio-mini">
        <button id="play-btn">▶</button>
        <button id="pause-btn">⏸</button>
      </div>
      <audio id="carol-player">
        <source src={christmasMusic} />
      </audio>
      <div className="lottery-form">
        <img class="header-pic" src={mistletoe} alt="mistletoe-decoration" />
        <h1 className="title">Loteria świąteczna</h1>

        <h2>
          Wpłata minimalna: <b>10 PLN</b>
        </h2>
        <p>
          Wszystkie wpłaty zostaną przeznaczone <br /> na rzecz fundacji{" "}
          <b>"Głosem Zwierząt"</b>.
        </p>
        <h3>
          <a
            href="https://www.ratujemyzwierzaki.pl/sbdlosowaniemikolajki"
            target="_blank"
            rel="noopener noreferrer"
          >
            <u>Link do zbiórki</u>
          </a>
        </h3>
        <section className="inputs-btn">
          <input
            type="text"
            placeholder="Imię i nazwisko"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Wpłacona kwota w PLN"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button onClick={buyTickets}>LOSUJ</button>
        </section>

        <p className="available-tickets">
          Dostępne losy:{" "}
          <b>
            {state.available.length}/{TOTAL_TICKETS}
          </b>
        </p>
        <img className="logo-img" src={sbdLogo} alt="logo-image" />
      </div>
    </div>
  );
}
