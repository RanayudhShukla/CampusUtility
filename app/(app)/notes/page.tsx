"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import { compileMarkdown } from "@/utils/markdown";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NoteSchema } from "@/schemas/validation";
import { z } from "zod";
import {
  Plus,
  Pin,
  Folder,
  FolderPlus,
  FileText,
  Search,
  Trash2,
  Paperclip,
  Upload,
  Eye,
  Edit,
  X,
  Loader2,
  ExternalLink,
  Save,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NoteFormValues = z.infer<typeof NoteSchema>;

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("All");

  // Selection states
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [editorMode, setEditorMode] = useState<"edit" | "preview" | "split">("split");

  // New folder state
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  // Attachments state (for currently active note)
  const [noteAttachments, setNoteAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(NoteSchema),
    defaultValues: {
      title: "",
      content: "",
      folder: "General",
      isPinned: false,
    },
  });

  const watchContent = watch("content") || "";
  const watchTitle = watch("title") || "";
  const watchFolder = watch("folder") || "General";
  const watchIsPinned = watch("isPinned") || false;

  const fetchNotes = async () => {
    try {
      const folderParam = selectedFolder !== "All" ? `&folder=${selectedFolder}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";

      const res = await fetch(`/api/notes?${folderParam}${searchParam}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
        // Consolidate distinct folders
        const allFolders = data.folders || [];
        if (!allFolders.includes("General")) {
          allFolders.push("General");
        }
        setFolders(allFolders);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedFolder, search]);

  const selectNote = (note: any) => {
    setActiveNote(note);
    setNoteAttachments(note.attachments || []);
    reset({
      title: note.title,
      content: note.content,
      folder: note.folder,
      isPinned: note.isPinned,
    });
  };

  const createNewNote = () => {
    const defaultFolder = selectedFolder === "All" ? "General" : selectedFolder;
    const newEmptyNote = {
      title: "Untitled Note",
      content: "",
      folder: defaultFolder,
      isPinned: false,
      attachments: [],
    };

    setActiveNote(null);
    setNoteAttachments([]);
    reset(newEmptyNote);
    // Submit immediately to DB to get ID
    saveNote(newEmptyNote);
  };

  const saveNote = async (values: any) => {
    setIsSaving(true);
    try {
      const url = activeNote ? `/api/notes?id=${activeNote._id}` : "/api/notes";
      const method = activeNote ? "PUT" : "POST";

      const payload = {
        title: values.title || "Untitled Note",
        content: values.content || "",
        folder: values.folder || "General",
        isPinned: values.isPinned || false,
        attachments: noteAttachments,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        const savedNote = data.note;
        setActiveNote(savedNote);
        fetchNotes();
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setActiveNote(null);
        fetchNotes();
      }
    } catch (err) {
      console.error("Delete note error:", err);
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    if (!folders.includes(newFolderName.trim())) {
      setFolders((prev) => [...prev, newFolderName.trim()]);
      setValue("folder", newFolderName.trim());
    }
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const newAttachment = {
          name: data.name,
          url: data.url,
          size: data.size,
        };
        const updatedAtts = [...noteAttachments, newAttachment];
        setNoteAttachments(updatedAtts);

        // Auto-save the note to preserve the attachment
        if (activeNote) {
          const payload = {
            title: watchTitle,
            content: watchContent,
            folder: watchFolder,
            isPinned: watchIsPinned,
            attachments: updatedAtts,
          };
          const saveRes = await fetch(`/api/notes?id=${activeNote._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (saveRes.ok) {
            const result = await saveRes.json();
            setActiveNote(result.note);
            fetchNotes();
          }
        }
      }
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (idx: number) => {
    const updatedAtts = noteAttachments.filter((_, i) => i !== idx);
    setNoteAttachments(updatedAtts);

    if (activeNote) {
      const payload = {
        title: watchTitle,
        content: watchContent,
        folder: watchFolder,
        isPinned: watchIsPinned,
        attachments: updatedAtts,
      };
      await fetch(`/api/notes?id=${activeNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      fetchNotes();
    }
  };

  const togglePin = async () => {
    const newPinState = !watchIsPinned;
    setValue("isPinned", newPinState);

    if (activeNote) {
      const payload = {
        title: watchTitle,
        content: watchContent,
        folder: watchFolder,
        isPinned: newPinState,
        attachments: noteAttachments,
      };
      const res = await fetch(`/api/notes?id=${activeNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json();
        setActiveNote(result.note);
        fetchNotes();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header title="Notebook Organizer" />

      {/* Main Double Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Folders List Sidebar */}
        <div className="hidden md:flex flex-col w-56 border-r border-border/70 bg-white/20 dark:bg-black/10 shrink-0 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Notebooks</span>
            <button
              onClick={() => setShowNewFolderInput(!showNewFolderInput)}
              className="p-1 rounded hover:bg-white/10 text-foreground/60 hover:text-foreground cursor-pointer focus:outline-none"
              title="New Notebook Folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>

          <AnimatePresence>
            {showNewFolderInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateFolder}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  placeholder="Folder Name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs glass-input text-foreground placeholder:text-foreground/30 focus:outline-none"
                  autoFocus
                />
                <button type="submit" className="p-1.5 rounded bg-primary text-white text-xs font-bold cursor-pointer">
                  +
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <nav className="flex-1 overflow-y-auto space-y-1">
            <button
              onClick={() => setSelectedFolder("All")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedFolder === "All"
                  ? "bg-primary/10 border border-primary/20 text-primary dark:text-teal-400 font-bold"
                  : "text-foreground/75 hover:bg-white/20 dark:hover:bg-white/5 border border-transparent"
              }`}
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span>All Notebooks</span>
            </button>

            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  selectedFolder === f
                    ? "bg-primary/10 border border-primary/20 text-primary dark:text-teal-400 font-bold"
                    : "text-foreground/75 hover:bg-white/20 dark:hover:bg-white/5 border border-transparent"
                }`}
              >
                <Folder className="h-4 w-4 shrink-0" />
                <span className="truncate">{f}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Middle Column: Notes List inside the Notebook */}
        <div className="flex flex-col w-full md:w-64 lg:w-72 border-r border-border/70 shrink-0 bg-white/10 dark:bg-black/5 overflow-hidden">
          {/* Notebook Search & Creation */}
          <div className="p-4 border-b border-border/70 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search notes content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 glass-input text-foreground text-xs placeholder:text-foreground/30"
              />
            </div>

            <button
              onClick={createNewNote}
              className="w-full py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary/5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Note</span>
            </button>
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/20">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
              </div>
            ) : notes.length === 0 ? (
              <p className="p-8 text-center text-xs text-foreground/40">No notes found.</p>
            ) : (
              notes.map((n) => (
                <div
                  key={n._id}
                  onClick={() => selectNote(n)}
                  className={`p-4 cursor-pointer hover:bg-white/20 dark:hover:bg-white/5 transition-colors text-left flex flex-col gap-1.5 ${
                    activeNote?._id === n._id ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                      {n.isPinned && <Pin className="h-3 w-3 fill-current text-primary shrink-0" />}
                      <span className="truncate">{n.title || "Untitled Note"}</span>
                    </h5>
                    <span className="text-[9px] bg-foreground/10 text-foreground/50 px-1.5 py-0.5 rounded leading-none shrink-0 capitalize">
                      {n.folder}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/60 line-clamp-2 leading-normal">
                    {n.content || "Empty content"}
                  </p>
                  <span className="text-[9px] text-foreground/30 self-end">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Note Editor & Split-screen Preview */}
        <div className="flex-1 flex flex-col bg-white/30 dark:bg-black/10 overflow-hidden">
          {activeNote ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Note Header Tool panel */}
              <div className="h-12 px-4 border-b border-border/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {/* Pin button */}
                  <button
                    onClick={togglePin}
                    className={`p-1.5 rounded-lg border cursor-pointer ${
                      watchIsPinned
                        ? "bg-primary/15 border-primary/30 text-primary dark:text-teal-400"
                        : "border-border text-foreground/50 hover:text-foreground"
                    }`}
                    title={watchIsPinned ? "Unpin Note" : "Pin Note"}
                  >
                    <Pin className="h-4 w-4" />
                  </button>

                  {/* Notebook Selector */}
                  <select
                    value={watchFolder}
                    onChange={(e) => {
                      setValue("folder", e.target.value);
                      handleSubmit(saveNote)();
                    }}
                    className="px-2 py-1 rounded border border-border bg-white/10 dark:bg-black/20 text-foreground text-xs font-semibold cursor-pointer"
                  >
                    {folders.map((f) => (
                      <option key={f} value={f} className="bg-slate-900 text-white">
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Editor display switcher */}
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 dark:bg-black/20 p-0.5 rounded-lg border border-border flex">
                    <button
                      onClick={() => setEditorMode("edit")}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                        editorMode === "edit" ? "bg-primary text-white" : "text-foreground/60 hover:text-foreground"
                      }`}
                      title="Editor Mode"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditorMode("split")}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors hidden sm:block ${
                        editorMode === "split" ? "bg-primary text-white" : "text-foreground/60 hover:text-foreground"
                      }`}
                      title="Split Screen View"
                    >
                      <Layers className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditorMode("preview")}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                        editorMode === "preview" ? "bg-primary text-white" : "text-foreground/60 hover:text-foreground"
                      }`}
                      title="Preview Mode"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit(saveNote)}
                    disabled={isSaving}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>Save</span>
                  </button>

                  <button
                    onClick={() => deleteNote(activeNote._id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-foreground/50 hover:text-red-500 cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Edit / Preview columns grid */}
              <div className="flex-1 flex overflow-hidden">
                {/* Editor Textarea */}
                {(editorMode === "edit" || editorMode === "split") && (
                  <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-border/30">
                    <input
                      type="text"
                      placeholder="Title of your note..."
                      {...register("title")}
                      className="w-full text-lg font-bold font-heading bg-transparent outline-none border-b border-transparent focus:border-border/60 pb-2 mb-4 text-foreground placeholder:text-foreground/20"
                    />

                    <textarea
                      placeholder="Write your notebook markdown here... You can write block equation formulas inside double dollar signs $$ E=mc^2 $$ or inline math expressions inside single dollar signs $ x=y $."
                      {...register("content")}
                      className="w-full flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-foreground/20 font-mono leading-relaxed"
                    />
                  </div>
                )}

                {/* Markdown HTML Preview */}
                {(editorMode === "preview" || editorMode === "split") && (
                  <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-black/5 prose dark:prose-invert max-w-none text-left">
                    {editorMode === "preview" && (
                      <h1 className="text-2xl font-bold font-heading mb-6 border-b border-border pb-2 text-foreground">
                        {watchTitle || "Untitled Note"}
                      </h1>
                    )}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: compileMarkdown(watchContent),
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Attachments Section footer */}
              <div className="p-4 border-t border-border bg-white/20 dark:bg-black/10 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Note Attachments</span>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-primary dark:text-teal-400 hover:underline cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    <span>Attach file</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="sr-only"
                      disabled={isUploading || isSaving}
                    />
                  </label>
                </div>

                {noteAttachments.length === 0 ? (
                  <p className="text-[10px] text-foreground/40">No file attachments linked to this note.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {noteAttachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-white/30 dark:bg-black/25 border border-border rounded px-2.5 py-1 text-[10px] text-foreground"
                      >
                        <Paperclip className="h-3 w-3 text-foreground/40 shrink-0" />
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate max-w-[120px] font-semibold text-primary dark:text-teal-400"
                        >
                          {att.name}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-foreground/40 text-sm gap-2">
              <FileText className="h-12 w-12 text-foreground/20" />
              <p>No note selected.</p>
              <button
                onClick={createNewNote}
                className="text-xs font-semibold text-primary dark:text-teal-400 hover:underline cursor-pointer"
              >
                Create note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
