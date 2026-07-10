import { useForm } from "react-hook-form";
import type { SavingsEntryKind } from "../../../domain/entities/SavingsEntry";
import { toISODate } from "../../../domain/value-objects/calendar";
import { useUiStore } from "../../../state/uiStore";
import { useLogSavingsGrowth } from "../../hooks/useDashboardData";
import { Button } from "../shared/Button";
import { Field } from "../shared/Field";
import { control } from "../shared/formStyles";
import { Modal } from "../shared/Modal";

interface FormValues {
  date: string;
  amount: string;
  kind: SavingsEntryKind;
  note: string;
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function LogSavingsModal() {
  const open = useUiStore((s) => s.activeModal === "logSavings");
  const closeModal = useUiStore((s) => s.closeModal);
  const logSavings = useLogSavingsGrowth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { date: toISODate(new Date()), kind: "deposit", note: "" },
  });

  const onSubmit = handleSubmit((values) => {
    logSavings.mutate(values, {
      onSuccess: () => {
        reset({ date: values.date, kind: values.kind, amount: "", note: "" });
        closeModal();
      },
    });
  });

  return (
    <Modal open={open} title="Log savings movement" onClose={closeModal}>
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Kind">
          <select {...register("kind")} className={control}>
            <option value="deposit">Deposit — money I put in</option>
            <option value="returns">Returns — interest the account produced</option>
          </select>
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
        <Button type="submit" variant="primary" disabled={logSavings.isPending} className="w-full">
          {logSavings.isPending ? "Saving…" : "Log movement"}
        </Button>
        {logSavings.isError && (
          <p className="text-xs text-coral">{(logSavings.error as Error).message}</p>
        )}
      </form>
    </Modal>
  );
}
