'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Menu, X, LayoutDashboard, Database , Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Logo } from './others'

export function DashboardNav(
    {navItems}: {navItems: {name: string;
                            href: string;
                            icon: JSX.Element;
                            }[]}
    ) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])
  
    const toggleTheme = () => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  
    return (
      <nav className="bg-background shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/"><Logo width={48} height={48}/></a>
                <a className="md:hidden lg:block ml-2 text-xl font-bold text-foreground" href='/'>College-Connect</a>
                {/* <a className="hidden md:block lg:hidden ml-2 text-xl font-bold text-foreground" href='/'>C-C</a> */}
              </div>
            </div>
            <div className="hidden md:flex md:ml-6 md:space-x-4 lg:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              <div className='flex items-center flex-wrap'>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="ml-4"
                >
                  {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </div>
            <div className="-mr-2 flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mr-2"
              >
                {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="inline-flex items-center justify-center p-2 rounded-mdfocus:outline-none focus:ring-2 focus:ring-inset"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
  
        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === item.href
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'
                }`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    )
  }