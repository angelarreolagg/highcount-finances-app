import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ChipColor } from "../../../domain/entities/ChipColor";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import {
  useCards,
  useCategories,
  useRegisterMSIPurchase,
  useUpdateMSIPlan,
} from "../../hooks/useDashboardData";
import { Button } from "../shared/Button";
import { ColorSwatchPicker } from "../shared/ColorSwatchPicker";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";
import { Select } from "../shared/Select";

interface FormValues {
  description: string;
  totalAmount: string;
  months: string;
  cardId: string;
  categoryId: string;
  startDate: string;
  withInterest: boolean;
  color?: ChipColor;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function RegisterMsiModal() {
  const addOpen = useUiStore((s) => s.activeModal === "registerMsi");
  const closeModal = useUiStore((s) => s.closeModal);
  const editTarget = useUiStore((s) => s.editTarget);
  const closeEdit = useUiStore((s) => s.closeEdit);
  const editing = editTarget?.type === "msiPlan" ? editTarget.plan : null;
  const open = addOpen || editing !== null;
  const { data: cards = [] } = useCards();
  const { data: categories = [] } = useCategories();
  const registerPurchase = useRegisterMSIPurchase();
  const updatePlan = useUpdateMSIPlan();

  const creditCards = cards.filter((c) => c.type === "credit");
  const expenseCategories = categories.filter((c) => c.kind === "expense");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { startDate: toISODate(new Date()), withInterest: false },
  });

  const color = watch("color");

  // Edit mode: prefill the same form with the plan being edited.
  useEffect(() => {
    if (editing) {
      reset({
        description: editing.description,
        totalAmount: editing.totalAmount.toStorage(),
        months: String(editing.months),
        cardId: editing.cardId,
        categoryId: editing.categoryId,
        startDate: editing.startDate,
        withInterest: editing.withInterest,
        color: editing.color,
      });
    }
  }, [editing, reset]);

  const handleClose = () => {
    closeModal();
    if (editing) {
      closeEdit();
      reset({ startDate: toISODate(new Date()), withInterest: false });
    }
  };

  const pending = editing ? updatePlan.isPending : registerPurchase.isPending;
  const mutationError = editing ? updatePlan.error : registerPurchase.error;

  const onSubmit = handleSubmit((values) => {
    if (editing) {
      updatePlan.mutate(
        { id: editing.id, ...values, months: Number(values.months) },
        { onSuccess: handleClose },
      );
    } else {
      registerPurchase.mutate(
        { ...values, months: Number(values.months) },
        {
          onSuccess: () => {
            reset({ startDate: values.startDate, withInterest: false });
            closeModal();
          },
        },
      );
    }
  });

  return (
    <Modal
      open={open}
      title={editing ? "Edit MSI / MCI plan" : "Register MSI / MCI plan"}
      onClose={handleClose}
    >
      {creditCards.length === 0 ? (
        <p className="text-sm text-white/60">
          Installment plans live on credit cards — add a credit card first.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Description" error={errors.description?.message}>
            <input
              {...register("description", { required: "Description is required" })}
              placeholder="e.g. Laptop"
              className={control}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total (incl. interest)" error={errors.totalAmount?.message}>
              <input
                {...register("totalAmount", {
                  required: "Total is required",
                  pattern: { value: AMOUNT_PATTERN, message: "Positive amount like 123.45" },
                  validate: (v) => Number(v) > 0 || "Must be greater than zero",
                })}
                inputMode="decimal"
                placeholder="0.00"
                className={control}
              />
            </Field>
            <Field label="Months" error={errors.months?.message}>
              <input
                {...register("months", {
                  required: "Months is required",
                  validate: (v) => {
                    const n = Number(v);
                    return (Number.isInteger(n) && n >= 1 && n <= 60) || "Whole number 1–60";
                  },
                })}
                inputMode="numeric"
                placeholder="12"
                className={control}
              />
            </Field>
          </div>
          <Field label="Credit card" error={errors.cardId?.message}>
            <Select {...register("cardId", { required: "Card is required" })}>
              <option value="">Select a card</option>
              {creditCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" error={errors.categoryId?.message}>
            <Select {...register("categoryId", { required: "Category is required" })}>
              <option value="">Select a category</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Purchase date">
            <input type="date" {...register("startDate", { required: true })} className={control} />
          </Field>
          <Field label="Color">
            <ColorSwatchPicker value={color} onChange={(c) => setValue("color", c)} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" {...register("withInterest")} className="size-4 accent-[#818cf8]" />
            With interest (MCI)
          </label>
          {editing && (
            <p className="text-xs text-white/50">
              Saving regenerates the installment schedule from the new values.
            </p>
          )}
          <Button type="submit" variant="primary" disabled={pending} className="w-full">
            {pending ? "Saving…" : editing ? "Save changes" : "Register plan"}
          </Button>
          {mutationError != null && (
            <p className="text-xs text-coral">{(mutationError as Error).message}</p>
          )}
        </form>
      )}
    </Modal>
  );
}
