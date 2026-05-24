'use client'

import { Menu } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet'

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname()

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/'
    },
    {
      label: 'Transaksi',
      href: '/transaction'
    },
    {
      label: 'Kategori',
      href: '/category'
    },
    {
      label: 'Budget',
      href: '/budget'
    }
  ]

  const NavItems = () => (
    <nav className='space-y-3 ml-5'>
      {menuItems.map((item) => (
        <button
          key={item.href}
          onClick={() => router.push(item.href)}
          className={`block text-left w-full cursor-pointer transition-colors
            ${pathname === item.href
              ? 'font-semibold text-blue-600'
              : 'text-gray-600 hover:text-black'
            }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b bg-white px-4 flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left">
            <h1 className="text-xl font-bold m-5">
              finance-app
            </h1>

            <NavItems />
          </SheetContent>
        </Sheet>

        <h1 className="ml-3 font-bold">
          finance-app
        </h1>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 bg-white border-r p-5 min-h-screen">
        <h1 className="text-xl font-bold mb-8">
          finance-app
        </h1>

        <NavItems />
      </aside>
    </>
  )
}