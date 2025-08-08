"use client";

import { useForm } from "react-hook-form";
import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateAgentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      model: "google/gemini-2.5-flash",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      persona: "",
      temperature: 0.1,
      coins: [],
    },
  });

  const createAgentWithParams = useAction(api.agents.createAgentWithParams);
  const personaValue = watch("persona");

  const onSubmit = (data) => {
    if (!data.coins || data.coins.length === 0) {
      alert("Please select at least one coin.");
      return;
    }

    setIsLoading(true);
    createAgentWithParams({
      name: data.name,
      model: data.model,
      endpoint: data.endpoint,
      persona: data.persona,
      temperature: data.temperature,
      coins: data.coins,
    })
      .then(() => {
        setTimeout(() => router.push("/"), 2000);
      })
      .catch((error) => {
        alert(error.message);
        console.error("Error creating agent:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full xl:w-3/4 mx-auto max-md:pr-2">
      <h1 className="text-2xl font-bold mb-6">Create Your Agent</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="flex flex-col md:flex-row items-start gap-2">
          <label className="w-48 font-semibold">
            Name<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="w-full flex-1">
            <input
              {...register("name", { required: "Name is required" })}
              className={`w-full border rounded p-2 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="my-hl-agent"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
        </div>

        {/* Model */}
        <div className="flex flex-col md:flex-row items-start gap-2">
          <label className="w-48 font-semibold">
            Model<span className="text-red-500 ml-1">*</span>
          </label>
          <Select
            value={watch("model")}
            onValueChange={(value) => setValue("model", value)}
          >
            <SelectTrigger className="w-full md:w-auto grow cursor-pointer">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="google/gemini-2.5-flash"
                className="cursor-pointer"
              >
                google/gemini-2.5-flash
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.model && (
            <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
          )}
        </div>

        {/* Persona */}
        <div className="flex flex-col md:flex-row items-start gap-2 relative">
          <label className="w-48 font-semibold">
            Persona<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="w-full md:w-auto grow relative">
            <textarea
              {...register("persona", {
                required: "Persona is required",
                maxLength: {
                  value: 5000,
                  message: "Persona must be less than 5000 characters",
                },
              })}
              className={`w-full p-2 border rounded resize-none ${
                errors.persona ? "border-red-500" : "border-gray-300"
              }`}
              rows={6}
              placeholder="You're a focused momentum and breakout trader on Hyperliquid perps. You look for accelerating price action, sharp volume surges, and clear breakout setups. You're always getting in before the rest of the market catches on."
            />
            <div
              className={`absolute ${personaValue.length > 5000 ? "text-red-500" : "text-gray-500"} ${errors.persona ? "bottom-10" : "bottom-4"} right-6 text-xs`}
            >
              {personaValue.length}/5000
            </div>
            {errors.persona && (
              <p className="text-red-500 text-sm mt-1">
                {errors.persona.message}
              </p>
            )}
          </div>
        </div>

        {/* Coins */}
        <div className="flex flex-col md:flex-row items-start gap-2">
          <label className="w-48 font-semibold">
            Coins<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="w-full md:w-auto grow">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                "ETH-PERP",
                "BTC-PERP",
                "SOL-PERP",
                "HYPE-PERP",
                "XRP-PERP",
                "SUI-PERP",
                "FARTCOIN-PERP",
                "ENA-PERP",
                "KBONK-PERP",
                "BNB-PERP",
                "DOGE-PERP",
                "KPEPE-PERP",
              ].map((coin) => (
                <div key={coin} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={coin}
                    value={coin}
                    {...register("coins", {
                      validate: () =>
                        getValues("coins")?.length > 0 ||
                        "At least one coin must be selected",
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={coin} className="text-sm">
                    {coin}
                  </label>
                </div>
              ))}
            </div>
            {errors.coins && (
              <p className="text-red-500 text-sm mt-2">
                {errors.coins.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-8">
          <Button type="submit" className="cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                Creating...
              </div>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
