/**
 * Fixed background layers for the space/exoplanet theme.
 * Renders the dark gradient and the star field behind all page content.
 */
export function SpaceBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-space" />
      <div className="fixed inset-0 -z-10 bg-space-stars opacity-50" />
    </>
  )
}
