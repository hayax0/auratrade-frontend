import {
  Bitcoin,
  ChartCandlestick,
  Check,
  ChevronDown,
  Coins,
  Globe,
  Plus,
  Send,
  Terminal,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Sinal {
  id: string;
  ativoSimbolo: string;
  tipo: string;
  precoAlvo: number;
}

const MOEDAS_DISPONIVEIS = [
  {
    simbolo: "BTCUSDT",
    nome: "Bitcoin",
    color: "text-[#F7931A]",
    icon: <Bitcoin className="text-[#F7931A]" size={18} />,
  },
  {
    simbolo: "ETHUSDT",
    nome: "Ethereum",
    color: "text-[#627EEA]",
    icon: (
      <div className="bg-[#627EEA] rounded-full p-0.5">
        <Coins className="text-white" size={14} />
      </div>
    ),
  },
  {
    simbolo: "SOLUSDT",
    nome: "Solana",
    color: "text-[#14F195]",
    icon: <Coins className="text-[#14F195]" size={18} />,
  },
  {
    simbolo: "BNBUSDT",
    nome: "BNB",
    color: "text-[#F3BA2F]",
    icon: <Coins className="text-[#F3BA2F]" size={18} />,
  },
  {
    simbolo: "ADAUSDT",
    nome: "Cardano",
    color: "text-[#0033AD]",
    icon: <Coins className="text-[#0033AD]" size={18} />,
  },
];

// AJUSTE: URL com a barra no final para evitar erro de concatenação
const API_URL = "https://auratrade-backend.onrender.com/";

export default function App() {
  const [sinais, setSinais] = useState<Sinal[]>([]);
  const [ativoSimbolo, setAtivoSimbolo] = useState(
    MOEDAS_DISPONIVEIS[0].simbolo,
  );
  const [tipo, setTipo] = useState("COMPRA");
  const [precoAlvo, setPrecoAlvo] = useState<number | "">("");
  const [precosAtuais, setPrecosAtuais] = useState<Record<string, number>>({});
  const [marketTicker, setMarketTicker] = useState<Record<string, string>>({});
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isCoinSelectOpen, setIsCoinSelectOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<
    { id: number; text: string; time: string }[]
  >([]);

  const addLog = (text: string) => {
    const time = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [{ id: Date.now(), text, time }, ...prev].slice(0, 5));
  };

  const fetchSinais = async () => {
    try {
      // AJUSTE: Removida a barra extra aqui para usar a da constante
      const res = await fetch(`${API_URL}sinais`);
      if (res.ok) {
        const data = await res.json();
        setSinais(data);
        addLog("Database sincronizada.");
      }
    } catch (e) {
      addLog("ERRO: Falha ao conectar no Back-end.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    fetchSinais();

    const fetchTicker = async () => {
      const symbols = MOEDAS_DISPONIVEIS.map((c) => c.simbolo);
      const results: Record<string, string> = {};

      for (const s of symbols) {
        try {
          const res = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbol=${s}`,
          );
          const data = await res.json();
          results[s] = parseFloat(data.price).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          });
        } catch (e) {}
      }
      setMarketTicker(results);
    };

    fetchTicker();
    const t = setInterval(fetchTicker, 15000);
    return () => {
      clearInterval(t);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const updatePrices = async () => {
      if (sinais.length === 0) return;
      const prices: Record<string, number> = {};
      await Promise.all(
        sinais.map(async (s) => {
          try {
            const res = await fetch(
              `https://api.binance.com/api/v3/ticker/price?symbol=${s.ativoSimbolo}`,
            );
            const data = await res.json();
            prices[s.ativoSimbolo] = Number(data.price);
          } catch (e) {}
        }),
      );
      setPrecosAtuais(prices);
    };
    updatePrices();
    const interval = setInterval(updatePrices, 10000);
    return () => clearInterval(interval);
  }, [sinais]);

  const handleSalvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!ativoSimbolo || !precoAlvo) return;
    try {
      // AJUSTE: Removida a barra extra aqui
      const res = await fetch(`${API_URL}sinais`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ativoSimbolo,
          tipo,
          precoAlvo: Number(precoAlvo),
        }),
      });
      if (res.ok) {
        setPrecoAlvo("");
        fetchSinais();
        toast.success("ALERTA CRIADO");
        addLog(`Node ativado: ${ativoSimbolo}`);
      }
    } catch (e) {
      toast.error("Erro ao salvar sinal");
    }
  };

  const handleDeletar = async (id: string) => {
    try {
      // AJUSTE: Removida a barra extra aqui
      const res = await fetch(`${API_URL}sinais/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSinais(sinais.filter((s) => s.id !== id));
        toast.success("ALERTA REMOVIDO");
        addLog("Node encerrado.");
      }
    } catch (e) {
      toast.error("Erro ao deletar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center space-y-6">
        <ChartCandlestick size={64} className="text-cyan-400 animate-bounce" />
        <h2 className="text-white font-black italic tracking-widest text-xl uppercase animate-pulse">
          AURA<span className="text-cyan-500">TRADE</span>
        </h2>
      </div>
    );
  }

  const selectedCoin = MOEDAS_DISPONIVEIS.find(
    (c) => c.simbolo === ativoSimbolo,
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-['Inter',sans-serif] pb-20">
      <Toaster position="top-right" />

      <div className="w-full bg-[#05070a] border-b border-white/5 py-6 px-8 flex flex-wrap justify-center gap-10 items-center sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest border-r border-white/10 pr-10">
          <Globe size={16} /> LIVE MARKET
        </div>
        <div className="flex gap-10 items-center">
          {MOEDAS_DISPONIVEIS.map((coin) => {
            const price = marketTicker[coin.simbolo];
            return (
              <div
                key={coin.simbolo}
                className="flex items-baseline gap-2 group transition-transform hover:scale-105"
              >
                <span className="text-[10px] font-black uppercase text-slate-500">
                  {coin.simbolo.replace("USDT", "")}
                </span>
                <span
                  className={`text-lg font-mono font-bold tracking-tighter tabular-nums ${coin.color}`}
                >
                  {price ? `$${price}` : "---"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <header className="flex flex-col items-center mb-8 text-center">
          <div className="bg-slate-900 border border-cyan-500/20 p-4 rounded-2xl shadow-2xl mb-6">
            <ChartCandlestick
              size={42}
              className="text-cyan-400 stroke-[1.5px]"
            />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white uppercase italic mb-4">
            AURA<span className="text-cyan-500">TRADE</span>
          </h1>
        </header>

        <div className="flex justify-center mb-12">
          <a
            href="https://t.me/AuraTradeHaya_Bot"
            target="_blank"
            className="flex items-center gap-4 bg-[#0088cc]/10 border border-[#0088cc]/30 px-8 py-4 rounded-2xl hover:bg-[#0088cc]/20 transition-all group"
          >
            <div className="bg-[#0088cc] p-2 rounded-lg">
              <Send
                size={20}
                className="text-white group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-[#0088cc] uppercase tracking-widest mb-1">
                Status: Online
              </p>
              <p className="text-base font-bold text-white">
                Conectar com o Bot no Telegram
              </p>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <section className="lg:col-span-2 bg-slate-900/60 border border-white/5 p-8 rounded-[2rem] shadow-2xl">
            <form
              onSubmit={handleSalvar}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
            >
              <div className="space-y-2 relative">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ativo
                </label>
                <div
                  onClick={() => setIsCoinSelectOpen(!isCoinSelectOpen)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl cursor-pointer flex justify-between items-center h-[58px]"
                >
                  <div className="flex items-center gap-3">
                    {selectedCoin?.icon}
                    <span className="text-white font-bold">
                      {selectedCoin?.simbolo.replace("USDT", "")}
                    </span>
                  </div>
                  <ChevronDown size={18} />
                </div>
                {isCoinSelectOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                    {MOEDAS_DISPONIVEIS.map((coin) => (
                      <div
                        key={coin.simbolo}
                        onClick={() => {
                          setAtivoSimbolo(coin.simbolo);
                          setIsCoinSelectOpen(false);
                        }}
                        className="p-4 hover:bg-white/5 cursor-pointer flex items-center justify-between border-b border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          {coin.icon}
                          <span className="text-white font-bold">
                            {coin.simbolo.replace("USDT", "")}
                          </span>
                        </div>
                        {ativoSimbolo === coin.simbolo && (
                          <Check size={16} className="text-cyan-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2 relative">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Operação
                </label>
                <div
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl cursor-pointer flex justify-between items-center h-[58px]"
                >
                  <span
                    className={`font-bold ${tipo === "COMPRA" ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {tipo === "COMPRA" ? "📈 COMPRA" : "📉 VENDA"}
                  </span>
                  <ChevronDown size={18} />
                </div>
                {isSelectOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden z-50">
                    <div
                      onClick={() => {
                        setTipo("COMPRA");
                        setIsSelectOpen(false);
                      }}
                      className="p-4 hover:bg-emerald-500/10 cursor-pointer text-emerald-400 font-bold border-b border-white/5"
                    >
                      📈 COMPRA
                    </div>
                    <div
                      onClick={() => {
                        setTipo("VENDA");
                        setIsSelectOpen(false);
                      }}
                      className="p-4 hover:bg-rose-500/10 cursor-pointer text-rose-400 font-bold"
                    >
                      📉 VENDA
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Preço Alvo
                </label>
                <input
                  type="number"
                  value={precoAlvo}
                  onChange={(e) =>
                    setPrecoAlvo(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none text-white font-mono"
                />
              </div>
              <button className="md:col-span-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold h-[58px] rounded-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition-all active:scale-95">
                <Plus size={20} /> Ativar Monitoramento
              </button>
            </form>
          </section>

          <aside className="bg-black/60 border border-white/5 rounded-[2rem] p-6 font-mono text-[10px] flex flex-col max-h-[400px]">
            <div className="flex items-center gap-2 text-cyan-500 font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
              <Terminal size={14} /> System_Logs
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-hide">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2 text-cyan-400/80">
                  <span className="text-slate-600">[{log.time}]</span>{" "}
                  {log.text}
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sinais.map((s) => {
            const isCompra = s.tipo === "COMPRA";
            const precoAtual = precosAtuais[s.ativoSimbolo];
            const coinData = MOEDAS_DISPONIVEIS.find(
              (c) => c.simbolo === s.ativoSimbolo,
            );
            return (
              <div
                key={s.id}
                className="bg-slate-900/60 border border-white/5 rounded-[1.5rem] p-8 hover:border-cyan-500/30 transition-all shadow-xl"
              >
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                      <Wallet size={18} className="text-cyan-400" />
                    </div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                      {s.ativoSimbolo}
                    </h3>
                  </div>
                  <div
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${isCompra ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
                  >
                    {s.tipo}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8 text-center">
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Alvo
                    </p>
                    <p className="text-2xl font-mono font-bold text-white">
                      ${s.precoAlvo.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Agora
                    </p>
                    <p
                      className={`text-2xl font-mono font-bold ${coinData?.color || "text-cyan-400"}`}
                    >
                      ${precoAtual ? precoAtual.toLocaleString() : "---"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletar(s.id)}
                  className="w-full py-4 flex items-center justify-center gap-2 text-slate-500 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-white/5 hover:border-rose-500/40"
                >
                  <Trash2 size={16} /> Remover Alerta
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
