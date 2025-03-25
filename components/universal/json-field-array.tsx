"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "../ui/form";

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
                  placeholder={labelPlaceholder}
                />
                <Input
                  className="bg-background"
                  value={field.value}
                  onChange={(e) =>
                    updateField(index, { value: e.target.value })
                  }
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
