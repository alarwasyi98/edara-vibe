import { ChevronsUpDown } from 'lucide-react'
import { useTenant } from '@/hooks/use-tenant'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'

export function TenantSwitcher() {
    const { isMobile } = useSidebar()
    const { activeTenant, tenants, setActiveTenantId } = useTenant()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                                <activeTenant.icon className='size-4' />
                            </div>
                            <div className='grid flex-1 text-start text-sm leading-tight'>
                                <span className='truncate font-semibold'>
                                    {activeTenant.name}
                                </span>
                                <span className='truncate text-xs'>
                                    {activeTenant.level === 'mi' && 'Madrasah Ibtidaiyah'}
                                    {activeTenant.level === 'mts' && 'Madrasah Tsanawiyah'}
                                    {activeTenant.level === 'ma' && 'Madrasah Aliyah'}
                                </span>
                            </div>
                            <ChevronsUpDown className='ms-auto' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                        align='start'
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='text-xs text-muted-foreground'>
                            Kampus / Unit
                        </DropdownMenuLabel>
                        {tenants.map((tenant) => (
                            <DropdownMenuItem
                                key={tenant.id}
                                onClick={() => setActiveTenantId(tenant.id)}
                                className='gap-2 p-2'
                            >
                                <div className='flex size-6 items-center justify-center rounded-sm border'>
                                    <tenant.icon className='size-4 shrink-0' />
                                </div>
                                {tenant.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
