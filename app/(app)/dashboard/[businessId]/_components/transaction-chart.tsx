"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  format,
  parse,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUp, Loader2, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import type { Database } from "@/database.types";

type TransactionRow =
  Database["public"]["Tables"]["provider_business_transactions"]["Row"];

const chartConfig = {
  completed: {
    label: "Completadas",
    color: "hsl(var(--success))",
    icon: ArrowUp,
  },
  pending: {
    label: "En proceso",
    color: "hsl(var(--primary))",
    icon: Loader2,
  },
  canceled: {
    label: "Canceladas",
    color: "hsl(var(--destructive))",
    icon: X,
  },
} satisfies ChartConfig;

// Función para procesar los datos para el gráfico, incluyendo fechas sin datos
const processDataForChart = (
  data: TransactionRow[] | null,
  dateRange: DateRange | undefined
) => {
  // Si no hay datos o rango de fechas, retornar array vacío
  if (!data || !dateRange?.from || !dateRange?.to) return [];

  // Solo filtrar transacciones por el rango de fechas seleccionado
  return data.filter((transaction) => {
    const transactionDate = new Date(transaction.created_at);
    return isWithinInterval(transactionDate, {
      start: dateRange.from!,
      end: dateRange.to!,
    });
  });
};

// Función para agrupar datos por fecha y status, incluyendo todas las fechas del rango
const groupDataByDateAndStatus = (
  data: TransactionRow[],
  dateRange: DateRange | undefined
) => {
  const dateMap = new Map();

  // Si no hay rango de fechas, retornar array vacío
  if (!dateRange?.from || !dateRange?.to) return [];

  // Crear un array con todas las fechas del rango
  const allDates = [];
  const currentDate = new Date(dateRange.from);
  const endDate = new Date(dateRange.to);

  // Asegurarse que currentDate y endDate estén en la misma zona horaria
  currentDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Crear entradas para todas las fechas en el rango
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    dateMap.set(dateStr, {
      date: dateStr,
      displayDate: format(currentDate, "PP", { locale: es }),
      completed: 0,
      pending: 0,
      canceled: 0,
    });

    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Procesar cada transacción
  data.forEach((tx) => {
    const date = format(new Date(tx.created_at), "yyyy-MM-dd");
    // Solo procesar si la fecha está en nuestro mapa (dentro del rango)
    if (dateMap.has(date)) {
      // Sumar el monto según el estado
      const status = tx.status;
      if (
        status &&
        (status === "completed" ||
          status === "pending" ||
          status === "canceled")
      ) {
        dateMap.get(date)[status] += tx.amount || 0;
      }
    }
  });

  // Convertir el mapa a un array ordenado por fecha
  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Función para agrupar datos por estado
const groupDataByStatus = (data: TransactionRow[]) => {
  const completedData = data.filter((tx) => tx.status === "completed");
  const pendingData = data.filter((tx) => tx.status === "pending");
  const canceledData = data.filter((tx) => tx.status === "canceled");

  return {
    completed: completedData,
    pending: pendingData,
    canceled: canceledData,
  };
};

// Función para preparar datos para el gráfico de pastel
const preparePieChartData = (data: TransactionRow[]) => {
  const groupedData = groupDataByStatus(data);

  return [
    {
      name: "Completados",
      status: "completed",
      amount: groupedData.completed.reduce(
        (sum, tx) => sum + (tx.amount || 0),
        0
      ),
      value: groupedData.completed.length,
    },
    {
      name: "En proceso",
      status: "pending",
      amount: groupedData.pending.reduce(
        (sum, tx) => sum + (tx.amount || 0),
        0
      ),
      value: groupedData.pending.length,
    },
    {
      name: "Cancelados",
      status: "canceled",
      amount: groupedData.canceled.reduce(
        (sum, tx) => sum + (tx.amount || 0),
        0
      ),
      value: groupedData.canceled.length,
    },
  ].filter((item) => item.value > 0); // Solo incluir estados con transacciones
};

// Gráfico unificado para móvil y escritorio con áreas separadas (no stackeadas)
const ChartComponent = ({
  data,
  isMobile,
  dateRange,
}: {
  data: TransactionRow[];
  isMobile: boolean;
  dateRange: DateRange | undefined;
}) => {
  // Agrupar los datos por fecha y status para visualización no stackeada, incluyendo todas las fechas del rango
  const chartData = groupDataByDateAndStatus(data, dateRange);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <AreaChart
        data={chartData}
        margin={{
          top: 20,
          right: 10,
          left: 20,
          bottom: isMobile ? 20 : 5,
        }}
        accessibilityLayer
      >
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: isMobile ? 10 : 12 }}
          tickLine={false}
          axisLine={false}
          angle={isMobile ? -45 : 0}
          textAnchor={isMobile ? "end" : "middle"}
          textRendering={"optimized"}
        />
        {!isMobile && (
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatPrice(value)}
            tickLine={false}
            axisLine={false}
          />
        )}
        <Tooltip
          content={
            <ChartTooltipContent
              className="rounded-none"
              labelClassName="font-semibold text-foreground text-sm border-b pb-1.5 mb-1.5"
              formatter={(value, name, item, index) => {
                return (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 bg-[--color-bg]"
                      style={
                        {
                          "--color-bg": `var(--color-${name})`,
                        } as React.CSSProperties
                      }
                    />
                    {chartConfig[name as keyof typeof chartConfig]?.label}
                    <div className="ml-auto flex items-baseline gap-0.5 font-semibold text-foreground">
                      MXN {formatPrice(parseFloat(value as string))}
                    </div>
                    {index === 2 && (
                      <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                        Total
                        <div className="ml-auto flex items-baseline gap-0.5 font-semibold">
                          MXN{" "}
                          {formatPrice(
                            item.payload.completed +
                              item.payload.pending +
                              item.payload.canceled
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              }}
            />
          }
          defaultIndex={2}
          cursor={false}
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="completed"
          stroke={"var(--color-completed)"}
          strokeWidth={2}
          strokeOpacity={0.3}
          fill={"var(--color-completed)"}
          fillOpacity={0.1}
          dot={{ r: 2, fillOpacity: 0.5 }}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="pending"
          name="pending"
          stroke={"var(--color-pending)"}
          strokeWidth={2}
          strokeOpacity={0.3}
          fill={"var(--color-pending)"}
          fillOpacity={0.1}
          dot={{ r: 2, fillOpacity: 0.5 }}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="canceled"
          name="canceled"
          stroke={"var(--color-canceled)"}
          strokeWidth={2}
          strokeOpacity={0.3}
          fill={"var(--color-canceled)"}
          fillOpacity={0.1}
          dot={{ r: 2, fillOpacity: 0.5 }}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  );
};

export const TransactionChart = ({
  data,
}: {
  data:
    | Database["public"]["Tables"]["provider_business_transactions"]["Row"][]
    | null;
}) => {
  // Usamos el hook useIsMobile
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();

  // Estado para almacenar el rango de fechas actual
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    // Obtener parámetros de fecha de la URL
    const fromParam = searchParams.get("fromDate");
    const toParam = searchParams.get("toDate");

    if (fromParam && toParam) {
      try {
        const from = parse(fromParam, "yyyy-MM-dd", new Date());
        const to = parse(toParam, "yyyy-MM-dd", new Date());
        setDateRange({ from, to });
      } catch (error) {
        console.error("Error parsing dates from URL", error);
        // Usar la semana actual como valor predeterminado
        setDateRange({
          from: startOfWeek(new Date(), { locale: es }),
          to: endOfWeek(new Date(), { locale: es }),
        });
      }
    } else {
      // Usar la semana actual como valor predeterminado si no hay parámetros
      setDateRange({
        from: startOfWeek(new Date(), { locale: es }),
        to: endOfWeek(new Date(), { locale: es }),
      });
    }
  }, [searchParams]);

  // Procesar los datos para el gráfico según el rango de fechas
  const chartData = processDataForChart(data, dateRange);

  return (
    <Card className="bg-sidebar shadow-none rounded-none border w-full">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Transacciones</CardTitle>
            <CardDescription className="text-gray-500">
              Echa un vistazo a tus transacciones
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div
          className={cn(
            "w-full",
            isMobile ? "h-[400px]" : "aspect-video lg:aspect-[16/6]"
          )}
        >
          <ChartComponent
            data={chartData}
            isMobile={isMobile}
            dateRange={dateRange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionChart;
