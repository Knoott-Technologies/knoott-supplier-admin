"use client";

import { useState, useEffect, useRef } from "react";
import { Bold, Italic, Quote, Link } from "lucide-react";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { source } from "../fonts/font-def";

interface MarkdownEditorProps {
  value: string;
  onChange: (value?: string) => void;
  height?: number;
  placeholder?: string;
  label?: string;
  helpText?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 200,
  placeholder = "Escribe aquí...",
  label,
  helpText,
}: MarkdownEditorProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Guardar la posición del cursor cuando el textarea está en foco
  const handleSelect = () => {
    if (textareaRef.current) {
      setSelectionRange({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      });
    }
  };

  // Aplicar formato al texto seleccionado
  const applyFormat = (formatType: "bold" | "italic" | "quote" | "link") => {
    if (!textareaRef.current || !selectionRange) return;

    const start = selectionRange.start;
    const end = selectionRange.end;
    const selectedText = value.substring(start, end) || "texto";
    let newText = value;

    switch (formatType) {
      case "bold":
        newText =
          value.substring(0, start) +
          `**${selectedText}**` +
          value.substring(end);
        break;
      case "italic":
        newText =
          value.substring(0, start) +
          `*${selectedText}*` +
          value.substring(end);
        break;
      case "quote":
        newText =
          value.substring(0, start) +
          `> ${selectedText}` +
          value.substring(end);
        break;
      case "link":
        newText =
          value.substring(0, start) +
          `[${selectedText}](url)` +
          value.substring(end);
        break;
    }

    onChange(newText);

    // Restaurar el foco al textarea después de aplicar el formato
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();

        // Calcular la nueva posición del cursor
        let newCursorPos = start;
        switch (formatType) {
          case "bold":
            newCursorPos = start + 2 + selectedText.length + 2;
            break;
          case "italic":
            newCursorPos = start + 1 + selectedText.length + 1;
            break;
          case "quote":
            newCursorPos = start + 2 + selectedText.length;
            break;
          case "link":
            newCursorPos = start + 1 + selectedText.length + 1 + 4;
            break;
        }

        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className="w-full">
      {label && <div className="text-sm font-medium mb-1.5">{label}</div>}
      <div className="bg-background border border-border">
        {/* Barra de herramientas */}
        <div className="flex items-center p-1 border-b border-border">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => applyFormat("bold")}
            className="size-6 p-1 text-muted-foreground rounded-none"
          >
            <Bold className="!size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => applyFormat("italic")}
            className="size-6 p-1 text-muted-foreground rounded-none"
          >
            <Italic className="!size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => applyFormat("quote")}
            className="size-6 p-1 text-muted-foreground rounded-none"
          >
            <Quote className="!size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => applyFormat("link")}
            className="size-6 p-1 text-muted-foreground rounded-none"
          >
            <Link className="!size-3.5" />
          </Button>

          <div className="ml-auto flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={isEditing ? "defaultBlack" : "outline"}
              onClick={() => setIsEditing(true)}
              className="h-6 px-2 text-xs"
            >
              Editar
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!isEditing ? "defaultBlack" : "outline"}
              onClick={() => setIsEditing(false)}
              className="h-6 px-2 text-xs"
            >
              Vista previa
            </Button>
          </div>
        </div>

        {/* Área de edición/vista previa */}
        <div
          style={{
            height: `${height}px`,
            minHeight: "100px",
            overflow: "auto",
          }}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onSelect={handleSelect}
              placeholder={placeholder}
              className={cn("w-full h-full p-3 outline-none resize-none bg-background text-sm", source.className)}
            />
          ) : (
            <div className="w-full h-full p-3 prose prose-sm max-w-none text-sm">
              {value ? (
                <ReactMarkdown>{value}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">{placeholder}</p>
              )}
            </div>
          )}
        </div>
      </div>
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
      )}
    </div>
  );
}
