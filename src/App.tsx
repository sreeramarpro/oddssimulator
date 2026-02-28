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
      ? "text-green-700 font-bold" 
      : profit < 0
      ? "text-red-700 font-bold" 
      : "text-gray-600";
  const bgState = outcome.isWin
    ? "bg-green-100 border-green-600"
    : "bg-red-100 border-red-600";

  return (
    <div className={`grid grid-cols-12 gap-2 items-center p-2 mb-2 rounded border-l-4 ${bgState} transition-all duration-200 shadow-sm`}>
      <div className="col-span-3">
        <input
          type="text"
          placeholder="Outcome Name"
          className="w-full p-1 text-sm border-gray-300 rounded bg-white focus:ring-2 focus:ring-black focus:border-transparent"
          value={outcome.name}
          onChange={(e) => onUpdate({ ...outcome, name: e.target.value })}
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          placeholder="Odds"
          className="w-full p-1 text-sm border-gray-300 rounded text-center focus:ring-2 focus:ring-black focus:border-transparent"
          value={outcome.odds}
          onChange={(e) => onUpdate({ ...outcome, odds: e.target.value })}
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          placeholder="Stake"
          className="w-full p-1 text-sm border-gray-300 rounded text-center focus:ring-2 focus:ring-black focus:border-transparent"
          value={outcome.stake}
          onChange={(e) => onUpdate({ ...outcome, stake: e.target.value })}
        />
      </div>
      <div className="col-span-2 flex justify-center">
        <button
          onClick={() => onUpdate({ ...outcome, isWin: !outcome.isWin })}
          className={`px-3 py-1 text-xs font-bold rounded-full shadow-md w-20 transition-transform active:scale-95 ${
            outcome.isWin ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"
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
        <button onClick={onDelete} className="text-gray-500 hover:text-red-700 transition-colors">
          <Trash2 size={18} />
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
    <div className="bg-white rounded-xl shadow-lg mb-6 border-2 border-black overflow-hidden">
      <div className="bg-gray-100 p-4 border-b-2 border-black flex justify-between items-center">
        <input
          className="font-bold text-lg bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500"
          value={event.name}
          onChange={(e) => onUpdateEvent({ ...event, name: e.target.value })}
          placeholder="Event Name (e.g., Match 1)"
        />
        <div className="flex gap-2">
          <button onClick={() => setAllResults(true)} className="text-xs px-3 py-1.5 bg-green-200 text-green-800 font-semibold rounded hover:bg-green-300 transition-colors border border-green-700">
            All Win
          </button>
          <button onClick={() => setAllResults(false)} className="text-xs px-3 py-1.5 bg-red-200 text-red-800 font-semibold rounded hover:bg-red-300 transition-colors border border-red-700">
            All Lose
          </button>
          <button onClick={setRandomResults} className="text-xs px-3 py-1.5 bg-blue-200 text-blue-800 font-semibold rounded hover:bg-blue-300 transition-colors border border-blue-700 flex items-center gap-1">
            <RefreshCcw size={12} /> Random
          </button>
          <button onClick={onDeleteEvent} className="text-gray-500 hover:text-red-700 ml-2 transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
        <div className="col-span-3">Outcome</div>
        <div className="col-span-2 text-center">Decimal Odds</div>
        <div className="col-span-2 text-center">Stake</div>
        <div className="col-span-2 text-center">Result</div>
        <div className="col-span-2 text-right">Profit/Loss</div>
        <div className="col-span-1"></div>
      </div>

      <div className="p-3 bg-gray-50">
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
          className="w-full py-2.5 flex items-center justify-center text-sm font-semibold text-gray-600 hover:text-black hover:bg-gray-200 border-2 border-dashed border-gray-400 hover:border-black rounded-lg mt-3 transition-all"
        >
          <Plus size={18} className="mr-1" /> Add Outcome
        </button>
      </div>

      <div className="bg-gray-100 p-4 border-t-2 border-black grid grid-cols-2 gap-4">
        <div className="text-xs text-gray-700">
          <div className="flex items-center gap-1 mb-2 font-bold text-sm">
            <Info size={14} /> Market Structure
          </div>
          <div className="mb-1">
            Implied Probability Sum: <span className="font-mono font-bold text-sm">{(eventStats.impliedProbSum * 100).toFixed(1)}%</span>
          </div>
          {eventStats.impliedProbSum < 1 && eventStats.impliedProbSum > 0 && (
            <div className="text-green-700 font-black">Arbitrage Opportunity Detected</div>
          )}
          {eventStats.impliedProbSum > 1 && (
            <div>Market Margin (Vig): <span className="font-bold">{((eventStats.impliedProbSum - 1) * 100).toFixed(1)}%</span></div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-700 mb-1">
            Event Stake: <span className="font-mono font-bold">{eventStats.totalStake.toFixed(2)}</span>
          </div>
          <div className="text-xl font-black flex justify-end items-center gap-2">
            Event P/L:
            <span className={`font-mono ${eventStats.currentPL >= 0 ? "text-green-700" : "text-red-700"}`}>
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
    <div className="min-h-screen bg-[#D2FF00] font-sans text-gray-900 flex flex-col items-center overflow-x-hidden">
      
      <header className="w-full select-none flex justify-center border-b-[10px] md:border-b-[16px] border-black pt-8 md:pt-12 mb-8 md:mb-12 px-4 md:px-8 bg-[#D2FF00]">
        <div className="flex justify-center items-end w-full max-w-[1400px] gap-3 md:gap-6 font-['Anton'] font-normal whitespace-nowrap text-[4.5vw] md:text-[4vw] xl:text-[64px] tracking-tighter text-black uppercase pb-1 md:pb-2">
          <span className="transform scale-y-[1.3] origin-bottom">Outcome Variance Simulator</span>
          <span className="transform scale-y-[1.3] origin-bottom opacity-80">-</span>
          <span className="transform scale-y-[1.3] origin-bottom">Do Not Gamble</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1400px] px-4 md:px-8 pb-16">
        <div className="bg-black text-[#D2FF00] p-6 md:p-8 rounded-xl shadow-2xl mb-10 flex flex-col md:flex-row justify-between items-center sticky top-4 z-10 border-4 border-black">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <span className="text-[#D2FF00]/80 text-sm uppercase tracking-widest font-bold">Total Exposure</span>
            <div className="text-4xl md:text-5xl font-mono font-black">{globalStats.grandTotalStake.toFixed(2)}</div>
          </div>
          <div className="text-center md:text-right">
            <span className="text-[#D2FF00]/80 text-sm uppercase tracking-widest font-bold">Grand Total Profit/Loss</span>
            <div className={`text-5xl md:text-6xl font-mono font-black ${globalStats.grandTotalPL >= 0 ? "text-green-400" : "text-red-500"}`}>
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
          className="w-full py-6 md:py-8 bg-white border-4 border-dashed border-black rounded-xl text-2xl font-black text-black hover:bg-black hover:text-[#D2FF00] transition-all duration-300 flex items-center justify-center gap-3 shadow-md active:scale-[0.99]"
        >
          <Plus size={32} strokeWidth={3} /> ADD NEW EVENT
        </button>
      </main>
      
    </div>
  );
}