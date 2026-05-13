import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type TeacherRecord } from '../data/schema'

type TeacherDialogType = 'add' | 'edit' | 'import' | 'export' | 'deactivate'

type TeacherContextType = {
    open: TeacherDialogType | null
    setOpen: (str: TeacherDialogType | null) => void
    currentRow: TeacherRecord | null
    setCurrentRow: React.Dispatch<React.SetStateAction<TeacherRecord | null>>
}

const TeacherContext = React.createContext<TeacherContextType | null>(null)

export function TeacherProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useDialogState<TeacherDialogType>(null)
    const [currentRow, setCurrentRow] = useState<TeacherRecord | null>(null)

    return (
        <TeacherContext value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </TeacherContext>
    )
}

export const useTeacher = () => {
    const ctx = React.useContext(TeacherContext)
    if (!ctx) throw new Error('useTeacher must be used within <TeacherProvider>')
    return ctx
}
