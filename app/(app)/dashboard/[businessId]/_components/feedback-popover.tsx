"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  LaughIcon,
  Angry,
  Frown,
  Meh,
  Smile,
  Loader2,
  ArrowRight,
  MessageSquare,
  SmilePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarMenuButton } from "@/components/ui/sidebar";

const FeedBackSchema = z.object({
  message: z.string().min(3, {
    message: "El mensaje debe tener al menos 3 caracteres.",
  }),
  rating: z.number().min(1, {
    message: "Por favor, selecciona una calificación.",
  }),
});

export const FeedBackPopover = ({ user }: { user: User }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();
  const supabase = createClient();

  const form = useForm<z.infer<typeof FeedBackSchema>>({
    resolver: zodResolver(FeedBackSchema),
    defaultValues: {
      message: "",
      rating: 0,
    },
  });

  async function createFeedback(values: z.infer<typeof FeedBackSchema>) {
    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("user_feedback").insert({
        user_id: user.id,
        message: values.message,
        rating: values.rating,
      });

      if (error) throw error;

      form.reset();

      if (isMobile) {
        setIsSheetOpen(false);
      } else {
        setIsOpen(false);
      }

      toast.success("Gracias por tu feedback!", {
        description:
          "Hemos recibido tu mensaje, gracias por tu opinión, nos ayuda mucho a mejorar.",
      });
    } catch (error) {
      toast.error("Hubo un error al enviar el feedback");
    } finally {
      setIsSubmitting(false);
    }
  }

  const emojisIcons = [
    {
      icon: Angry,
      label: "Muy insatisfecho",
      hover: "hover:bg-destructive/20 hover:text-destructive",
      active: "bg-destructive/20 text-destructive",
    },
    {
      icon: Frown,
      label: "Insatisfecho",
      hover: "hover:bg-[#B16F39]/20 hover:text-[#B16F39]",
      active: "bg-[#B16F39]/20 text-[#B16F39]",
    },
    {
      icon: Meh,
      label: "Neutral",
      hover: "hover:bg-[#FFD46A]/20 hover:text-[#FFD46A]",
      active: "bg-[#FFD46A]/20 text-[#FFD46A]",
    },
    {
      icon: Smile,
      label: "Satisfecho",
      hover: "hover:bg-[#7D8F75]/20 hover:text-[#7D8F75]",
      active: "bg-[#7D8F75]/20 text-[#7D8F75]",
    },
    {
      icon: LaughIcon,
      label: "Muy satisfecho",
      hover: "hover:bg-success/20 hover:text-success",
      active: "bg-success/20 text-success",
    },
  ];

  // Renderizamos FeedbackForm para reutilizar el formulario en ambos componentes
  const FeedbackForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(createFeedback)}>
        <div className="p-3">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Déjanos tu opinión:
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-sidebar"
                    placeholder="Escribe aquí..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tu opinión nos ayuda a mejorar.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="w-full h-fit items-center justify-between flex gap-5 bg-sidebar p-3 pb-8 md:pb-3 border-t">
          <div className="flex justify-start">
            {emojisIcons.map((emoji, index) => (
              <FormField
                key={index}
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <div className="flex flex-col items-center">
                    <Button
                      type="button"
                      size={"icon"}
                      variant={"ghost"}
                      onClick={() => field.onChange(index + 1)}
                      className={cn(
                        "hover:scale-105 text-muted-foreground ease-in-out duration-300 size-8",
                        emoji.hover,
                        field.value === index + 1 && emoji.active
                      )}
                      aria-label={emoji.label}
                    >
                      <emoji.icon className="size-6" />
                    </Button>
                  </div>
                )}
              />
            ))}
            {form.formState.errors.rating && (
              <span className="text-xs text-destructive ml-2">
                {form.formState.errors.rating.message}
              </span>
            )}
          </div>

          <Button
            variant={"defaultBlack"}
            size={"sm"}
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                Enviando
                <Loader2 className="animate-spin size-4" />
              </>
            ) : (
              <>
                Enviar <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  // Versión móvil con Sheet
  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant={"default"} className="flex">
            <SmilePlus className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader className="p-3 bg-sidebar border-b text-start">
            <SheetTitle>Feedback</SheetTitle>
            <SheetDescription>
              Comparte tu opinión sobre nuestra plataforma
            </SheetDescription>
          </SheetHeader>
          <FeedbackForm />
        </SheetContent>
      </Sheet>
    );
  }

  // Versión desktop con Popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="lg:flex hidden" variant={"outline"} size={"sm"}>
          Feedback
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="p-0 flex flex-col gap-y-3 min-w-[500px]"
      >
        <FeedbackForm />
      </PopoverContent>
    </Popover>
  );
};
