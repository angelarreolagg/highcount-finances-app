import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ChipColor } from "../../../domain/entities/ChipColor";
import type { SavingsEntryKind } from "../../../domain/entities/SavingsEntry";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import { useLogSavingsGrowth, useUpdateSavingsEntry } from "../../hooks/useDashboardData";
import { Button } from "../shared/Button";
import { ColorSwatchPicker } from "../shared/ColorSwatchPicker";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";
import { Select } from "../shared/Select";

interface FormValues {
  date: string;
  amount: string;
  kind: SavingsEntryKind;
  note: string;
  color?: ChipColor;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function LogSavingsModal() {
  const addOpen = useUiStore((s) => s.activeModal === "logSavings");
  const closeModal = useUiStore((s) => s.closeModal);
  const editTarget = useUiStore((s) => s.editTarget);
  const closeEdit = useUiStore((s) => s.closeEdit);
  const editing = editTarget?.type === "savings" ? editTarget.entry : null;
  const open = addOpen || editing !== null;
  const logSavings = useLogSavingsGrowth();
  const updateEntry = useUpdateSavingsEntry();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { date: toISODate(new Date()), kind: "deposit", note: "" },
  });

  const color = watch("color");

  // Edit mode: prefill the same form with the movement being edited.
  useEffect(() => {
    if (editing) {
      reset({
        date: editing.date,
        amount: editing.amount.toStorage(),
        kind: editing.kind,
        note: editing.note ?? "",
        color: editing.color,
      });
    }
  }, [editing, reset]);

  const handleClose = () => {
    closeModal();
    if (editing) {
      closeEdit();
      reset({ date: toISODate(new Date()), kind: "deposit", amount: "", note: "" });
    }
  };

  const pending = editing ? updateEntry.isPending : logSavings.isPending;
  const mutationError = editing ? updateEntry.error : logSavings.error;

  const onSubmit = handleSubmit((values) => {
    if (editing) {
      updateEntry.mutate({ id: editing.id, ...values }, { onSuccess: handleClose });
    } else {
      logSavings.mutate(values, {
        onSuccess: () => {
          reset({ date: values.date, kind: values.kind, amount: "", note: "" });
          closeModal();
        },
      });
    }
  });

  return (
    <Modal
      open={open}
      title={editing ? "Edit savings movement" : "Log savings movement"}
      onClose={handleClose}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Kind">
          <Select {...register("kind")}>
            <option value="deposit">Deposit — money I put in</option>
            <option value="returns">Returns — interest the account produced</option>
          </Select>
        </Field>
        <Field label="Amount" error={errors.amount?.message}>
          <input
            {...register("amount", {
              required: "Amount is required",
              pattern: { value: AMOUNT_PATTERN, message: "Positive amount like 123.45" },
              validate: (v) => Number(v) > 0 || "Amount must be greater than zero",
            })}
            inputMode="decimal"
            placeholder="0.00"
            className={control}
          />
        </Field>
        <Field label="Date">
          <input type="date" {...register("date", { required: "Date is required" })} className={control} />
        </Field>
        <Field label="Note">
          <input {...register("note")} placeholder="e.g. CETES monthly interest" className={control} />
        </Field>
        <Field label="Color">
          <ColorSwatchPicker value={color} onChange={(c) => setValue("color", c)} />
        </Field>
        <Button type="submit" variant="primary" disabled={pending} className="w-full">
          {pending ? "Saving…" : editing ? "Save changes" : "Log movement"}
        </Button>
        {mutationError != null && (
          <p className="text-xs text-coral">{(mutationError as Error).message}</p>
        )}
      </form>
    </Modal>
  );
}
