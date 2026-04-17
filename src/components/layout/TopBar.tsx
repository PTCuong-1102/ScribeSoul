"use client"

import React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function TopBar() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-surface dark:bg-surface border-b border-border/5 transition-colors duration-300">
      <div className="flex items-center space-x-4">
        <nav className="flex items-center space-x-6 font-sans text-sm font-medium">
          <button className="text-on-surface border-b-2 border-primary pb-px px-1">Bản thảo</button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors pb-px px-1">Thư viện</button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors pb-px px-1">Lưu trữ</button>
        </nav>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-surface-container-low dark:bg-surface-container rounded-full p-1 border border-border/5">
          <Button 
            variant="ghost" 
            size="icon" 
            className={theme === 'light' ? 'bg-surface-container-lowest shadow-sm rounded-full' : 'rounded-full text-on-surface-variant'}
            onClick={() => setTheme('light')}
          >
            <Sun className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={theme === 'dark' ? 'bg-surface-container-highest shadow-sm rounded-full' : 'rounded-full text-on-surface-variant'}
            onClick={() => setTheme('dark')}
          >
            <Moon className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-on-surface">
          <Bell className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-surface-container-low dark:bg-surface-container border border-border/5">
              <User className="w-4 h-4 text-on-surface" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 glass border-border/10 rounded-xl">
            <DropdownMenuItem className="cursor-pointer font-sans h-10 rounded-lg">
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer font-sans h-10 rounded-lg">
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
