import { Spokes } from "@/components/loading-ui/spokes";

export function SpokesColor() {
  return (
    <div className="flex items-center justify-center *:size-12" role="status" aria-label="Loading">
      <Spokes className="text-[#14b8a6]" />
    </div>
  );
}