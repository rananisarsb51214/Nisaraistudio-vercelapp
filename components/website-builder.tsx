'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './auth-provider';
import { useCollection } from 'react-firebase-hooks/firestore';
import { projectService } from '@/lib/services/projectService';
import { 
  Type, Image as ImageIcon, MousePointerClick, Layout, FormInput,
  Minus, Trash2, Undo2, Redo2, Eye, Rocket, GripVertical, Plus, Settings2,
  FolderOpen, Save, FileCode, Check, AlertCircle, RefreshCw, BookOpen, Layers
} from 'lucide-react';
import PageGalleryModal, { SiteTemplate } from './page-gallery-modal';

// ---- Nexus Ultra brand tokens ----
const C = {
  cyan: "#00f5ff",
  purple: "#bf00ff",
  pink: "#ff0080",
  gold: "#ffd700",
  green: "#00ff88",
  bg: "#07070c",
  panel: "#0d0d16",
};

const BLOCK_DEFS = [
  { type: "hero", label: "Hero", icon: Layout, accent: C.cyan },
  { type: "text", label: "Text", icon: Type, accent: C.green },
  { type: "image", label: "Image", icon: ImageIcon, accent: C.purple },
  { type: "button", label: "Button", icon: MousePointerClick, accent: C.pink },
  { type: "form", label: "Form", icon: FormInput, accent: C.gold },
  { type: "divider", label: "Divider", icon: Minus, accent: "#5b6b8c" },
];

function defaultContent(type: string) {
  switch (type) {
    case "hero": return { heading: "Launch something unmistakable", sub: "Build a page block by block. No template look-alikes." };
    case "text": return { body: "Describe what this section does in plain language." };
    case "image": return { caption: "Image placeholder — click to configure a source", src: "" };
    case "button": return { label: "Get started", href: "#" };
    case "form": return { fields: "Name, Email", buttonText: "Submit" };
    case "divider": return {};
    default: return {};
  }
}

let uid = Date.now();
const nextId = () => `blk_${++uid}`;

interface WebsiteBuilderProps {
  selectedProjectId: string;
}

