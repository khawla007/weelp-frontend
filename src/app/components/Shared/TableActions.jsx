'use client';

import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function TableActions({
  editUrl,
  onDelete,
  id,
  editIcon: EditIcon = Edit,
  trashIcon: TrashIcon = Trash2,
}) {
  return (
    <div className="flex gap-4">
      {editUrl && (
        <Link href={editUrl}>
          <EditIcon size={16} />
        </Link>
      )}
      {onDelete && (
        <TrashIcon
          onClick={() => onDelete(id)}
          size={16}
          className="text-red-400 cursor-pointer"
        />
      )}
    </div>
  );
}
