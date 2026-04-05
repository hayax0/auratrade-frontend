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
            `https://data-api.binance.vision/api/v3/ticker/price?symbol=${s}`,
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
              `https://data-api.binance.vision/api/v3/ticker/price?symbol=${s.ativoSimbolo}`,
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

  const tickerItems = [
    ...MOEDAS_DISPONIVEIS,
    ...MOEDAS_DISPONIVEIS,
    ...MOEDAS_DISPONIVEIS,
    ...MOEDAS_DISPONIVEIS,
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-['Inter',sans-serif] pb-20">
      <Toaster position="top-right" />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          display: flex;
          width: max-content;
        }
        .ticker-container:hover .animate-marquee {
          animation-play-state: paused;
        }
        
        @keyframes glowing-border {
          0%, 100% {
            border-color: rgba(0,136,204,0.5);
            box-shadow: 0 0 5px rgba(0,136,204,0.3);
          }
          50% {
            border-color: rgba(0,136,204,0.8);
            box-shadow: 0 0 15px rgba(0,136,204,0.6);
          }
        }
        .animate-glowing-border {
          animation: glowing-border 4s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full bg-[#05070a]/80 border-b border-white/5 py-4 md:py-5 flex items-center sticky top-0 z-50 backdrop-blur-xl overflow-hidden relative ticker-container">
        <div className="absolute left-0 top-0 h-full flex items-center pl-4 pr-6 md:pl-8 md:pr-12 bg-gradient-to-r from-[#05070a] via-[#05070a] to-transparent z-10">
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-widest shrink-0">
            <Globe size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">LIVE MARKET</span>
            <span className="inline sm:hidden">LIVE</span>
          </div>
        </div>

        <div className="animate-marquee gap-8 md:gap-12 pl-[120px] md:pl-[220px]">
          {tickerItems.map((coin, index) => {
            const price = marketTicker[coin.simbolo];
            return (
              <div
                key={`${coin.simbolo}-${index}`}
                className="flex items-baseline gap-2 group shrink-0 cursor-default"
              >
                <span className="text-[10px] md:text-xs font-black uppercase text-slate-500">
                  {coin.simbolo.replace("USDT", "")}
                </span>
                <span
                  className={`text-base md:text-lg font-mono font-bold tracking-tighter tabular-nums transition-colors ${coin.color}`}
                >
                  {price ? `$${price}` : "---"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-12">
        <header className="flex flex-col items-center mb-8 text-center mt-4 md:mt-0">
          <div className="bg-slate-900 border border-cyan-500/20 p-3 md:p-4 rounded-2xl shadow-2xl mb-4 md:mb-6">
            <ChartCandlestick
              size={36}
              className="text-cyan-400 stroke-[1.5px] md:w-[42px] md:h-[42px]"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic mb-4">
            AURA<span className="text-cyan-500">TRADE</span>
          </h1>
        </header>

        <div className="flex justify-center mb-10 md:mb-12">
          <a
            href="https://t.me/AuraTradeHaya_Bot"
            target="_blank"
            className="flex items-center gap-3 md:gap-4 bg-[#0088cc]/15 border border-[#0088cc]/50 px-6 md:px-8 py-3 md:py-4 rounded-2xl hover:bg-[#0088cc]/35 hover:border-[#0088cc]/80 transition-all shadow-[0_0_20px_-3px_rgba(0,136,204,0.2)] animate-glowing-border group"
          >
            <div className="bg-[#0088cc] p-2 rounded-lg">
              <Send
                size={18}
                className="text-white group-hover:scale-110 transition-transform md:w-5 md:h-5"
              />
            </div>
            <div className="text-left">
              <p className="text-[9px] md:text-[10px] font-black text-[#0088cc] uppercase tracking-widest mb-0.5 md:mb-1">
                Status: Online
              </p>
              <p className="text-sm md:text-base font-bold text-white">
                Conectar com o Bot no Telegram
              </p>
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* NOVA CAIXA DE FORMULÁRIO ESTILIZADA */}
          <section className="lg:col-span-2 relative group">
            {/* Efeito de brilho de fundo */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[1.5rem] md:rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>

            <div className="relative bg-[#080b11]/90 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
                <h2 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">
                  Nova Ordem
                </h2>
              </div>

              <form
                onSubmit={handleSalvar}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-end"
              >
                <div className="space-y-2 relative">
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                    Ativo
                  </label>
                  <div
                    onClick={() => setIsCoinSelectOpen(!isCoinSelectOpen)}
                    className="w-full bg-black/50 border border-white/5 hover:border-cyan-500/30 p-3.5 md:p-4 rounded-xl cursor-pointer flex justify-between items-center h-[54px] md:h-[58px] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {selectedCoin?.icon}
                      <span className="text-sm md:text-base text-white font-bold">
                        {selectedCoin?.simbolo.replace("USDT", "")}
                      </span>
                    </div>
                    <ChevronDown size={18} className="text-slate-500" />
                  </div>
                  {isCoinSelectOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#0f172a] border border-cyan-500/20 rounded-xl overflow-hidden z-50 shadow-[0_10px_30px_-10px_rgba(6,182,212,0.3)]">
                      {MOEDAS_DISPONIVEIS.map((coin) => (
                        <div
                          key={coin.simbolo}
                          onClick={() => {
                            setAtivoSimbolo(coin.simbolo);
                            setIsCoinSelectOpen(false);
                          }}
                          className="p-3.5 md:p-4 hover:bg-cyan-500/10 cursor-pointer flex items-center justify-between border-b border-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {coin.icon}
                            <span className="text-sm md:text-base text-white font-bold">
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
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                    Operação
                  </label>
                  <div
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="w-full bg-black/50 border border-white/5 hover:border-cyan-500/30 p-3.5 md:p-4 rounded-xl cursor-pointer flex justify-between items-center h-[54px] md:h-[58px] transition-all"
                  >
                    <span
                      className={`text-sm md:text-base font-bold ${tipo === "COMPRA" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {tipo === "COMPRA" ? "📈 COMPRA" : "📉 VENDA"}
                    </span>
                    <ChevronDown size={18} className="text-slate-500" />
                  </div>
                  {isSelectOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#0f172a] border border-cyan-500/20 rounded-xl overflow-hidden z-50 shadow-[0_10px_30px_-10px_rgba(6,182,212,0.3)]">
                      <div
                        onClick={() => {
                          setTipo("COMPRA");
                          setIsSelectOpen(false);
                        }}
                        className="p-3.5 md:p-4 hover:bg-emerald-500/10 cursor-pointer text-emerald-400 text-sm md:text-base font-bold border-b border-white/5 transition-colors"
                      >
                        📈 COMPRA
                      </div>
                      <div
                        onClick={() => {
                          setTipo("VENDA");
                          setIsSelectOpen(false);
                        }}
                        className="p-3.5 md:p-4 hover:bg-rose-500/10 cursor-pointer text-rose-400 text-sm md:text-base font-bold transition-colors"
                      >
                        📉 VENDA
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
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
                    className="w-full bg-black/50 border border-white/5 hover:border-cyan-500/30 focus:border-cyan-400/50 p-3.5 md:p-4 rounded-xl outline-none text-white font-mono text-sm md:text-base h-[54px] md:h-[58px] transition-all focus:ring-1 focus:ring-cyan-400/50"
                  />
                </div>

                <button className="md:col-span-3 mt-4 md:mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black h-[54px] md:h-[58px] rounded-xl flex items-center justify-center gap-2 uppercase text-xs tracking-widest transition-all active:scale-95 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] border border-cyan-400/20">
                  <Plus size={18} className="md:w-5 md:h-5" /> Ativar
                  Monitoramento
                </button>
              </form>
            </div>
          </section>

          <aside className="bg-[#080b11]/80 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 font-mono text-[9px] md:text-[10px] flex flex-col max-h-[300px] md:max-h-[400px] shadow-2xl">
            <div className="flex items-center gap-2 text-cyan-500 font-bold uppercase tracking-widest mb-3 md:mb-4 border-b border-white/5 pb-4">
              <Terminal size={14} className="md:w-[16px] md:h-[16px]" />{" "}
              System_Logs
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2 text-cyan-400/80">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>{" "}
                  {log.text}
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {sinais.map((s) => {
            const isCompra = s.tipo === "COMPRA";
            const precoAtual = precosAtuais[s.ativoSimbolo];
            const coinData = MOEDAS_DISPONIVEIS.find(
              (c) => c.simbolo === s.ativoSimbolo,
            );
            return (
              <div
                key={s.id}
                className="bg-slate-900/60 border border-white/5 rounded-[1.5rem] p-6 md:p-8 hover:border-cyan-500/30 transition-all shadow-xl"
              >
                <div className="flex justify-between items-center mb-8 md:mb-10">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                      <Wallet
                        size={16}
                        className="text-cyan-400 md:w-[18px] md:h-[18px]"
                      />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">
                      {s.ativoSimbolo}
                    </h3>
                  </div>
                  <div
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase border ${isCompra ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
                  >
                    {s.tipo}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 text-center">
                  <div className="bg-black/20 p-4 md:p-5 rounded-2xl border border-white/5">
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2">
                      Alvo
                    </p>
                    <p className="text-xl md:text-2xl font-mono font-bold text-white truncate">
                      ${s.precoAlvo.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-black/20 p-4 md:p-5 rounded-2xl border border-white/5">
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2">
                      Agora
                    </p>
                    <p
                      className={`text-xl md:text-2xl font-mono font-bold truncate ${coinData?.color || "text-cyan-400"}`}
                    >
                      {precoAtual ? `$${precoAtual.toLocaleString()}` : "---"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletar(s.id)}
                  className="w-full py-3.5 md:py-4 flex items-center justify-center gap-2 text-slate-500 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest border border-white/5 hover:border-rose-500/40"
                >
                  <Trash2 size={14} className="md:w-4 md:h-4" /> Remover Alerta
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
