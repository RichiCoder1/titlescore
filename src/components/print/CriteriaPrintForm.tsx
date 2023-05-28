import { Criteria } from "~/shared/schemas/criteria";

export function CriteriaPrintForm({ criteria }: { criteria: Criteria }) {
  return (
    <div className="break-inside-avoid space-y-2">
      <h1 className="text-xl">{criteria.name}</h1>
      <p className="border-l-2 pl-2 text-sm">{criteria.description}</p>
      <div>Comments</div>
      <div className="h-[300px] border border-slate-600 rounded-md"></div>
      <div>Score (out of {criteria.weight})</div>
      <div className="rounded-md border w-[200px] h-[150px] border-slate-600"></div>
    </div>
  );
}
