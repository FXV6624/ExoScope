export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 py-4 px-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-muted-foreground text-xs">
          Data Engineering Platform &copy; {currentYear}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>NASA Exoplanet Archive Data</span>
        </div>
      </div>
    </footer>
  )
}
