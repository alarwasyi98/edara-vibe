import * as React from 'react'
import { format, parse, isValid } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DateInputPickerProps = {
    /** Value in ISO format: 'YYYY-MM-DD' */
    value: string | null
    onChange: (isoDate: string | null) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

/**
 * DatePicker dengan input teks (tipe "input") sesuai permintaan Shadcn/UI.
 * User bisa ketik langsung (format DD-MM-YYYY) atau pilih via popover Calendar.
 * Value dan onChange menggunakan format ISO YYYY-MM-DD.
 */
export function DateInputPicker({
    value,
    onChange,
    placeholder = 'DD-MM-YYYY',
    className,
    disabled,
}: DateInputPickerProps) {
    const [open, setOpen] = React.useState(false)
    const [inputText, setInputText] = React.useState<string>(
        value ? format(new Date(value), 'dd-MM-yyyy') : ''
    )

    // Sync ketika value dari luar berubah
    React.useEffect(() => {
        if (value) {
            const d = new Date(value)
            if (isValid(d)) setInputText(format(d, 'dd-MM-yyyy'))
        } else {
            setInputText('')
        }
    }, [value])

    const selectedDate = React.useMemo(() => {
        if (!value) return undefined
        const d = new Date(value)
        return isValid(d) ? d : undefined
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        setInputText(raw)

        // Coba parse DD-MM-YYYY
        const parsed = parse(raw, 'dd-MM-yyyy', new Date())
        if (isValid(parsed)) {
            onChange(format(parsed, 'yyyy-MM-dd'))
        } else if (raw === '') {
            onChange(null)
        }
    }

    const handleCalendarSelect = (date: Date | undefined) => {
        if (date) {
            onChange(format(date, 'yyyy-MM-dd'))
            setInputText(format(date, 'dd-MM-yyyy'))
        } else {
            onChange(null)
            setInputText('')
        }
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className={cn('relative flex items-center', className)}>
                <Input
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className='pr-9'
                />
                <PopoverTrigger asChild>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={disabled}
                        className='absolute right-0 h-full w-9 shrink-0 rounded-l-none text-muted-foreground hover:text-foreground'
                        tabIndex={-1}
                    >
                        <CalendarIcon className='h-4 w-4' />
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                    mode='single'
                    captionLayout='dropdown'
                    locale={localeId}
                    selected={selectedDate}
                    onSelect={handleCalendarSelect}
                />
            </PopoverContent>
        </Popover>
    )
}
