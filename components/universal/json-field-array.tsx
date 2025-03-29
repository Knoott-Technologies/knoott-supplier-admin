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

    // Verificar si el texto pegado tiene formato de múltiples líneas con etiquetas
    if (pasteText.includes("\n")) {
      e.preventDefault(); // Prevenir el pegado normal

      try {
        // Dividir el texto en líneas
        const lines = pasteText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);

        // Verificar si parece tener el formato esperado (al menos 2 líneas)
        if (lines.length >= 2) {
          // Extraer pares clave-valor
          const newFields: JsonField[] = [];
          let currentLabel = "";
          let isLabel = true; // Alternar entre etiqueta y valor

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (isLabel) {
              // Si es una línea de etiqueta
              currentLabel = line.endsWith(":")
                ? line.slice(0, -1).trim()
                : line.trim();
              isLabel = false;
            } else {
              // Si es una línea de valor
              newFields.push({ label: currentLabel, value: line });
              isLabel = true;
            }

            // Si es la última línea y quedó una etiqueta sin valor
            if (i === lines.length - 1 && !isLabel) {
              newFields.push({ label: currentLabel, value: "" });
            }
          }

          if (newFields.length > 0) {
            // Si estamos editando un campo existente, actualizamos ese y agregamos el resto
            const updatedFields = [...value];

            if (fieldType === "label") {
              // Si pegamos en el campo de etiqueta, actualizamos ese campo y agregamos el resto
              updatedFields[index] = {
                ...updatedFields[index],
                label: newFields[0].label,
                value: newFields[0].value,
              };

              // Agregar los campos adicionales
              if (newFields.length > 1) {
                onChange([...updatedFields, ...newFields.slice(1)]);
                toast(`Se han agregado ${newFields.length} campos`);
              } else {
                onChange(updatedFields);
              }
            } else {
              // Si pegamos en el campo de valor, solo actualizamos el valor de ese campo
              updatedFields[index] = {
                ...updatedFields[index],
                value: newFields[0].value,
              };

              // Agregar los campos adicionales como nuevos
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
        }
      } catch (error) {
        console.error("Error al procesar el texto pegado:", error);
        // Si hay un error, permitir el comportamiento normal de pegado
      }
    }

    // Si no se detectó formato especial o hubo un error, permitir el comportamiento normal de pegado
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
