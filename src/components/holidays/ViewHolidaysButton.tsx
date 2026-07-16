import { Eye } from "lucide-react";

import { Button } from "../ui/button";

export function ViewHolidaysButton({
  isLoading,
  onClick,
}: {
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <Button disabled={isLoading} onClick={onClick} type="button" variant="outline">
      <Eye className="h-4 w-4" />
      {isLoading ? "Loading..." : "View Holidays"}
    </Button>
  );
}
