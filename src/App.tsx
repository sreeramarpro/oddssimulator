import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, RefreshCcw, Info, Play, X, Skull } from "lucide-react";

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

// --- COMPONENTS: Variance Calculator ---

interface OutcomeData { id: string; name: string; odds: string | number; stake: string | number; isWin: boolean; }
interface EventData { id: string; name: string; outcomes: OutcomeData[]; }

const OutcomeRow = ({ outcome, onUpdate, onDelete }: { outcome: OutcomeData, onUpdate: any, onDelete: any }) => {
  const profit = calculateOutcomePL(outcome.odds, outcome.stake, outcome.isWin);
  const profitColor = profit > 0 ? "text-green-700 font-bold" : profit < 0 ? "text-red-700 font-bold" : "text-gray-600";
  const bgState = outcome.isWin ? "bg-green-100 border-green-600" : "bg-red-100 border-red-600";

  return (
    <div className={`grid grid-cols-12 gap-2 items-center p-2 mb-2 rounded border-l-4 ${bgState} shadow-sm`}>
      <div className="col-span-3"><input type="text" placeholder="Outcome Name" className="w-full p-1 text-sm border-gray-300 rounded bg-white focus:ring-2 focus:ring-black" value={outcome.name} onChange={(e) => onUpdate({ ...outcome, name: e.target.value })} /></div>
      <div className="col-span-2"><input type="number" placeholder="Odds" className="w-full p-1 text-sm border-gray-300 rounded text-center focus:ring-2 focus:ring-black" value={outcome.odds} onChange={(e) => onUpdate({ ...outcome, odds: e.target.value })} /></div>
      <div className="col-span-2"><input type="number" placeholder="Stake" className="w-full p-1 text-sm border-gray-300 rounded text-center focus:ring-2 focus:ring-black" value={outcome.stake} onChange={(e) => onUpdate({ ...outcome, stake: e.target.value })} /></div>
      <div className="col-span-2 flex justify-center"><button onClick={() => onUpdate({ ...outcome, isWin: !outcome.isWin })} className={`px-3 py-1 text-xs font-bold rounded-full shadow-md w-20 active:scale-95 ${outcome.isWin ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{outcome.isWin ? "WIN" : "LOSE"}</button></div>
      <div className={`col-span-2 text-right ${profitColor}`}>{profit >= 0 ? "+" : ""}{profit.toFixed(2)}</div>
      <div className="col-span-1 flex justify-end"><button onClick={onDelete} className="text-gray-500 hover:text-red-700"><Trash2 size={18} /></button></div>
    </div>
  );
};

const EventCard = ({ event, onUpdateEvent, onDeleteEvent }: { event: EventData, onUpdateEvent: any, onDeleteEvent: any }) => {
  const eventStats = useMemo(() => {
    let totalStake = 0; let currentPL = 0; let impliedProbSum = 0;
    event.outcomes.forEach((o) => {
      const p = calculateOutcomePL(o.odds, o.stake, o.isWin);
      totalStake += parseFloat(o.stake.toString()) || 0; currentPL += p;
      if (parseFloat(o.odds.toString()) > 0) impliedProbSum += 1 / parseFloat(o.odds.toString());
    });
    return { totalStake, currentPL, impliedProbSum };
  }, [event.outcomes]);

  const updateOutcome = (upd: OutcomeData) => onUpdateEvent({ ...event, outcomes: event.outcomes.map(o => o.id === upd.id ? upd : o) });
  const addOutcome = () => onUpdateEvent({ ...event, outcomes: [...event.outcomes, { id: generateId(), name: "", odds: "", stake: "", isWin: false }] });
  const deleteOutcome = (id: string) => onUpdateEvent({ ...event, outcomes: event.outcomes.filter(o => o.id !== id) });
  const setAll = (status: boolean) => onUpdateEvent({ ...event, outcomes: event.outcomes.map(o => ({ ...o, isWin: status })) });
  const setRandom = () => onUpdateEvent({ ...event, outcomes: event.outcomes.map(o => ({ ...o, isWin: Math.random() < 0.5 })) });

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 border-2 border-black overflow-hidden">
      <div className="bg-gray-100 p-4 border-b-2 border-black flex justify-between items-center">
        <input className="font-bold text-lg bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500" value={event.name} onChange={(e) => onUpdateEvent({ ...event, name: e.target.value })} placeholder="Event Name (e.g., Match 1)" />
        <div className="flex gap-2">
          <button onClick={() => setAll(true)} className="text-xs px-3 py-1.5 bg-green-200 text-green-800 font-semibold rounded border border-green-700">All Win</button>
          <button onClick={() => setAll(false)} className="text-xs px-3 py-1.5 bg-red-200 text-red-800 font-semibold rounded border border-red-700">All Lose</button>
          <button onClick={setRandom} className="text-xs px-3 py-1.5 bg-blue-200 text-blue-800 font-semibold rounded border border-blue-700 flex items-center gap-1"><RefreshCcw size={12} /> Random</button>
          <button onClick={onDeleteEvent} className="text-gray-500 hover:text-red-700 ml-2"><Trash2 size={20} /></button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
        <div className="col-span-3">Outcome</div><div className="col-span-2 text-center">Decimal Odds</div><div className="col-span-2 text-center">Stake</div><div className="col-span-2 text-center">Result</div><div className="col-span-2 text-right">Profit/Loss</div><div className="col-span-1"></div>
      </div>
      <div className="p-3 bg-gray-50">
        {event.outcomes.map(o => <OutcomeRow key={o.id} outcome={o} onUpdate={updateOutcome} onDelete={() => deleteOutcome(o.id)} />)}
        <button onClick={addOutcome} className="w-full py-2.5 flex items-center justify-center text-sm font-semibold text-gray-600 hover:text-black border-2 border-dashed border-gray-400 hover:border-black rounded-lg mt-3 transition-all"><Plus size={18} className="mr-1" /> Add Outcome</button>
      </div>
      <div className="bg-gray-100 p-4 border-t-2 border-black grid grid-cols-2 gap-4">
        <div className="text-xs text-gray-700">
          <div className="flex items-center gap-1 mb-2 font-bold text-sm"><Info size={14} /> Market Structure</div>
          <div>Implied Prob: <span className="font-mono font-bold">{(eventStats.impliedProbSum * 100).toFixed(1)}%</span></div>
          {eventStats.impliedProbSum < 1 && eventStats.impliedProbSum > 0 && <div className="text-green-700 font-black">Arbitrage Detected</div>}
          {eventStats.impliedProbSum > 1 && <div>Vig: <span className="font-bold">{((eventStats.impliedProbSum - 1) * 100).toFixed(1)}%</span></div>}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-700 mb-1">Stake: <span className="font-mono font-bold">{eventStats.totalStake.toFixed(2)}</span></div>
          <div className="text-xl font-black flex justify-end items-center gap-2">P/L: <span className={`font-mono ${eventStats.currentPL >= 0 ? "text-green-700" : "text-red-700"}`}>{eventStats.currentPL >= 0 ? "+" : ""}{eventStats.currentPL.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS: Monte Carlo Engine ---
const MonteCarloEngine = () => {
  const [bankroll, setBankroll] = useState<number>(1000);
  const [betSize, setBetSize] = useState<number>(50);
  const [winProb, setWinProb] = useState<number>(51); 
  const [odds, setOdds] = useState<number>(1.90);
  const [numBets, setNumBets] = useState<number>(200);

  const [simulations, setSimulations] = useState<number[][]>([]);
  const [ruinCount, setRuinCount] = useState<number>(0);
  const [maxY, setMaxY] = useState<number>(2000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const expectedValue = useMemo(() => {
    const pWin = winProb / 100;
    const pLose = 1 - pWin;
    const winAmount = betSize * (odds - 1);
    return (pWin * winAmount) - (pLose * betSize);
  }, [betSize, winProb, odds]);

  const runSimulations = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const runs = 100;
      const newSims: number[][] = [];
      let ruined = 0;
      let absoluteMax = bankroll * 1.5;

      for (let i = 0; i < runs; i++) {
        let currentBR = bankroll;
        const trajectory = [currentBR];
        for (let b = 0; b < numBets; b++) {
          if (currentBR <= 0) { trajectory.push(0); continue; }
          const isWin = Math.random() < (winProb / 100);
          if (isWin) currentBR += betSize * (odds - 1);
          else currentBR -= betSize;
          
          if (currentBR < 0) currentBR = 0;
          if (currentBR > absoluteMax) absoluteMax = currentBR;
          trajectory.push(currentBR);
        }
        if (currentBR === 0) ruined++;
        newSims.push(trajectory);
      }
      setSimulations(newSims); setRuinCount(ruined); setMaxY(absoluteMax); setIsSimulating(false);
    }, 50);
  };

  useEffect(() => { runSimulations(); }, []); 

  return (
    <div className="w-full relative">
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#D2FF00] border-[8px] border-black p-8 md:p-12 max-w-3xl w-full relative shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-black hover:scale-110 hover:rotate-90 transition-all duration-300"><X size={40} strokeWidth={4} /></button>
            <h3 className="font-['Anton'] text-5xl md:text-6xl uppercase mb-6 text-black tracking-tight leading-none">What is a Monte Carlo Simulation?</h3>
            <div className="text-black font-medium text-lg md:text-xl leading-relaxed space-y-6">
              <p>Instead of trying to write one perfect mathematical equation to predict a chaotic future, Monte Carlo says: <span className="font-black bg-black text-[#D2FF00] px-2">"Let's just roll the dice a million times and see what happens on average."</span></p>
              <p>This engine creates <strong>100 alternate realities</strong> based on your rules. It then uses pure randomness to mathematically simulate every single bet in those timelines.</p>
              <p>By looking at the massive pile of fake results, the truth emerges. You don't know what will happen in <em>one</em> timeline, but if 42 out of 100 fake timelines ended in bankruptcy, you mathematically know your exact <strong>Risk of Ruin is 42%</strong>.</p>
            </div>
            <button onClick={() => setShowInfo(false)} className="mt-8 w-full py-4 bg-black text-[#D2FF00] font-['Anton'] text-2xl uppercase tracking-widest hover:bg-gray-800 transition-colors">Understood</button>
          </div>
        </div>
      )}

      <button onClick={() => setShowInfo(true)} className="w-full mb-6 py-3 bg-black text-[#D2FF00] font-['Anton'] text-xl md:text-2xl uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
        <Info size={28} strokeWidth={3} /> What is this?
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border-4 border-black flex flex-col shadow-sm">
          <label className="text-xs font-black uppercase mb-2">Starting Bankroll</label>
          <input type="number" value={bankroll} onChange={(e) => setBankroll(Number(e.target.value))} className="w-full text-2xl font-mono font-bold outline-none" />
        </div>
        <div className="bg-white p-4 rounded-xl border-4 border-black flex flex-col shadow-sm">
          <label className="text-xs font-black uppercase mb-2">Bet Size</label>
          <input type="number" value={betSize} onChange={(e) => setBetSize(Number(e.target.value))} className="w-full text-2xl font-mono font-bold outline-none" />
        </div>
        <div className="bg-white p-4 rounded-xl border-4 border-black flex flex-col shadow-sm">
          <label className="text-xs font-black uppercase mb-2">True Win Prob (%)</label>
          <input type="number" value={winProb} onChange={(e) => setWinProb(Number(e.target.value))} className="w-full text-2xl font-mono font-bold outline-none" />
        </div>
        <div className="bg-white p-4 rounded-xl border-4 border-black flex flex-col shadow-sm">
          <label className="text-xs font-black uppercase mb-2">Decimal Odds</label>
          <input type="number" step="0.01" value={odds} onChange={(e) => setOdds(Number(e.target.value))} className="w-full text-2xl font-mono font-bold outline-none" />
        </div>
        <div className="bg-white p-4 rounded-xl border-4 border-black flex flex-col shadow-sm">
          <label className="text-xs font-black uppercase mb-2">Number of Bets</label>
          <input type="number" value={numBets} onChange={(e) => setNumBets(Number(e.target.value))} className="w-full text-2xl font-mono font-bold outline-none" />
        </div>
      </div>

      <div className="bg-black text-[#D2FF00] p-6 rounded-xl shadow-xl mb-6 flex flex-col md:flex-row justify-between items-center border-4 border-black">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <span className="text-[#D2FF00]/80 text-sm uppercase tracking-widest font-bold block mb-1">Expected Value (Per Bet)</span>
          <div className={`text-4xl font-mono font-black ${expectedValue >= 0 ? "text-green-400" : "text-red-500"}`}>{expectedValue > 0 ? "+" : ""}{expectedValue.toFixed(2)}</div>
        </div>
        <button onClick={runSimulations} disabled={isSimulating} className="py-4 px-12 bg-[#D2FF00] border-4 border-[#D2FF00] hover:bg-black hover:text-[#D2FF00] text-black rounded-lg text-2xl font-black transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSimulating ? "CALCULATING..." : <><Play fill="currentColor" /> RUN 100 TIMELINES</>}
        </button>
        <div className="text-center md:text-right mt-4 md:mt-0">
          <span className="text-[#D2FF00]/80 text-sm uppercase tracking-widest font-bold block mb-1">Risk of Ruin (Bankruptcy)</span>
          <div className={`text-4xl font-mono font-black ${ruinCount > 0 ? "text-red-500" : "text-[#D2FF00]"}`}>{ruinCount}%</div>
        </div>
      </div>

      <div className="w-full bg-black border-4 border-black rounded-xl overflow-hidden relative" style={{ height: '400px' }}>
        <div className="absolute top-4 left-4 text-white/50 font-mono text-sm z-10 pointer-events-none">MAX: {maxY.toFixed(0)}</div>
        <div className="absolute bottom-4 left-4 text-white/50 font-mono text-sm z-10 pointer-events-none">0 (RUIN)</div>
        <svg viewBox={`0 0 1000 400`} preserveAspectRatio="none" className="w-full h-full">
          <line x1="0" y1="200" x2="1000" y2="200" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={400 - (bankroll / maxY) * 400} x2="1000" y2={400 - (bankroll / maxY) * 400} stroke="#D2FF00" strokeWidth="2" strokeDasharray="8 8" opacity="0.5" />
          {simulations.map((traj, i) => {
            const isRuined = traj[traj.length - 1] === 0;
            const isProfit = traj[traj.length - 1] > bankroll;
            const color = isRuined ? "#EF4444" : (isProfit ? "#D2FF00" : "#9CA3AF");
            const points = traj.map((val, step) => `${(step / numBets) * 1000},${400 - ((val / maxY) * 400)}`).join(" ");
            return <polyline key={i} points={points} fill="none" stroke={color} strokeWidth={isRuined ? "2" : "1.5"} opacity={isRuined ? "0.8" : "0.3"} />;
          })}
        </svg>
      </div>
    </div>
  );
};

// --- COMPONENTS: Martingale Simulator ---
const MartingaleEngine = () => {
  const [bankroll, setBankroll] = useState<number>(10000);
  const [startingBet, setStartingBet] = useState<number>(10);
  const [winProb, setWinProb] = useState<number>(49.5); 
  
  const [fullTrajectory, setFullTrajectory] = useState<number[]>([]);
  const [renderedTrajectory, setRenderedTrajectory] = useState<number[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const [currentBetsSurvived, setCurrentBetsSurvived] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  
  const MAX_BETS = 5000;

  const runSimulation = () => {
    setIsSimulating(true);
    setRenderedTrajectory([]);
    setCurrentBetsSurvived(0);

    setTimeout(() => {
      let currentBR = bankroll;
      let currentBet = startingBet;
      const traj = [currentBR];
      let bets = 0;
      let absoluteMax = bankroll;

      while (currentBR > 0 && bets < MAX_BETS) {
        bets++;
        if (currentBet > currentBR) { currentBet = currentBR; }

        const isWin = Math.random() < (winProb / 100);
        
        if (isWin) {
          currentBR += currentBet; 
          currentBet = startingBet; 
        } else {
          currentBR -= currentBet;
          currentBet *= 2; 
        }

        if (currentBR > absoluteMax) absoluteMax = currentBR;
        traj.push(currentBR);

        if (currentBR <= 0) break;
      }

      setMaxReached(absoluteMax);
      setFullTrajectory(traj);
    }, 50);
  };

  useEffect(() => {
    if (fullTrajectory.length > 0) {
      let currentStep = 0;
      const totalSteps = fullTrajectory.length;
      const stepSize = Math.max(1, Math.floor(totalSteps / 100)); 

      const interval = setInterval(() => {
        currentStep += stepSize;
        if (currentStep >= totalSteps) {
          currentStep = totalSteps;
          setIsSimulating(false);
          clearInterval(interval);
        }
        setRenderedTrajectory(fullTrajectory.slice(0, currentStep));
        setCurrentBetsSurvived(currentStep - 1); 
      }, 16); 

      return () => clearInterval(interval);
    }
  }, [fullTrajectory]);

  const chartMaxX = Math.max(fullTrajectory.length - 1, 100); 
  const isCurrentlyRuined = renderedTrajectory[renderedTrajectory.length - 1] <= 0;
  const chartMaxY = Math.max(maxReached * 1.1, bankroll); 

  // Check if simulation is completely done, they survived, AND their final bankroll is higher than starting
  const isFinished = !isSimulating && fullTrajectory.length > 0 && renderedTrajectory.length === fullTrajectory.length;
  const survivedAndProfitable = isFinished && !isCurrentlyRuined && renderedTrajectory[renderedTrajectory.length - 1] > bankroll;

  return (
    <div className="w-full relative">
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#D2FF00] border-[8px] border-black p-8 md:p-12 max-w-3xl w-full relative shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-black hover:scale-110 hover:rotate-90 transition-all duration-300"><X size={40} strokeWidth={4} /></button>
            <h3 className="font-['Anton'] text-5xl md:text-6xl uppercase mb-6 text-black tracking-tight leading-none">The Death Spiral</h3>
            <div className="text-black font-medium text-lg md:text-xl leading-relaxed space-y-6">
              <p>Every beginner gambler eventually "invents" the Martingale strategy: <span className="font-black bg-black text-[#D2FF00] px-2">"If I lose, I just double my bet next time so I win my money back."</span></p>
              <p>It feels mathematically bulletproof because you only need to win *once* to get your original stake back. The graph will look amazing... right up until it doesn't.</p>
              <p>This engine proves why it fails: <strong>Exponential Growth</strong>. If you start with $10, a streak of just 10 losses requires a bet of $5,120 just to win $10 back. Run the simulation and watch a massive $10,000 bankroll inevitably evaporate over a tiny $10 base bet.</p>
            </div>
            <button onClick={() => setShowInfo(false)} className="mt-8 w-full py-4 bg-black text-[#D2FF00] font-['Anton'] text-2xl uppercase tracking-widest hover:bg-gray-800 transition-colors">Understood</button>
          </div>
        </div>
      )}

      <button onClick={() => setShowInfo(true)} className="w-full mb-6 py-3 bg-black text-[#D2FF00] font-['Anton'] text-xl md:text-2xl uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
        <Skull size={28} strokeWidth={3} /> The Martingale Illusion
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border-4 border-black flex flex-col shadow-sm">
          <label className="text-xs font-black uppercase mb-2">Massive Bankroll</label>
          <input type="number" value={bankroll} onChange={(e) => setBankroll(Number(e.target.value))} className="w-full text-3xl font-mono font-bold outline-none" />
        </div>
        <div className="bg-white p-4 rounded-xl border-4 border-black flex flex-col shadow-sm">
          <label className="text-xs font-black uppercase mb-2">Tiny Starting Bet</label>
          <input type="number" value={startingBet} onChange={(e) => setStartingBet(Number(e.target.value))} className="w-full text-3xl font-mono font-bold outline-none" />
        </div>
        <div className="bg-white p-4 rounded-xl border-4 border-black flex flex-col shadow-sm">
          <label className="text-xs font-black uppercase mb-2">Win Probability (%)</label>
          <input type="number" step="0.1" value={winProb} onChange={(e) => setWinProb(Number(e.target.value))} className="w-full text-3xl font-mono font-bold outline-none" />
        </div>
      </div>

      <div className="bg-black text-[#D2FF00] p-6 rounded-xl shadow-xl mb-6 flex flex-col md:flex-row justify-between items-center border-4 border-black">
        <div className="text-center md:text-left mb-4 md:mb-0 w-1/3">
          <span className="text-[#D2FF00]/80 text-sm uppercase tracking-widest font-bold block mb-1">Bets Survived</span>
          <div className="text-4xl font-mono font-black">{Math.max(0, currentBetsSurvived)} / {MAX_BETS}</div>
        </div>
        
        <button onClick={runSimulation} disabled={isSimulating} className="w-full md:w-1/3 py-4 bg-red-600 border-4 border-red-600 hover:bg-black hover:text-red-600 text-white rounded-lg text-2xl font-black transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50">
          {isSimulating ? "CALCULATING..." : <><Play fill="currentColor" /> TEST FATE</>}
        </button>

        <div className="text-center md:text-right mt-4 md:mt-0 w-1/3">
          <span className="text-[#D2FF00]/80 text-sm uppercase tracking-widest font-bold block mb-1">Current Bankroll</span>
          <div className={`text-4xl font-mono font-black ${isCurrentlyRuined ? "text-red-500" : "text-[#D2FF00]"}`}>
            ${renderedTrajectory.length > 0 ? renderedTrajectory[renderedTrajectory.length - 1].toFixed(0) : bankroll.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="w-full bg-black border-4 border-black rounded-xl overflow-hidden relative" style={{ height: '500px' }}>
        <div className="absolute top-4 left-4 text-white/50 font-mono text-sm z-10 pointer-events-none">PEAK: ${maxReached.toFixed(2)}</div>
        <div className="absolute bottom-4 left-4 text-white/50 font-mono text-sm z-10 pointer-events-none">0 (RUIN)</div>
        
        {/* The Brutalist "You Were Lucky" Overlay */}
        {survivedAndProfitable && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#D2FF00]/90 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
            <div className="text-center border-8 border-black p-8 bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
              <h2 className="font-['Anton'] text-6xl md:text-8xl text-black uppercase leading-none tracking-tighter mb-4">You Were Lucky <br/> This Time.</h2>
              <p className="font-mono text-xl font-black text-red-600 uppercase">Mathematics is still waiting for you.</p>
            </div>
          </div>
        )}

        <svg viewBox={`0 0 1000 500`} preserveAspectRatio="none" className="w-full h-full">
          <line x1="0" y1={500 - (bankroll / chartMaxY) * 500} x2="1000" y2={500 - (bankroll / chartMaxY) * 500} stroke="#D2FF00" strokeWidth="2" strokeDasharray="8 8" opacity="0.3" />
          
          {renderedTrajectory.length > 0 && (
            <polyline 
              points={renderedTrajectory.map((val, step) => `${(step / chartMaxX) * 1000},${500 - ((val / chartMaxY) * 500)}`).join(" ")} 
              fill="none" 
              stroke={isCurrentlyRuined ? "#EF4444" : "#D2FF00"} 
              strokeWidth="4" 
            />
          )}
          
          {renderedTrajectory.length > 0 && (
            <polygon 
              points={`0,500 ${renderedTrajectory.map((val, step) => `${(step / chartMaxX) * 1000},${500 - ((val / chartMaxY) * 500)}`).join(" ")} ${(renderedTrajectory.length - 1) / chartMaxX * 1000},500`} 
              fill={isCurrentlyRuined ? "rgba(239, 68, 68, 0.1)" : "rgba(210, 255, 0, 0.1)"} 
            />
          )}
        </svg>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'calc' | 'monte' | 'martingale'>('calc');
  const [events, setEvents] = useState<EventData[]>([{ id: generateId(), name: "Example Event", outcomes: [{ id: generateId(), name: "Home", odds: 2.5, stake: 100, isWin: true }, { id: generateId(), name: "Draw", odds: 3.2, stake: 50, isWin: false }, { id: generateId(), name: "Away", odds: 2.8, stake: 0, isWin: false }] }]);

  const globalStats = useMemo(() => {
    let grandTotalStake = 0; let grandTotalPL = 0;
    events.forEach(e => e.outcomes.forEach(o => { grandTotalStake += parseFloat(o.stake.toString()) || 0; grandTotalPL += calculateOutcomePL(o.odds, o.stake, o.isWin); }));
    return { grandTotalStake, grandTotalPL };
  }, [events]);

  return (
    <div className="min-h-screen bg-[#D2FF00] font-sans text-gray-900 flex flex-col items-center overflow-x-hidden">
      
      {/* Header */}
      <header className="w-full select-none flex justify-center border-b-[10px] md:border-b-[16px] border-black pt-8 md:pt-12 mb-6 px-4 md:px-8 bg-[#D2FF00]">
        <div className="flex justify-center items-end w-full max-w-[1400px] gap-3 md:gap-6 font-['Anton'] font-normal whitespace-nowrap text-[4.5vw] md:text-[4vw] xl:text-[64px] tracking-tighter text-black uppercase pb-1 md:pb-2">
          <span className="transform scale-y-[1.3] origin-bottom">TERMINAL VARIANCE</span>
          <span className="transform scale-y-[1.3] origin-bottom opacity-80">-</span>
          <span className="transform scale-y-[1.3] origin-bottom">Do Not Gamble</span>
        </div>
      </header>

      {/* Brutalist 3-Way Tab Switcher */}
      <div className="w-full max-w-[1400px] px-4 md:px-8 mb-8">
        <div className="flex flex-col md:flex-row border-4 border-black rounded-xl overflow-hidden bg-black shadow-xl gap-1 md:gap-2">
          <button onClick={() => setActiveTab('calc')} className={`flex-1 py-4 text-lg md:text-2xl font-['Anton'] uppercase tracking-wide transition-colors ${activeTab === 'calc' ? 'bg-[#D2FF00] text-black' : 'bg-white hover:bg-gray-200 text-black'}`}>
            Variance Calculator
          </button>
          <button onClick={() => setActiveTab('monte')} className={`flex-1 py-4 text-lg md:text-2xl font-['Anton'] uppercase tracking-wide transition-colors ${activeTab === 'monte' ? 'bg-[#D2FF00] text-black' : 'bg-white hover:bg-gray-200 text-black'}`}>
            Monte Carlo
          </button>
          <button onClick={() => setActiveTab('martingale')} className={`flex-1 py-4 text-lg md:text-2xl font-['Anton'] uppercase tracking-wide transition-colors ${activeTab === 'martingale' ? 'bg-red-500 text-white' : 'bg-white hover:bg-gray-200 text-black'}`}>
            Death Spiral
          </button>
        </div>
      </div>

      <main className="w-full max-w-[1400px] px-4 md:px-8 pb-16">
        
        {/* VIEW 1: Variance Calculator */}
        {activeTab === 'calc' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-black text-[#D2FF00] p-6 md:p-8 rounded-xl shadow-2xl mb-10 flex flex-col md:flex-row justify-between items-center sticky top-4 z-10 border-4 border-black">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <span className="text-[#D2FF00]/80 text-sm uppercase tracking-widest font-bold">Total Exposure</span>
                <div className="text-4xl md:text-5xl font-mono font-black">{globalStats.grandTotalStake.toFixed(2)}</div>
              </div>
              <div className="text-center md:text-right">
                <span className="text-[#D2FF00]/80 text-sm uppercase tracking-widest font-bold">Grand Total Profit/Loss</span>
                <div className={`text-5xl md:text-6xl font-mono font-black ${globalStats.grandTotalPL >= 0 ? "text-green-400" : "text-red-500"}`}>
                  {globalStats.grandTotalPL >= 0 ? "+" : ""}{globalStats.grandTotalPL.toFixed(2)}
                </div>
              </div>
            </div>

            {events.map(event => <EventCard key={event.id} event={event} onUpdateEvent={(upd: EventData) => setEvents(events.map(e => e.id === upd.id ? upd : e))} onDeleteEvent={() => setEvents(events.filter(e => e.id !== event.id))} />)}
            <button onClick={() => setEvents([...events, { id: generateId(), name: `Event ${events.length + 1}`, outcomes: [{ id: generateId(), name: "Option A", odds: 2.0, stake: 10, isWin: false }] }])} className="w-full py-6 md:py-8 bg-white border-4 border-dashed border-black rounded-xl text-2xl font-black text-black hover:bg-black hover:text-[#D2FF00] transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.99]">
              <Plus size={32} strokeWidth={3} /> ADD NEW EVENT
            </button>
          </div>
        )}

        {/* VIEW 2: Monte Carlo Engine */}
        {activeTab === 'monte' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <MonteCarloEngine />
          </div>
        )}

        {/* VIEW 3: Martingale Engine */}
        {activeTab === 'martingale' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <MartingaleEngine />
          </div>
        )}

      </main>
    </div>
  );
}