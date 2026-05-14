import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Key, Sparkles, CheckCircle, X, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const DiagnosticBot = ({ machine, onClose }) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);
  
  const resolveMachineAlert = useStore(state => state.resolveMachineAlert);

  const handleDiagnose = async () => {
    if (!apiKey) {
      setError('Please provide a Gemini API Key in your .env file as VITE_GEMINI_API_KEY');
      return;
    }
    
    setIsDiagnosing(true);
    setError(null);

    const prompt = `You are an AI diagnostic assistant for an industrial manufacturing plant.
A machine is experiencing an issue. Analyze the logs and telemetry and provide a short, 1-2 sentence actionable solution. 
For example, "Add a particular machine and connect it to this one to balance the load" or "Clear the queue and restart the motor."
Do NOT provide code, only the actionable text.
    
Machine ID: ${machine.id}
Status: ${machine.status}
Telemetry: ${JSON.stringify(machine.telemetry)}
Recent Logs: ${JSON.stringify(machine.logs.slice(0, 5))}
`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini API. Check your key.');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        setSolution(text);
      } else {
        throw new Error('No valid response received.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleApplySolution = () => {
    resolveMachineAlert(machine.id);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col p-5 border border-brand-primary/20"
    >
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-brand-primary">
          <Bot className="w-5 h-5" />
          <h3 className="text-sm font-bold tracking-wider">AI DIAGNOSTIC</h3>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {!solution ? (
          <div className="space-y-4">
            <p className="text-xs text-white/70 leading-relaxed">
              Initialize the Gemini AI core to analyze telemetry and logs for {machine.name}.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-white/50 flex items-center gap-1.5">
                <Key className="w-3 h-3" /> API Key loaded from environment
              </label>
            </div>

            {error && (
              <p className="text-[10px] text-status-error bg-status-error/10 p-2 rounded border border-status-error/20">
                {error}
              </p>
            )}

            <button 
              onClick={handleDiagnose}
              disabled={isDiagnosing || !apiKey}
              className="w-full py-2.5 rounded-lg bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/40 text-brand-primary text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDiagnosing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> ANALYZING...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> START DIAGNOSIS</>
              )}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
              <p className="text-[10px] font-bold text-brand-primary mb-2 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Recommended Solution
              </p>
              <p className="text-sm text-white leading-relaxed font-serif italic">
                "{solution}"
              </p>
            </div>

            <button 
              onClick={handleApplySolution}
              className="w-full py-2.5 rounded-lg bg-status-running/20 hover:bg-status-running/30 border border-status-running/40 text-status-running text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              APPLY SOLUTION & CLEAR ERROR
            </button>
            
            <button 
              onClick={() => setSolution(null)}
              className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs transition-all"
            >
              RE-RUN DIAGNOSTIC
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
