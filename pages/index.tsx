import { useState, useRef } from 'react';
import { Upload, FileVideo, Zap, AlertTriangle, Target, TrendingUp, Sparkles, RotateCcw } from 'lucide-react';

interface Analysis {
  resumo_executivo: string;
  canais: {
    meta_ads: ChannelData;
    instagram_organico: ChannelData;
    tiktok: ChannelData;
  };
  principais_gargalos: string[];
  otimizacoes: string[];
}

interface ChannelData {
  nota: number;
  classificacao: string;
  pontos_fortes: string[];
  riscos: string[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [additionalText, setAdditionalText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      // If it's an image, compress it
      if (selectedFile.type.startsWith('image/')) {
        compressImage(result);
      } else {
        setPreview(result);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const compressImage = (base64Image: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Resize if too large (max 1200px)
      const maxSize = 1200;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG with 0.7 quality
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      setPreview(compressedBase64);
    };
    img.src = base64Image;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/'))) {
      processFile(droppedFile);
    } else {
      setError('Por favor, faça upload de uma imagem ou vídeo válido');
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const analyzeCreative = async () => {
    if (!file && !additionalText) {
      setError('Por favor, faça upload de um arquivo ou insira informações do criativo');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: preview,
          additionalText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao analisar o criativo');
      }

      setAnalysis(data);
    } catch (err: any) {
      console.error('Erro na análise:', err);
      setError(err.message || 'Erro ao analisar o criativo. Por favor, tente novamente.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setAdditionalText('');
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-in {
          animation: slideUp 0.6s ease-out forwards;
        }
        
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        input[type="file"] {
          display: none;
        }
      `}</style>

      {/* Animated background elements */}
      <div className="absolute -top-1/2 -right-10 w-[800px] h-[800px] rounded-full opacity-30 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite'
      }} />
      <div className="absolute -bottom-1/3 -left-10 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
        animation: 'float 15s ease-in-out infinite reverse'
      }} />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {!analysis ? (
          <>
            {/* Header */}
            <div className="text-center mb-16 pt-12 animate-in">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full mb-6" style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
              }}>
                <Zap size={20} color="#fff" />
                <span className="text-white text-sm font-semibold tracking-wider">POWERED BY AI</span>
              </div>
              
              <h1 className="text-7xl font-extrabold mb-4 leading-none" style={{
                background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em'
              }}>
                LVL Creative<br/>Analyzer
              </h1>
              
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Análise preditiva de performance para Meta Ads, Instagram e TikTok
              </p>
            </div>

            {/* Upload Card */}
            <div className="glass-card max-w-3xl mx-auto rounded-3xl p-12 animate-in stagger-1">
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-200 mb-4 uppercase tracking-widest">
                  Upload do Criativo
                </label>
                
                <div 
                  onClick={handleUploadClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all hover-lift ${
                    isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20'
                  }`}
                  style={{
                    background: preview ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                  
                  {preview ? (
                    <div className="relative">
                      {file?.type.startsWith('image/') ? (
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="max-h-80 mx-auto rounded-xl shadow-2xl"
                        />
                      ) : (
                        <div className="flex items-center justify-center gap-4 text-blue-500 text-lg">
                          <FileVideo size={48} />
                          <span className="font-semibold">{file?.name}</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreview(null);
                        }}
                        className="mt-6 text-slate-400 text-sm underline hover:text-slate-300"
                      >
                        Remover arquivo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-slate-500 mb-4 flex justify-center">
                        <Upload />
                      </div>
                      <p className="text-slate-200 text-lg font-medium mb-2">
                        Clique ou arraste para fazer upload
                      </p>
                      <p className="text-slate-500 text-sm">
                        Suporta JPG, PNG, MP4, MOV • Máx 50MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-200 mb-4 uppercase tracking-widest">
                  Informações Adicionais
                </label>
                <textarea
                  value={additionalText}
                  onChange={(e) => setAdditionalText(e.target.value)}
                  placeholder="Cole a copy, headline, CTA ou descrição do vídeo..."
                  className="w-full p-4 rounded-xl text-slate-200 text-base resize-none outline-none transition-all focus:border-blue-500/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  rows={4}
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl mb-6 flex items-center gap-3" style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <AlertTriangle size={20} color="#ef4444" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={analyzeCreative}
                disabled={analyzing || (!file && !additionalText)}
                className={`w-full py-5 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 transition-all ${
                  analyzing || (!file && !additionalText) ? '' : 'hover-lift'
                }`}
                style={{
                  background: analyzing || (!file && !additionalText) 
                    ? 'rgba(100, 116, 139, 0.3)' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                  color: '#fff',
                  cursor: analyzing || (!file && !additionalText) ? 'not-allowed' : 'pointer',
                  boxShadow: analyzing || (!file && !additionalText) 
                    ? 'none' 
                    : '0 4px 20px rgba(59, 130, 246, 0.4)'
                }}
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Analisando criativo...
                  </>
                ) : (
                  <>
                    Analisar Criativo
                    <Sparkles size={20} />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div>
            {/* Results Header */}
            <div className="text-center mb-12 animate-in">
              <h2 className="text-4xl font-bold text-white mb-2">
                Análise Completa
              </h2>
              <p className="text-slate-400 text-lg">
                Framework LVL-CES aplicado
              </p>
            </div>

            {/* Executive Summary */}
            <div className="glass-card rounded-3xl p-10 mb-8 animate-in stagger-1" style={{
              borderLeft: '4px solid #3b82f6'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Target size={24} color="#3b82f6" />
                <h3 className="text-2xl font-bold text-white">
                  Resumo Executivo
                </h3>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed">
                {analysis.resumo_executivo}
              </p>
            </div>

            {/* Channel Scores */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {Object.entries({
                'Meta Ads': analysis.canais.meta_ads,
                'Instagram': analysis.canais.instagram_organico,
                'TikTok': analysis.canais.tiktok
              }).map(([channel, data], idx) => (
                <div 
                  key={channel}
                  className={`glass-card hover-lift rounded-2xl p-8 animate-in stagger-${idx + 2}`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-white">
                      {channel}
                    </h4>
                    <TrendingUp size={20} color={getScoreColor(data.nota)} />
                  </div>

                  {/* Score Circle */}
                  <div className="relative w-36 h-36 mx-auto my-6">
                    <svg width="144" height="144" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="10"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        fill="none"
                        stroke={getScoreColor(data.nota)}
                        strokeWidth="10"
                        strokeDasharray={`${(data.nota / 10) * 377} 377`}
                        strokeLinecap="round"
                        style={{
                          filter: `drop-shadow(0 0 8px ${getScoreColor(data.nota)})`
                        }}
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-4xl font-extrabold mono" style={{
                        color: getScoreColor(data.nota)
                      }}>
                        {data.nota.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
                        {data.classificacao}
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">
                      ✓ Pontos Fortes
                    </p>
                    <ul className="space-y-2">
                      {data.pontos_fortes.map((ponto, i) => (
                        <li key={i} className="text-slate-400 text-sm pl-4 relative leading-relaxed">
                          <span className="absolute left-0 text-green-500">•</span>
                          {ponto}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div>
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">
                      ⚠ Riscos
                    </p>
                    <ul className="space-y-2">
                      {data.riscos.map((risco, i) => (
                        <li key={i} className="text-slate-400 text-sm pl-4 relative leading-relaxed">
                          <span className="absolute left-0 text-amber-500">•</span>
                          {risco}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottlenecks */}
            <div className="glass-card rounded-3xl p-10 mb-8 animate-in stagger-4" style={{
              borderLeft: '4px solid #ef4444'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle size={24} color="#ef4444" />
                <h3 className="text-2xl font-bold text-white">
                  Principais Gargalos
                </h3>
              </div>
              <div className="space-y-4">
                {analysis.principais_gargalos.map((gargalo, idx) => (
                  <div key={idx} className="p-5 rounded-xl flex items-start gap-4" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <div className="min-w-[28px] h-7 rounded-full flex items-center justify-center text-red-500 font-bold text-sm mono" style={{
                      background: 'rgba(239, 68, 68, 0.2)'
                    }}>
                      {idx + 1}
                    </div>
                    <p className="text-red-300 leading-relaxed">
                      {gargalo}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimizations */}
            <div className="glass-card rounded-3xl p-10 mb-8 animate-in stagger-4" style={{
              borderLeft: '4px solid #10b981'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={24} color="#10b981" />
                <h3 className="text-2xl font-bold text-white">
                  Sugestões de Otimização
                </h3>
              </div>
              <div className="space-y-4">
                {analysis.otimizacoes.map((otimizacao, idx) => (
                  <div key={idx} className="p-5 rounded-xl flex items-start gap-4 transition-all hover-lift" style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <div className="min-w-[28px] h-7 rounded-full flex items-center justify-center text-white font-bold text-sm mono" style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}>
                      {idx + 1}
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {otimizacao}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center animate-in stagger-4">
              <button
                onClick={resetAnalysis}
                className="px-10 py-4 rounded-xl text-white font-semibold inline-flex items-center gap-3 transition-all hover-lift"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <RotateCcw size={20} />
                Analisar Novo Criativo
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <div className="inline-block px-6 py-3 rounded-full" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p className="text-slate-500 text-sm mono">
              Framework LVL-CES • Creative Efficiency Score
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
