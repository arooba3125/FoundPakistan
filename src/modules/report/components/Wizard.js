"use client";

import { useState } from "react";
import Button from "../../shared/ui/Button";

export default function Wizard({ steps, initialForm, onSubmit, langPack }) {
  const [index, setIndex] = useState(0);
  const [form, setForm] = useState(initialForm);
  const Step = steps[index];

  const next = () => setIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setIndex((i) => Math.max(i - 1, 0));

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      <Step form={form} setForm={update} langPack={langPack} />
      <div className="flex items-center justify-between">
        <Button variant="glass" onClick={back} disabled={index === 0}>
          {langPack.back}
        </Button>
        {index < steps.length - 1 ? (
          <Button onClick={next}>{langPack.next}</Button>
        ) : (
          <Button onClick={() => onSubmit(form)}>{langPack.submit}</Button>
        )}
      </div>
    </div>
  );
}
