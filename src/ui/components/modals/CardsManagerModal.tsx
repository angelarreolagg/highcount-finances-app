import { useState } from "react";
import { useForm } from "react-hook-form";
import type { CardType } from "../../../domain/entities/Card";
import { useUiStore } from "../../../state/uiStore";
import { useAddCard, useCards } from "../../hooks/useDashboardData";
import { chipClass } from "../../utils/chips";
import { Button } from "../shared/Button";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

interface FormValues {
  name: string;
  type: CardType;
  cutDay: string;
  paymentDueDay: string;
}

export function CardsManagerModal() {
  const open = useUiStore((s) => s.activeModal === "manageCards");
  const closeModal = useUiStore((s) => s.closeModal);
  const { data: cards = [] } = useCards();
  const addCard = useAddCard();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { type: "credit", cutDay: "", paymentDueDay: "" } });

  const type = watch("type");
  const dayRules = {
    required: "Required for credit cards",
    validate: (v: string) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 1 && n <= 31) || "Day must be 1–31";
    },
  };

  const onSubmit = handleSubmit((values) => {
    addCard.mutate(
      {
        name: values.name,
        type: values.type,
        cutDay: values.type === "credit" ? Number(values.cutDay) : undefined,
        paymentDueDay: values.type === "credit" ? Number(values.paymentDueDay) : undefined,
      },
      {
        onSuccess: () => {
          reset();
          setShowForm(false);
        },
      },
    );
  });

  return (
    <Modal open={open} title="Cards & accounts" onClose={closeModal}>
      {cards.length === 0 ? (
        <p className="mb-4 text-sm text-white/40">Add a card or account to start tracking.</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center gap-3 text-sm">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${chipClass(c.id)}`}
              >
                {c.name[0]?.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{c.name}</span>
                <span className="block text-xs text-white/50">
                  {c.type === "credit"
                    ? `Credit · cuts day ${c.cutDay} · due day ${c.paymentDueDay}`
                    : c.type === "debit"
                      ? "Debit"
                      : "Cash"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {!showForm ? (
        <Button variant="primary" className="w-full" onClick={() => setShowForm(true)}>
          Add card / account
        </Button>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 border-t border-white/10 pt-4">
          <Field label="Name" error={errors.name?.message}>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. BBVA Azul"
              className={control}
            />
          </Field>
          <Field label="Type">
            <select {...register("type")} className={control}>
              <option value="credit">Credit card</option>
              <option value="debit">Debit card</option>
              <option value="cash">Cash</option>
            </select>
          </Field>
          {type === "credit" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cut day" error={errors.cutDay?.message}>
                <input {...register("cutDay", dayRules)} inputMode="numeric" placeholder="28" className={control} />
              </Field>
              <Field label="Payment due day" error={errors.paymentDueDay?.message}>
                <input
                  {...register("paymentDueDay", dayRules)}
                  inputMode="numeric"
                  placeholder="17"
                  className={control}
                />
              </Field>
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={addCard.isPending} className="flex-1">
              {addCard.isPending ? "Saving…" : "Add card"}
            </Button>
            <Button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
          {addCard.isError && <p className="text-xs text-coral">{(addCard.error as Error).message}</p>}
        </form>
      )}
    </Modal>
  );
}
