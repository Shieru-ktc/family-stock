import { Edit2, Eye, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  onViewClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}
export default function ActionButtons(props: Props) {
  return (
    <>
      {props.onViewClick && (
        <Button size="icon" variant="ghost" onClick={props.onViewClick}>
          <Eye />
        </Button>
      )}
      {props.onEditClick && (
        <Button size="icon" variant="ghost" onClick={props.onEditClick}>
          <Edit2 />
        </Button>
      )}
      {props.onDeleteClick && (
        <Button size="icon" variant="ghost" onClick={props.onDeleteClick}>
          <Trash2 />
        </Button>
      )}
    </>
  );
}
