"use client";

import { useState, type KeyboardEvent, type ClipboardEvent } from "react";
import { Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormDescription } from "../ui/form";

interface KeywordInputProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
}

export function KeywordInput({
  value = [],
  onChange,
  placeholder = "Agregar palabra clave...",
}: KeywordInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
  };

  const addMultipleKeywords = (text: string) => {
    if (!text.trim()) return;

    // Split by commas and filter out empty strings
    const keywords = text
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k && !value.includes(k));

    if (keywords.length > 0) {
      onChange([...value, ...keywords]);
    }

    setInputValue("");
  };

  const removeKeyword = (index: number) => {
    const newKeywords = [...value];
    newKeywords.splice(index, 1);
    onChange(newKeywords);
  };

  const clearAllKeywords = () => {
    onChange([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(inputValue);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    addMultipleKeywords(pastedText);
  };

  const handleBlur = () => {
    if (inputValue) {
      addKeyword(inputValue);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <span className="flex flex-col gap-y-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="bg-background"
        />
        <FormDescription>
          Presiona Enter o coma para agregar una palabra clave. También puedes
          pegar múltiples valores separados por coma.
        </FormDescription>
      </span>
      {value.length > 0 && (
        <div className="flex flex-col items-start gap-y-2 justify-start">
          <p className="text-sm font-semibold">Palabras clave:</p>
          <div className="flex flex-wrap gap-1 flex-1">
            {value.map((keyword, index) => (
              <Badge
                onClick={() => removeKeyword(index)}
                key={index}
                variant="outline"
                className="flex items-center gap-1 text-muted-foreground bg-background cursor-pointer hover:text-destructive hover:bg-destructive/10"
              >
                {keyword}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {value.length > 0 && (
              <Badge
                variant="destructive"
                onClick={clearAllKeywords}
                className="cursor-pointer"
              >
                <Trash2 className="size-3 mr-1" />
                <span className="text-xs">Eliminar todo</span>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
