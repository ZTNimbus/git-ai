"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import { createCheckoutSession } from "~/lib/stripe";
import { api } from "~/trpc/react";

function Billing() {
  const { data: user } = api.project.getCredits.useQuery();
  const [creditsToBuy, setCreditsToBuy] = useState([100]);
  const creditsToBuyAmount = creditsToBuy[0];
  const price = (creditsToBuyAmount / 50).toFixed(2);

  return (
    <div>
      <h1 className="text-xl font-semibold">Billing</h1>

      <div className="h-2"></div>

      <p className="text-sm text-gray-500">
        You currently have {user?.credits ?? "?"} credits.
      </p>

      <div className="h-2"></div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm">
            Each credit allows you to index 1 file in a repository.
          </p>
        </div>

        <p className="text-sm">
          Eg. If your project has 100 files, then 100 credits will be required
          to index the project.
        </p>
      </div>

      <div className="h-4"></div>

      <Slider
        defaultValue={[100]}
        max={1000}
        min={30}
        onValueChange={(value) => setCreditsToBuy(value)}
        value={creditsToBuy}
      />

      <div className="h-4"></div>

      <Button
        onClick={() => createCheckoutSession(creditsToBuyAmount)}
        className="cursor-pointer"
      >
        Get {creditsToBuyAmount} credits for ${price}
      </Button>
    </div>
  );
}

export default Billing;
