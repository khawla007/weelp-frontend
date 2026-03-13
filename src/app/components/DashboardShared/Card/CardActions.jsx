'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Ellipsis, SquarePen, Trash2 } from 'lucide-react';
import Link from 'next/link';

/**
 * CardActions - Shared action dropdown (Edit, Delete) for dashboard cards
 *
 * Used by both ListingCard and RouteCard for consistent action handling.
 * Supports both controlled and uncontrolled state management.
 *
 * @param {string|number} itemId - Unique identifier for the item
 * @param {string} editHref - Link for edit action
 * @param {function} onDelete - Delete handler (itemId) => void
 * @param {boolean} isOpen - Controlled dropdown open state
 * @param {function} onOpenChange - Dropdown open change handler
 * @param {boolean} isDialogOpen - Controlled dialog open state
 * @param {function} onDialogChange - Dialog open change handler
 * @param {string} editLabel - Label for edit action (default: "Edit")
 * @param {string} deleteLabel - Label for delete action (default: "Delete")
 * @param {string} className - Additional classes
 */
export function CardActions({
  itemId,
  editHref,
  onDelete,
  isOpen: controlledOpen,
  onOpenChange,
  isDialogOpen: controlledDialogOpen,
  onDialogChange,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  className = '',
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const isDialogOpen = controlledDialogOpen !== undefined ? controlledDialogOpen : internalDialogOpen;

  const handleOpenChange = (open) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const handleDialogChange = (open) => {
    if (onDialogChange) {
      onDialogChange(open);
    } else {
      setInternalDialogOpen(open);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    handleDialogChange(true);
    handleOpenChange(false);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(itemId);
    handleDialogChange(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={`h-8 w-8 p-0 ${className}`}>
            <Ellipsis size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={editHref} className="flex items-center gap-2 cursor-pointer">
              <SquarePen size={14} /> {editLabel}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={handleDeleteClick} className="text-red-400 cursor-pointer">
            <Trash2 size={14} /> {deleteLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleDialogChange(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-dangerSecondary" onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
