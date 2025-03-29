"use client";
import { Plus, Trash2 } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";
import { useRef } from "react";
import { toast } from "sonner";

interface JsonField {
  label: string;
  value: string;
}

interface JsonFieldArrayProps {
  value: JsonField[];
  onChange: (fields: JsonField[]) => void;
  title: string;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
  description?: string;
}

export function JsonFieldArray({
  value = [],
  onChange,
  title,
  labelPlaceholder = "Nombre",
  valuePlaceholder = "Valor",
  description,
}: JsonFieldArrayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addField = () => {
    onChange([...value, { label: "", value: "" }]);
  };

  const removeField = (index: number) => {
    const newFields = [...value];
    newFields.splice(index, 1);
    onChange(newFields);
  };

  const updateField = (index: number, field: Partial<JsonField>) => {
    const newFields = [...value];
    newFields[index] = { ...newFields[index], ...field };
    onChange(newFields);
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number,
    fieldType: "label" | "value"
  ) => {
    const pasteText = e.clipboardData.getData("text");

    // Check if the pasted text contains key-value pairs with colons
    if (pasteText.includes(":")) {
      e.preventDefault(); // Prevent normal paste

      try {
        // Regular expression to match key-value pairs in the format "key: value"
        const regex = /([^:]+):\s*([^:]+?)(?=\s+\S+:|$)/g;

        // Use exec in a loop instead of matchAll for better compatibility
        const newFields: JsonField[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(pasteText)) !== null) {
          newFields.push({
            label: match[1].trim(),
            value: match[2].trim(),
          });
        }

        if (newFields.length > 0) {
          // If we're editing an existing field, update that and add the rest
          const updatedFields = [...value];

          if (fieldType === "label") {
            // If pasted in the label field, update that field and add the rest
            updatedFields[index] = {
              ...updatedFields[index],
              label: newFields[0].label,
              value: newFields[0].value,
            };

            // Add additional fields
            if (newFields.length > 1) {
              onChange([...updatedFields, ...newFields.slice(1)]);
              toast(`Se han agregado ${newFields.length} campos`);
            } else {
              onChange(updatedFields);
            }
          } else {
            // If pasted in the value field, only update the value of that field
            updatedFields[index] = {
              ...updatedFields[index],
              value: newFields[0].value,
            };

            // Add additional fields as new
            if (newFields.length > 1) {
              onChange([...updatedFields, ...newFields.slice(1)]);
              toast(
                `Se han agregado ${newFields.length - 1} campos adicionales`
              );
            } else {
              onChange(updatedFields);
            }
          }

          return;
        }
      } catch (error) {
        console.error("Error al procesar el texto pegado:", error);
        // If there's an error, allow normal paste behavior
      }
    }

    // If no special format detected or there was an error, allow normal paste behavior
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-col items-start justify-start">
        <Label>{title}</Label>
        {description && <FormDescription>{description}</FormDescription>}
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((field, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <Input
                  value={field.label}
                  className="bg-background"
                  onChange={(e) =>
                    updateField(index, { label: e.target.value })
                  }
                  onPaste={(e) => handlePaste(e, index, "label")}
                  placeholder={labelPlaceholder}
                />
                <Input
                  className="bg-background"
                  value={field.value}
                  onChange={(e) =>
                    updateField(index, { value: e.target.value })
                  }
                  onPaste={(e) => handlePaste(e, index, "value")}
                  placeholder={valuePlaceholder}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addField}
        className="flex items-center gap-1 w-full"
      >
        <Plus className="h-4 w-4" />
        <span>Agregar</span>
      </Button>
    </div>
  );
}
