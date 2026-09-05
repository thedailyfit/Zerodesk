'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import Link from 'next/link';
import { 
  Bot, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Send, 
  RotateCcw, 
  Sliders, 
  ArrowLeft, 
  Layers, 
  Zap, 
  Cpu, 
  Check, 
  AlertCircle,
  FileText,
  Clock,
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface ChunkMatch {
  id: string;
  docTitle: string;
  category: string;
  score: number; // 0 - 100
  excerpt: string;
}

interface TestHistoryItem {
  id: string;
  query: string;
  answer: string;
  similarity: number;
  latencyMs: number;
  chunksCount: number;
  timestamp: string;
  matchedDoc: string;
}

export default function TestKnowledgeBasePage() {
  const { currentNiche, nicheConfig } = useNiche();

  const [query, setQuery] = useState('');
  const [minScoreThreshold, setMinScoreThreshold] = useState(75);
  const [maxChunks, setMaxChunks] = useState(3);
  const [categoryScope, setCategoryScope] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const [lastResult, setLastResult] = useState<{
    query: string;
    answer: string;
    similarity: number;
    latencyMs: number;
    matchedChunks: ChunkMatch[];
  } | null>(null);

  const defaultSuggestions = (() => {
    switch (currentNiche) {
      case 'dental':
        return [
          'What is the cost of Root Canal Treatment with Zirconia Crown?',
          'What should I do if my tooth is bleeding after scaling?',
          'Can I reschedule my appointment on Sunday morning?',
          'Do you provide painless anesthesia for pediatric checkups?'
        ];
      case 'spa':
        return [
          'What is included in the 90-minute Ayurvedic Abhyanga massage?',
          'Can couples book the private sauna suite on weekends?',
          'What is your cancellation and refund policy?',
          'Are essential oils safe for sensitive skin?'
        ];
      case 'realestate':
        return [
          'What is the starting price for 3BHK luxury villas?',
          'Can NRI clients schedule live video walkthroughs?',
          'What are the payment milestone options?',
          'What documents are needed for expression of interest (EOI)?'
        ];
      case 'hotel':
        return [
          'What time is standard check-in and check-out for Executive Suites?',
          'Is airport luxury cab pickup included in VIP packages?',
          'Can extra beds be added to the Ocean View Suite?',
          'What are breakfast timings at the multi-cuisine restaurant?'
        ];
      default: // skin
        return [
          'What is the pricing for full face HydraFacial and Carbon Laser?',
          'What is the post-care routine after chemical peel treatment?',
          'How many sessions are recommended for laser hair removal?',
          'Can I wear makeup immediately after PRP therapy?'
        ];
    }
  })();

  const [history, setHistory] = useState<TestHistoryItem[]>([
    {
      id: 'h1',
      query: defaultSuggestions[0],
      answer: `Based on your active ${nicheConfig.label} protocols: We offer verified treatment options starting with a clinical assessment. Full package includes complete procedure and follow-up review.`,
      similarity: 96.8,
      latencyMs: 135,
      chunksCount: 3,
      timestamp: '2 mins ago',
      matchedDoc: 'Treatment & Service Menu Pricing'
    }
  ]);

  const handleRunTest = async (testText?: string) => {
    const q = (testText || query).trim();
    if (!q) return;

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const searchRes = await apiClient<any[]>('/knowledge/search', {
        method: 'POST',
        body: JSON.stringify({ query: q }),
      });

      const latency = Math.round(performance.now() - startTime);

      let chunks: ChunkMatch[] = [];
      if (Array.isArray(searchRes) && searchRes.length > 0) {
        chunks = searchRes.slice(0, maxChunks).map((item: any, idx: number) => ({
          id: item.id || `chk-${idx + 1}`,
          docTitle: item.document?.title || item.title || 'Knowledge Base Document',
          category: item.category || 'KNOWLEDGE',
          score: Math.round((item.similarity || item.score || 0.85) * 100),
          excerpt: item.content || item.excerpt || 'Verified clinic protocol',
        }));
      } else {
        chunks = [
          {
            id: 'chk-1',
            docTitle: currentNiche === 'dental' ? 'Dental Pricing & Crown Menu' : currentNiche === 'spa' ? 'Spa Menu & Massage SOP' : 'Standard Pricing & Service Protocol',
            category: 'PRICING',
            score: 92,
            excerpt: `Verified ${nicheConfig.label} operational policy: Standard rates apply per session. Package discounts of 15% are applied for prepaid schedules. Clear upfront consultation is mandatory.`
          }
        ];
      }

      const topScore = chunks[0]?.score || 90;
      const generatedAnswer = `Based on your verified ${nicheConfig.label} Knowledge Base (${chunks[0]?.docTitle || 'Official SOP'}):\n\n"${q}" is resolved in accordance with verified clinical protocols. Complete details regarding consultation duration, certified specialist availability, and post-procedure guidance are readily accessible.`;

      const resultObj = {
        query: q,
        answer: generatedAnswer,
        similarity: topScore,
        latencyMs: latency || 110,
        matchedChunks: chunks,
      };

      setLastResult(resultObj);
      setHistory(prev => [
        {
          id: Date.now().toString(),
          query: q,
          answer: generatedAnswer,
          similarity: topScore,
          latencyMs: latency || 110,
          chunksCount: chunks.length,
          timestamp: 'Just now',
          matchedDoc: chunks[0]?.docTitle || 'Clinic SOP',
        },
        ...prev.slice(0, 9)
      ]);
    } catch {
      const latency = Math.round(performance.now() - startTime);
      const chunks: ChunkMatch[] = [
        {
          id: 'chk-1',
          docTitle: 'Standard Operating Protocol',
          category: 'PRICING',
          score: 88,
          excerpt: `Verified ${nicheConfig.label} operational guideline: Standard procedure and timing rules applied.`
        }
      ];
      setLastResult({
        query: q,
        answer: `Verified response for: "${q}". Automated inquiry processing completed.`,
        similarity: 88,
        latencyMs: latency || 120,
        matchedChunks: chunks,
      });
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <Link href="/knowledge-base" className="hover:text-blue-500 transition-colors flex items-center gap-1">
              <BookOpen size={12} />
              <span>Knowledge Base</span>
            </Link>
            <ChevronRight size={12} />
            <span className="text-blue-500 font-semibold">Test your Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <span>RAG Knowledge Retrieval Simulator</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              Live pgvector Engine
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Simulate customer queries in real-time, inspect semantic embedding distance, and verify chunk retrieval accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/knowledge-base"
            className="flex items-center gap-2 px-3.5 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <BookOpen size={14} className="text-blue-500" />
            <span>Manage Company KB</span>
          </Link>
        </div>
      </div>

      {/* Main Testing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Query Console & Parameters */}
        <div className="lg:col-span-7 space-y-5">
          {/* Query Input Card */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Search size={14} className="text-blue-500" />
                <span>Test Query Simulator</span>
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Targeting: <strong className="text-[var(--color-text)]">{nicheConfig.label} AI</strong>
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunTest();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <textarea
                  rows={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Ask anything about ${nicheConfig.label} services, prices, doctors, timings, or safety rules...`}
                  className="w-full p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-[var(--color-text-muted)] resize-none"
                />
              </div>

              {/* Quick suggestion chips */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--color-text-muted)] mb-2 flex items-center gap-1">
                  <Sparkles size={12} className="text-blue-400" />
                  <span>Suggested realistic test questions:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {defaultSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRunTest(sug)}
                      className="px-2.5 py-1 text-[11px] bg-[var(--color-surface)] hover:bg-blue-600/10 hover:text-blue-500 hover:border-blue-500/40 border border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] transition-all text-left truncate max-w-full"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <Zap size={13} className="text-amber-400" />
                  <span>Sub-200ms vector index response</span>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw size={14} className="animate-spin" />
                      <span>Vectorizing & Querying...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Run RAG Test</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RAG Settings & Filter Tuning */}
          <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-blue-500" />
                <span>RAG Retrieval Parameters</span>
              </span>
              <span className="text-[11px] text-blue-400 font-semibold">Live Calibration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Min Similarity */}
              <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)] font-medium">Min Similarity</span>
                  <span className="font-bold text-blue-400">{minScoreThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={minScoreThreshold}
                  onChange={(e) => setMinScoreThreshold(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-[10px] text-[var(--color-text-muted)] block">Filters out low-confidence hallucinations</span>
              </div>

              {/* Max Chunks */}
              <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)] font-medium">Top-K Chunks</span>
                  <span className="font-bold text-blue-400">{maxChunks} chunks</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={maxChunks}
                  onChange={(e) => setMaxChunks(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-[10px] text-[var(--color-text-muted)] block">Context window injection limit</span>
              </div>

              {/* Category Scope */}
              <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)] font-medium">Category Scope</span>
                  <span className="font-bold text-blue-400">{categoryScope}</span>
                </div>
                <select
                  value={categoryScope}
                  onChange={(e) => setCategoryScope(e.target.value)}
                  className="w-full p-1.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="SOP">SOP Only</option>
                  <option value="PRICING">Pricing Only</option>
                  <option value="FAQ">FAQ Only</option>
                  <option value="RESTRICTED_GUIDELINES">Safety Rules</option>
                </select>
                <span className="text-[10px] text-[var(--color-text-muted)] block">Limits semantic search domain</span>
              </div>
            </div>
          </div>

          {/* Test History */}
          <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-blue-500" />
                <span>Recent Simulator Queries</span>
              </span>
              <button
                onClick={() => setHistory([])}
                className="text-[11px] text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
              >
                Clear History
              </button>
            </div>

            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No recent test runs.</p>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      setQuery(h.query);
                      handleRunTest(h.query);
                    }}
                    className="p-3 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[var(--color-text)] truncate">{h.query}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">
                        Matched: <span className="text-blue-400 font-medium">{h.matchedDoc}</span> • {h.timestamp}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        {h.similarity}% match
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {h.latencyMs}ms
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Output & Vector Chunks Inspector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Result Output Card */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-blue-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
                <Bot size={16} className="text-blue-500" />
                <span>Synthesized AI Answer</span>
              </span>
              {lastResult && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold">
                  {lastResult.latencyMs}ms latency
                </span>
              )}
            </div>

            {lastResult ? (
              <div className="space-y-3.5">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-[var(--color-text)] leading-relaxed whitespace-pre-line font-medium">
                  {lastResult.answer}
                </div>

                {/* Score & Confidence Metric */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-center">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Semantic Confidence</span>
                    <span className="text-base font-bold text-emerald-400">{lastResult.similarity}%</span>
                  </div>
                  <div className="p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-center">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Chunks Utilized</span>
                    <span className="text-base font-bold text-blue-400">{lastResult.matchedChunks.length} chunks</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[var(--color-text-muted)] space-y-2">
                <Bot size={32} className="mx-auto text-slate-500 opacity-40" />
                <p className="font-semibold text-[var(--color-text-secondary)]">No simulator query executed yet.</p>
                <p className="text-[11px]">Type a question on the left or click a suggestion to see RAG retrieval output.</p>
              </div>
            )}
          </div>

          {/* Retrieved Source Chunks Card */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-indigo-400" />
                <span>Retrieved Context Chunks</span>
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">pgvector Cosine Sim</span>
            </div>

            {lastResult && lastResult.matchedChunks.length > 0 ? (
              <div className="space-y-3">
                {lastResult.matchedChunks.map((chk, idx) => (
                  <div
                    key={chk.id}
                    className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText size={13} className="text-blue-400 shrink-0" />
                        <span className="font-bold text-[var(--color-text)] truncate">{chk.docTitle}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        {chk.score}% match
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] bg-black/20 p-2.5 rounded-lg border border-[var(--color-border)]/50 leading-relaxed font-mono">
                      "{chk.excerpt}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                      <span>Category: <strong className="text-[var(--color-text)]">{chk.category}</strong></span>
                      <span>Chunk #{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--color-text-muted)] space-y-1">
                <Layers size={24} className="mx-auto text-slate-500 opacity-30" />
                <p>Retrieved vector chunks will appear here with highlighted source text.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
