export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-4 px-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-muted-foreground text-xs">
          ExoScope &copy; {currentYear}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>NASA Exoplanet Archive Data</span>
        </div>
      </div>
    </footer>
  )
}
