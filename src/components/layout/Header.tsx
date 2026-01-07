'use client'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-12 flex items-center px-4 border-b border-border bg-card">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    </header>
  )
}
