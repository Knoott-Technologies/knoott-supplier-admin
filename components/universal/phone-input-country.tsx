"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CountryCode {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

// Lista de países de América con sus códigos telefónicos
const americaCountryCodes: CountryCode[] = [
  { name: "Argentina", code: "AR", dial_code: "+54", flag: "🇦🇷" },
  { name: "Bolivia", code: "BO", dial_code: "+591", flag: "🇧🇴" },
  { name: "Brasil", code: "BR", dial_code: "+55", flag: "🇧🇷" },
  { name: "Canadá", code: "CA", dial_code: "+1", flag: "🇨🇦" },
  { name: "Chile", code: "CL", dial_code: "+56", flag: "🇨🇱" },
  { name: "Colombia", code: "CO", dial_code: "+57", flag: "🇨🇴" },
  { name: "Costa Rica", code: "CR", dial_code: "+506", flag: "🇨🇷" },
  { name: "Cuba", code: "CU", dial_code: "+53", flag: "🇨🇺" },
  { name: "Ecuador", code: "EC", dial_code: "+593", flag: "🇪🇨" },
  { name: "El Salvador", code: "SV", dial_code: "+503", flag: "🇸🇻" },
  { name: "Estados Unidos", code: "US", dial_code: "+1", flag: "🇺🇸" },
  { name: "Guatemala", code: "GT", dial_code: "+502", flag: "🇬🇹" },
  { name: "Haití", code: "HT", dial_code: "+509", flag: "🇭🇹" },
  { name: "Honduras", code: "HN", dial_code: "+504", flag: "🇭🇳" },
  { name: "Jamaica", code: "JM", dial_code: "+1", flag: "🇯🇲" },
  { name: "México", code: "MX", dial_code: "+52", flag: "🇲🇽" },
  { name: "Nicaragua", code: "NI", dial_code: "+505", flag: "🇳🇮" },
  { name: "Panamá", code: "PA", dial_code: "+507", flag: "🇵🇦" },
  { name: "Paraguay", code: "PY", dial_code: "+595", flag: "🇵🇾" },
  { name: "Perú", code: "PE", dial_code: "+51", flag: "🇵🇪" },
  { name: "Puerto Rico", code: "PR", dial_code: "+1", flag: "🇵🇷" },
  { name: "República Dominicana", code: "DO", dial_code: "+1", flag: "🇩🇴" },
  { name: "Uruguay", code: "UY", dial_code: "+598", flag: "🇺🇾" },
  { name: "Venezuela", code: "VE", dial_code: "+58", flag: "🇻🇪" },
];

interface PhoneInputWithCountryProps {
  value?: string;
  onChange?: (...event: any[]) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
}

export function PhoneInputWithCountry({
  value,
  onChange,
  onBlur,
  name,
  placeholder = "8717544123",
  label,
  description,
  error,
  disabled = false,
}: PhoneInputWithCountryProps) {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    // Default to Mexico
    americaCountryCodes.find((country) => country.code === "MX") ||
      americaCountryCodes[0]
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // Manejar los cambios y notificar al formulario padre
  const notifyChange = (countryCode: string, number: string) => {
    const fullPhoneNumber = `${countryCode}${number}`;
    if (onChange) {
      onChange(fullPhoneNumber);
    }
  };

  // Sincronizar el valor del teléfono con el formulario
  useEffect(() => {
    notifyChange(selectedCountry.dial_code, phoneNumber);
  }, [phoneNumber, selectedCountry, onChange]);

  // Inicializar el valor del teléfono desde el prop value
  useEffect(() => {
    if (value) {
      // Extraer el código de país y el número
      const countryCode = americaCountryCodes.find((country) =>
        value.startsWith(country.dial_code)
      );

      if (countryCode) {
        setSelectedCountry(countryCode);
        setPhoneNumber(value.substring(countryCode.dial_code.length));
      } else {
        // Si no se encuentra un código de país válido, mantener solo el número
        setPhoneNumber(value.replace(/^\+/, ""));
      }
    }
  }, []);

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    setOpen(false);
    // Enfoca el input después de seleccionar el país
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Notificar al formulario padre del cambio
    notifyChange(country.dial_code, phoneNumber);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
    // Notificar al formulario padre del cambio
    notifyChange(selectedCountry.dial_code, value);
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </div>
      )}

      <div className="relative flex items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex h-9 items-center justify-between rounded-r-none border-r-0 w-fit bg-white"
              disabled={disabled}
            >
              <span className="flex items-center gap-2 text-sm">
                {selectedCountry.flag}
                {selectedCountry.dial_code}
              </span>
              <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar país..." className="h-9" />
              <CommandEmpty>No se encontró ningún país.</CommandEmpty>
              <CommandGroup>
                <CommandList className="max-h-64 overflow-y-auto">
                  {americaCountryCodes.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.dial_code}`}
                      onSelect={() => handleCountryChange(country)}
                      className="flex items-center gap-2"
                    >
                      <span className="mr-1">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {country.dial_code}
                      </span>
                      {country.code === selectedCountry.code && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          ref={inputRef}
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={onBlur}
          name={name}
          className="rounded-l-none pl-3 pr-3 bg-white"
          inputMode="tel"
          type="tel"
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
