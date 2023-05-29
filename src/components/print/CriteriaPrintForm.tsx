import { Criteria } from "~/shared/schemas/criteria";

export function CriteriaPrintForm({ criteria }: { criteria: Criteria }) {
  return (
    <div className="break-inside-avoid space-y-2">
      <h1 className="text-xl">{criteria.name}</h1>
      <p className="border-l-2 pl-2 text-sm">{criteria.description}</p>
      <div>Comments</div>
      <div className="h-[300px] rounded-md border border-slate-600"></div>
      <div>Score (out of {criteria.weight})</div>
      <div className="h-[150px] w-[200px] rounded-md border border-slate-600"></div>
    </div>
  );
}
