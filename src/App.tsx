import { useState, useMemo } from "react";
import { Plus, Trash2, RefreshCcw, Info } from "lucide-react";

// --- TypeScript Interfaces ---
interface OutcomeData {
  id: string;
  name: string;
  odds: string | number;
  stake: string | number;
  isWin: boolean;
}

interface EventData {
  id: string;
  name: string;
  outcomes: OutcomeData[];
}

// --- Helper Logic ---
const generateId = () => Math.random().toString(36).substring(2, 9);

const calculateOutcomePL = (odds: string | number, stake: string | number, isWin: boolean) => {
  const numOdds = parseFloat(odds.toString()) || 0;
  const numStake = parseFloat(stake.toString()) || 0;
  if (isWin) {
    return numStake * (numOdds - 1);
  }
  return -numStake;
};

// --- Components ---

interface OutcomeRowProps {
  outcome: OutcomeData;
  onUpdate: (updated: OutcomeData) => void;
  onDelete: () => void;
}

const OutcomeRow = ({ outcome, onUpdate, onDelete }: OutcomeRowProps) => {
  const profit = calculateOutcomePL(outcome.odds, outcome.stake, outcome.isWin);

  const profitColor =
    profit > 0
      ? "text-green-600 font-bold"
      : profit < 0
      ? "text-red-600 font-bold"
      : "text-gray-400";
  const bgState = outcome.isWin
    ? "bg-green-100 border-green-500"
    : "bg-red-50 border-red-200";

  return (
    <div className={`grid grid-cols-12 gap-2 items-center p-2 mb-2 rounded border-l-4 ${bgState} transition-all duration-200`}>
      <div className="col-span-3">
        <input
          type="text"
          placeholder="Outcome Name"
          className="w-full p-1 text-sm border rounded bg-white/50"
          value={outcome.name}
          onChange={(e) => onUpdate({ ...outcome, name: e.target.value })}
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          placeholder="Odds"
          className="w-full p-1 text-sm border rounded text-center"
          value={outcome.odds}
          onChange={(e) => onUpdate({ ...outcome, odds: e.target.value })}
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          placeholder="Stake"
          className="w-full p-1 text-sm border rounded text-center"
          value={outcome.stake}
          onChange={(e) => onUpdate({ ...outcome, stake: e.target.value })}
        />
      </div>
      <div className="col-span-2 flex justify-center">
        <button
          onClick={() => onUpdate({ ...outcome, isWin: !outcome.isWin })}
          className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm w-20 transition-colors ${
            outcome.isWin ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-400 text-white hover:bg-red-500"
          }`}
        >
          {outcome.isWin ? "WIN" : "LOSE"}
        </button>
      </div>
      <div className={`col-span-2 text-right ${profitColor}`}>
        {profit >= 0 ? "+" : ""}
        {profit.toFixed(2)}
      </div>
      <div className="col-span-1 flex justify-end">
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

interface EventCardProps {
  event: EventData;
  onUpdateEvent: (updated: EventData) => void;
  onDeleteEvent: () => void;
}

const EventCard = ({ event, onUpdateEvent, onDeleteEvent }: EventCardProps) => {
  const eventStats = useMemo(() => {
    let totalStake = 0;
    let currentPL = 0;
    let impliedProbSum = 0;

    event.outcomes.forEach((o) => {
      const p = calculateOutcomePL(o.odds, o.stake, o.isWin);
      totalStake += parseFloat(o.stake.toString()) || 0;
      currentPL += p;
      if (parseFloat(o.odds.toString()) > 0) {
        impliedProbSum += 1 / parseFloat(o.odds.toString());
      }
    });

    return { totalStake, currentPL, impliedProbSum };
  }, [event.outcomes]);

  const updateOutcome = (updatedOutcome: OutcomeData) => {
    const newOutcomes = event.outcomes.map((o) =>
      o.id === updatedOutcome.id ? updatedOutcome : o
    );
    onUpdateEvent({ ...event, outcomes: newOutcomes });
  };

  const addOutcome = () => {
    const newOutcome: OutcomeData = {
      id: generateId(),
      name: "",
      odds: "",
      stake: "",
      isWin: false,
    };
    onUpdateEvent({ ...event, outcomes: [...event.outcomes, newOutcome] });
  };

  const deleteOutcome = (id: string) => {
    const newOutcomes = event.outcomes.filter((o) => o.id !== id);
    onUpdateEvent({ ...event, outcomes: newOutcomes });
  };

  const setAllResults = (status: boolean) => {
    const newOutcomes = event.outcomes.map((o) => ({ ...o, isWin: status }));
    onUpdateEvent({ ...event, outcomes: newOutcomes });
  };

  const setRandomResults = () => {
    const newOutcomes = event.outcomes.map((o) => ({
      ...o,
      isWin: Math.random() < 0.5,
    }));
    onUpdateEvent({ ...event, outcomes: newOutcomes });
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
        <input
          className="font-bold text-lg bg-transparent border-none focus:ring-0 text-gray-800"
          value={event.name}
          onChange={(e) => onUpdateEvent({ ...event, name: e.target.value })}
          placeholder="Event Name (e.g., Match 1)"
        />
        <div className="flex gap-2">
          <button onClick={() => setAllResults(true)} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
            All Win
          </button>
          <button onClick={() => setAllResults(false)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
            All Lose
          </button>
          <button onClick={setRandomResults} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1">
            <RefreshCcw size={10} /> Random
          </button>
          <button onClick={onDeleteEvent} className="text-gray-400 hover:text-red-500 ml-2">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
        <div className="col-span-3">Outcome</div>
        <div className="col-span-2 text-center">Decimal Odds</div>
        <div className="col-span-2 text-center">Stake</div>
        <div className="col-span-2 text-center">Result</div>
        <div className="col-span-2 text-right">Profit/Loss</div>
        <div className="col-span-1"></div>
      </div>

      <div className="p-2">
        {event.outcomes.map((outcome) => (
          <OutcomeRow
            key={outcome.id}
            outcome={outcome}
            onUpdate={updateOutcome}
            onDelete={() => deleteOutcome(outcome.id)}
          />
        ))}
        <button
          onClick={addOutcome}
          className="w-full py-2 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50 border border-dashed rounded mt-2"
        >
          <Plus size={16} className="mr-1" /> Add Outcome
        </button>
      </div>

      <div className="bg-gray-50 p-4 border-t grid grid-cols-2 gap-4">
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1 mb-1 font-semibold">
            <Info size={12} /> Market Structure
          </div>
          <div>
            Implied Probability Sum: <span className="font-mono">{(eventStats.impliedProbSum * 100).toFixed(1)}%</span>
          </div>
          {eventStats.impliedProbSum < 1 && eventStats.impliedProbSum > 0 && (
            <div className="text-green-600 font-bold">Arbitrage Opportunity Detected</div>
          )}
          {eventStats.impliedProbSum > 1 && (
            <div>Market Margin (Vig): {((eventStats.impliedProbSum - 1) * 100).toFixed(1)}%</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Event Stake: <span className="font-mono">{eventStats.totalStake.toFixed(2)}</span>
          </div>
          <div className="text-lg font-bold flex justify-end items-center gap-2">
            Event P/L:
            <span className={`font-mono ${eventStats.currentPL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {eventStats.currentPL >= 0 ? "+" : ""}
              {eventStats.currentPL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [events, setEvents] = useState<EventData[]>([
    {
      id: generateId(),
      name: "Example Event",
      outcomes: [
        { id: generateId(), name: "Home", odds: 2.5, stake: 100, isWin: true },
        { id: generateId(), name: "Draw", odds: 3.2, stake: 50, isWin: false },
        { id: generateId(), name: "Away", odds: 2.8, stake: 0, isWin: false },
      ],
    },
  ]);

  const addEvent = () => {
    setEvents([
      ...events,
      {
        id: generateId(),
        name: `Event ${events.length + 1}`,
        outcomes: [
          {
            id: generateId(),
            name: "Option A",
            odds: 2.0,
            stake: 10,
            isWin: false,
          },
        ],
      },
    ]);
  };

  const updateEvent = (updatedEvent: EventData) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const globalStats = useMemo(() => {
    let grandTotalStake = 0;
    let grandTotalPL = 0;

    events.forEach((e) => {
      e.outcomes.forEach((o) => {
        grandTotalStake += parseFloat(o.stake.toString()) || 0;
        grandTotalPL += calculateOutcomePL(o.odds, o.stake, o.isWin);
      });
    });

    return { grandTotalStake, grandTotalPL };
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Outcome Variance Simulator</h1>
          <p className="text-gray-600 text-sm max-w-2xl">
            A deterministic tool for analyzing probability, risk distribution, and "what-if" scenarios. Define outcomes, set toggles, and view instant P/L calculations. This is a calculator, not a predictor.
          </p>
        </header>

        <div className="bg-slate-800 text-white p-4 rounded-lg shadow-lg mb-8 flex justify-between items-center sticky top-4 z-10">
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Total Exposure</span>
            <div className="text-2xl font-mono font-bold">{globalStats.grandTotalStake.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-xs uppercase tracking-wider">Grand Total Profit/Loss</span>
            <div className={`text-3xl font-mono font-bold ${globalStats.grandTotalPL >= 0 ? "text-green-400" : "text-red-400"}`}>
              {globalStats.grandTotalPL >= 0 ? "+" : ""}
              {globalStats.grandTotalPL.toFixed(2)}
            </div>
          </div>
        </div>

        <div>
          {events.map((event) => (
            <EventCard key={event.id} event={event} onUpdateEvent={updateEvent} onDeleteEvent={() => deleteEvent(event.id)} />
          ))}
        </div>

        <button
          onClick={addEvent}
          className="w-full py-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-semibold hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add New Event
        </button>
      </div>
    </div>
  );
}