export default function WebsiteBuilder({ selectedProjectId }: WebsiteBuilderProps) {
  const { user } = useAuth();

  // Firestore subscription for pages in the selected project
  const [pagesSnapshot, pagesLoading] = useCollection(
    selectedProjectId ? projectService.getPagesQuery(selectedProjectId) : null
  );
  const pages = pagesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) || [];

  // Local active page states
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [pageName, setPageName] = useState<string>('Main Landing Page');
  
  const [blocks, setBlocks] = useState<any[]>([
    { id: nextId(), type: "hero", content: defaultContent("hero"), accent: C.cyan },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id ?? null);
  const [history, setHistory] = useState<any[][]>([]);
  const [future, setFuture] = useState<any[][]>([]);
  
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit"); // edit | preview
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selected = blocks.find((b) => b.id === selectedId) || null;

  // Handle loading a 20 Site Gallery template into the builder
  const handleSelectSiteFromGallery = (template: SiteTemplate) => {
    setActivePageId(null); // Fresh page campaign based on gallery site template
    setPageName(template.name);
    
    // Assign fresh internal block IDs to ensure clean state
    const formattedBlocks = template.blocks.map(b => ({
      ...b,
      id: nextId()
    }));

    setBlocks(formattedBlocks);
    setHistory([]);
    setFuture([]);
    if (formattedBlocks.length > 0) {
      setSelectedId(formattedBlocks[0].id);
    }
    setFeedback({ type: 'success', message: `Loaded site template: "${template.name}" (${formattedBlocks.length} blocks)` });
  };

  // Clear feedback helper
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // Handle loading page from Firestore when selection changes
  const handleLoadPage = (page: any) => {
    setActivePageId(page.id);
    setPageName(page.name);
    setBlocks(page.blocks || []);
    setHistory([]);
    setFuture([]);
    if (page.blocks && page.blocks.length > 0) {
      setSelectedId(page.blocks[0].id);
    } else {
      setSelectedId(null);
    }
  };

  // Create a new blank page structure
  const handleNewPage = () => {
    setActivePageId(null);
    setPageName('New Page Campaign');
    const initial = [
      { id: nextId(), type: "hero", content: defaultContent("hero"), accent: C.cyan }
    ];
    setBlocks(initial);
    setSelectedId(initial[0].id);
    setHistory([]);
    setFuture([]);
  };

  // Save current design to Firestore
  const handleSavePage = async () => {
    if (!selectedProjectId || !user) {
      setFeedback({ type: 'error', message: 'Please select a workspace folder first' });
      return;
    }

    setIsSaving(true);
    try {
      if (activePageId) {
        // Update existing page
        await projectService.updatePage(activePageId, pageName, blocks);
        await projectService.logActivity(
          `Updated landing page: "${pageName}"`,
          'page_update',
          selectedProjectId,
          user.uid
        );
        setFeedback({ type: 'success', message: 'Page synchronized to cloud database!' });
      } else {
        // Create new page
        const docRef = await projectService.createPage(pageName, blocks, selectedProjectId, user.uid);
        if (docRef) {
          setActivePageId(docRef.id);
          await projectService.logActivity(
            `Created landing page: "${pageName}"`,
            'page_create',
            selectedProjectId,
            user.uid
          );
        }
        setFeedback({ type: 'success', message: 'New page successfully saved to your workspace!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Database error: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a page from Firestore
  const handleDeletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you absolute sure you want to permanently delete this landing page campaign?')) return;

    try {
      await projectService.deletePage(id);
      if (user) {
        await projectService.logActivity(
          'Deleted a landing page',
          'page_delete',
          selectedProjectId,
          user.uid
        );
      }
      if (activePageId === id) {
        handleNewPage();
      }
      setFeedback({ type: 'success', message: 'Page successfully deleted.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed to delete page: ${err.message}` });
    }
  };

  const commit = (next: any[]) => {
    setHistory((h) => [...h, blocks]);
    setFuture([]);
    setBlocks(next);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setFuture((f) => [blocks, ...f]);
    setHistory((h) => h.slice(0, -1));
    setBlocks(prev);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((h) => [...h, blocks]);
    setFuture((f) => f.slice(1));
    setBlocks(next);
  };

  const addBlock = (type: string) => {
    const def = BLOCK_DEFS.find((d) => d.type === type);
    const block = { id: nextId(), type, content: defaultContent(type), accent: def?.accent || C.cyan };
    const next = [...blocks, block];
    commit(next);
    setSelectedId(block.id);
  };

  const updateSelected = (patch: any) => {
    commit(blocks.map((b) => (b.id === selectedId ? { ...b, content: { ...b.content, ...patch } } : b)));
  };

  const removeBlock = (id: string) => {
    commit(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const onDragStart = (index: number) => (e: React.DragEvent) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const onDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    commit(next);
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  // Build the copyable static HTML of the landing page
  const generateHTMLCode = () => {
    let styles = `
      body { background-color: ${C.bg}; color: #eaf2ff; font-family: sans-serif; margin: 0; padding: 0; }
      .container { max-width: 800px; margin: 50px auto; padding: 20px; }
      .hero { padding: 40px; border-radius: 12px; margin-bottom: 24px; border: 1px solid rgba(0, 245, 255, 0.2); background: linear-gradient(160deg, rgba(0, 245, 255, 0.08), transparent); }
      .hero-title { font-size: 2.2rem; font-weight: bold; margin-bottom: 12px; line-height: 1.2; }
      .hero-sub { opacity: 0.7; font-size: 1.1rem; line-height: 1.5; }
      .text { line-height: 1.7; font-size: 1rem; margin-bottom: 24px; opacity: 0.85; }
      .img-placeholder { border: 1px dashed rgba(191, 0, 255, 0.4); background: rgba(191, 0, 255, 0.05); padding: 40px; text-align: center; border-radius: 8px; margin-bottom: 24px; color: rgba(255, 255, 255, 0.6); }
      .btn { display: inline-block; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; text-align: center; color: #050508; border: none; font-size: 0.95rem; background: linear-gradient(90deg, ${C.cyan}, ${C.purple}); cursor: pointer; transition: opacity 0.2s; }
      .btn:hover { opacity: 0.9; }
      .form-container { border: 1px solid rgba(255, 215, 0, 0.2); background: rgba(255, 215, 0, 0.04); padding: 24px; border-radius: 8px; margin-bottom: 24px; }
      .form-input { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; margin-bottom: 12px; }
      .divider { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(91, 107, 140, 0.4), transparent); margin: 32px 0; }
    `;

    let htmlBlocks = blocks.map(b => {
      switch (b.type) {
        case "hero":
          return `<div class="hero" style="border-color: ${b.accent}33; background: linear-gradient(160deg, ${b.accent}14, transparent)">
            <div class="hero-title">${b.content.heading}</div>
            <div class="hero-sub">${b.content.sub}</div>
          </div>`;
        case "text":
          return `<p class="text">${b.content.body}</p>`;
        case "image":
          return `<div class="img-placeholder" style="border-color: ${b.accent}55; background: ${b.accent}0d">
            ${b.content.caption}
          </div>`;
        case "button":
          return `<div style="margin-bottom: 24px;"><a href="${b.content.href || '#'}" class="btn" style="background: linear-gradient(90deg, ${b.accent}, ${C.purple})">${b.content.label}</a></div>`;
        case "form":
          return `<div class="form-container" style="border-color: ${b.accent}33; background: ${b.accent}0d">
            <form onsubmit="event.preventDefault(); alert('Form submitted successfully!');">
              ${(b.content.fields || '').split(',').map((f: string) => `
                <div style="margin-bottom: 12px;">
                  <label style="display: block; font-size: 0.8rem; margin-bottom: 4px; opacity: 0.7;">${f.trim()}</label>
                  <input type="text" placeholder="${f.trim()}" class="form-input" required />
                </div>
              `).join('')}
              <button type="submit" class="btn" style="background: linear-gradient(90deg, ${b.accent}, ${C.purple})">${b.content.buttonText || 'Submit'}</button>
            </form>
          </div>`;
        case "divider":
          return `<div class="divider" style="background: linear-gradient(90deg, transparent, ${b.accent}66, transparent)"></div>`;
        default:
          return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageName}</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  <div class="container">
    ${htmlBlocks}
  </div>
</body>
</html>`;
  };

  if (!selectedProjectId) {
    return (
      <div className="h-[450px] flex flex-col items-center justify-center text-center bg-[#12141c] border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto">
        <AlertCircle className="w-12 h-12 text-slate-600 mb-4 animate-bounce" />
        <h4 className="text-md font-bold text-slate-200">No Workspace Active</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-2">
          The Website Builder operates on landing pages belonging to individual workspace folders. Please select or create a Workspace Project folder in the sidebar menu first.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full min-h-[650px] flex flex-col rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative"
      style={{ background: C.bg, color: "#eaf2ff", fontFamily: "'Share Tech Mono', monospace" }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap');
        .nx-display { font-family: 'Orbitron', sans-serif; letter-spacing: 0.03em; }
        .nx-trace { position: relative; }
        .nx-trace::before {
          content: "";
          position: absolute; left: -17px; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(180deg, transparent, var(--trace-color, ${C.cyan}), transparent);
          opacity: 0.6;
        }
        .nx-glow:focus-visible { outline: 2px solid ${C.cyan}; outline-offset: 2px; }
      `}} />

      {/* Top bar */}
      <header
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-5 py-4 border-b gap-4"
        style={{ borderColor: "#141622", background: "linear-gradient(90deg, #090a12, #0d0e1a)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center nx-display text-xs font-bold shrink-0 shadow-[0_0_15px_rgba(0,245,255,0.2)]"
            style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`, color: "#050508" }}
          >
            N
          </div>
          <div className="min-w-0">
            <span className="nx-display text-xs tracking-widest text-emerald-400 block">WEBSITE BUILDER</span>
            <input 
              type="text" 
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 text-sm font-bold text-slate-100 focus:outline-none py-0.5 truncate w-full"
              title="Click to rename page campaign"
            />
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick feedback indicator */}
          {feedback && (
            <span className={`text-xs px-2.5 py-1 rounded font-mono flex items-center gap-1.5 ${
              feedback.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}>
              <Check size={12} /> {feedback.message}
            </span>
          )}

          <button
            onClick={() => setIsGalleryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition cursor-pointer shadow-lg shadow-emerald-500/20"
            title="Browse 20 Pre-Built Full Website Templates"
          >
            <BookOpen size={13} /> 20 Site Gallery
          </button>

          <button
            onClick={undo}
            disabled={!history.length}
            className="p-2 rounded border border-white/10 disabled:opacity-30 hover:border-white/30 transition bg-slate-950 text-slate-200 cursor-pointer"
            title="Undo"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!future.length}
            className="p-2 rounded border border-white/10 disabled:opacity-30 hover:border-white/30 transition bg-slate-950 text-slate-200 cursor-pointer"
            title="Redo"
          >
            <Redo2 size={14} />
          </button>
          
          <button
            onClick={handleSavePage}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save size={13} />}
            <span>{activePageId ? 'Sync Cloud' : 'Save New'}</span>
          </button>

          <button
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition cursor-pointer"
            style={{ 
              borderColor: C.cyan, 
              color: mode === "preview" ? "#050508" : C.cyan, 
              background: mode === "preview" ? C.cyan : "transparent" 
            }}
          >
            <Eye size={13} /> {mode === "preview" ? "Exit Preview" : "Live Preview"}
          </button>

          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold shadow-md cursor-pointer"
            style={{ background: `linear-gradient(90deg, ${C.pink}, ${C.purple})`, color: "#050508" }}
          >
            <Rocket size={13} /> Export Code
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-[500px]">
        {/* Left sidebar: Directory of saved pages & Block adding palette */}
        {mode === "edit" && (
          <aside className="w-56 shrink-0 border-r flex flex-col overflow-hidden" style={{ borderColor: "#141622", background: C.panel }}>
            
            {/* Quick 20 Site Gallery Callout */}
            <div className="p-2.5 border-b border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setIsGalleryModalOpen(true)}
                className="w-full py-2 px-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400 transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <BookOpen size={13} className="text-emerald-400" />
                <span>20 Site Templates</span>
              </button>
            </div>
            
            {/* Pages Directory List */}
            <div className="p-3 border-b border-slate-800 shrink-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                  <FolderOpen className="w-3 h-3 text-cyan-400" /> Saved Pages
                </span>
                <button 
                  onClick={handleNewPage}
                  className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded"
                >
                  + New
                </button>
              </div>

              {pagesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                </div>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {pages.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleLoadPage(p)}
                      className={`group flex items-center justify-between px-2 py-1.5 rounded text-[11px] cursor-pointer transition ${
                        activePageId === p.id 
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                          : 'bg-slate-900/40 hover:bg-slate-850 text-slate-300 hover:text-slate-100'
                      }`}
                    >
                      <span className="truncate font-mono font-bold max-w-[120px]">{p.name}</span>
                      <button 
                        onClick={(e) => handleDeletePage(p.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition"
                        title="Delete Page"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                  {pages.length === 0 && (
                    <div className="text-center py-4 text-[10px] text-slate-600 italic">No saved pages in workspace</div>
                  )}
                </div>
              )}
            </div>

            {/* Block palette */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-2 px-1 font-bold">Add Campaign Block</p>
              {BLOCK_DEFS.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.type}
                    onClick={() => addBlock(d.type)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition group cursor-pointer"
                  >
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{ background: `${d.accent}1a`, color: d.accent }}
                    >
                      <Icon size={12} />
                    </span>
                    <span className="text-slate-300 group-hover:text-white font-mono">{d.label} Block</span>
                    <Plus size={11} className="ml-auto text-white/20 group-hover:text-white/50" />
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Canvas Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#090a10]">
          <div className="max-w-xl mx-auto space-y-6">
            {blocks.length === 0 && (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                <Layout className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-white/40 text-sm font-mono">Empty Builder Canvas</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Add conversion components from the block catalog on the left to start building your campaign layout.</p>
              </div>
            )}
            {blocks.map((b, i) => (
              <div
                key={b.id}
                draggable={mode === "edit"}
                onDragStart={onDragStart(i)}
                onDragOver={onDragOver(i)}
                onDrop={onDrop(i)}
                onClick={() => mode === "edit" && setSelectedId(b.id)}
                className="nx-trace relative rounded-xl transition"
                style={{
                  "--trace-color": b.accent,
                  outline: mode === "edit" && selectedId === b.id ? `1.5px solid ${b.accent}` : dragOverIndex === i ? `1.5px dashed ${b.accent}` : "1px solid transparent",
                  outlineOffset: 6,
                  cursor: mode === "edit" ? "pointer" : "default",
                } as React.CSSProperties}
              >
                {mode === "edit" && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={13} />
                  </div>
                )}
                
                <BlockRenderer block={b} />
                
                {mode === "edit" && selectedId === b.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }}
                    className="absolute -right-2 -top-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg cursor-pointer transform hover:scale-105 transition"
                    style={{ background: C.pink, color: "#050508" }}
                    title="Remove block"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Properties configuration panel */}
        {mode === "edit" && (
          <aside className="w-64 shrink-0 border-l p-4 overflow-y-auto" style={{ borderColor: "#141622", background: C.panel }}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-1.5 font-bold">
              <Settings2 size={12} className="text-cyan-400" /> Block Parameters
            </p>
            {!selected ? (
              <div className="py-12 text-center text-slate-600">
                <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-mono">No Block Selected</p>
                <p className="text-[10px] max-w-[150px] mx-auto mt-1">Select any component layout on the active canvas stage to load parameters.</p>
              </div>
            ) : (
              <PropertiesPanel block={selected} onChange={updateSelected} />
            )}
          </aside>
        )}
      </div>

      {/* Export Static Code Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#12141c] border border-slate-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <span>Export Static Campaign HTML</span>
              </h3>
              <button 
                onClick={() => setExportModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300 font-mono"
              >
                Close
              </button>
            </div>
            
            <p className="text-xs text-slate-400">
              Deploy this conversion landing page instantly! Copy the complete self-contained responsive HTML/CSS markup to host it on any standard static web provider or landing page builder.
            </p>

            <textarea
              readOnly
              className="w-full bg-[#181b24] border border-slate-700 rounded-lg p-3 text-xs text-slate-300 focus:outline-none font-mono h-80"
              value={generateHTMLCode()}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateHTMLCode());
                  alert('HTML template code copied to clipboard successfully!');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 20 Full Website Templates Page Gallery Modal */}
      <PageGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSelectSite={handleSelectSiteFromGallery}
      />
    </div>
  );
}

function BlockRenderer({ block }: { block: any }) {
  const { type, content, accent } = block;
  switch (type) {
    case "hero":
      return (
        <div className="py-10 px-6 rounded-xl relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${accent}14, transparent)`, border: `1px solid ${accent}33` }}>
          <h1 className="nx-display text-2xl font-bold text-slate-100 mb-2 leading-tight">{content.heading}</h1>
          <p className="text-slate-400 text-xs font-sans leading-relaxed max-w-md">{content.sub}</p>
        </div>
      );
    case "text":
      return <p className="text-slate-300 text-xs font-sans leading-relaxed px-1 whitespace-pre-wrap">{content.body}</p>;
    case "image":
      return (
        <div
          className="rounded-xl p-6 flex flex-col items-center justify-center text-xs text-slate-400/80 border text-center font-sans space-y-2 relative min-h-36 overflow-hidden"
          style={{ borderStyle: 'dashed', borderColor: `${accent}55`, background: `${accent}0a` }}
        >
          {content.src ? (
            <img 
              src={content.src} 
              alt={content.caption || 'Campaign banner'} 
              className="max-h-44 w-auto rounded object-cover mb-1 border border-slate-800"
            />
          ) : (
            <ImageIcon className="w-8 h-8 opacity-30 text-emerald-400" />
          )}
          <span className="text-[10px] max-w-sm text-center italic">{content.caption}</span>
        </div>
      );
    case "button":
      return (
        <div className="my-2">
          <button
            className="px-5 py-2.5 rounded-lg font-black text-xs nx-display shadow-md hover:opacity-90 transform hover:scale-[1.01] transition"
            style={{ background: `linear-gradient(90deg, ${accent}, ${C.purple})`, color: "#050508" }}
          >
            {content.label}
          </button>
        </div>
      );
    case "form":
      return (
        <div className="rounded-xl p-5 space-y-3 font-sans" style={{ border: `1px solid ${accent}33`, background: `${accent}0a` }}>
          {content.fields.split(",").map((f: string) => (
            <div key={f} className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">{f.trim()}</label>
              <div className="text-xs text-slate-500 bg-[#181b24]/40 px-3 py-2 rounded-lg border border-slate-800">
                User input for {f.trim()}...
              </div>
            </div>
          ))}
          <button
            className="w-full mt-2 py-2 rounded-lg font-bold text-xs nx-display shadow-md hover:opacity-95 text-center"
            style={{ background: `linear-gradient(90deg, ${accent}, ${C.purple})`, color: "#050508" }}
          >
            {content.buttonText || 'Submit Form'}
          </button>
        </div>
      );
    case "divider":
      return <div className="h-px w-full my-4" style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }} />;
    default:
      return null;
  }
}

function PropertiesPanel({ block, onChange }: { block: any; onChange: (patch: any) => void }) {
  const { type, content } = block;
  const field = (label: string, key: string, value: string, multiline?: boolean) => (
    <label className="block mb-3.5">
      <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">{label}</span>
      {multiline ? (
        <textarea
          className="w-full mt-1.5 bg-[#181b24] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none h-20"
          value={value}
          onChange={(e) => onChange({ [key]: e.target.value })}
        />
      ) : (
        <input
          className="w-full mt-1.5 bg-[#181b24] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={value}
          onChange={(e) => onChange({ [key]: e.target.value })}
        />
      )}
    </label>
  );

  switch (type) {
    case "hero":
      return (
        <div className="space-y-1">
          {field("Heading Title", "heading", content.heading)}
          {field("Subheading Copy", "sub", content.sub, true)}
        </div>
      );
    case "text":
      return field("Markdown / Content Body", "body", content.body, true);
    case "image":
      return (
        <div className="space-y-1">
          {field("Image Source URL", "src", content.src || '')}
          {field("Alternative Text / Caption", "caption", content.caption)}
        </div>
      );
    case "button":
      return (
        <div className="space-y-1">
          {field("Button Text Label", "label", content.label)}
          {field("Destination Link (URL)", "href", content.href || '#')}
        </div>
      );
    case "form":
      return (
        <div className="space-y-1">
          {field("Input Fields (Comma-Separated)", "fields", content.fields)}
          {field("Submit Button Label", "buttonText", content.buttonText || 'Submit')}
        </div>
      );
    case "divider":
      return <p className="text-xs text-slate-500 font-mono italic">Dividers have no adjustable variables.</p>;
    default:
      return null;
  }
}
