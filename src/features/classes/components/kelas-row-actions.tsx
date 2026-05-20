import { MoreHorizontal, Pencil, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ClassSummary } from '../types'

interface ClassesRowActionsProps {
  kelas: ClassSummary
  onEdit: (k: ClassSummary) => void
  onViewStudents: (k: ClassSummary) => void
}

export function ClassesRowActions({
  kelas,
  onEdit,
  onViewStudents,
}: ClassesRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-8 p-0'
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Buka menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => onViewStudents(kelas)}>
          <Users className='mr-2 h-4 w-4' />
          Lihat Siswa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(kelas)}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit Kelas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
