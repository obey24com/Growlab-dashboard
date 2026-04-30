import * as React from "react"

/** The Growlab leaf mark — used as a brand-coloured action glyph. */
export function LeafMark({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="46 -1 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M52.3226 25.1066C52.3226 25.1066 50.8457 14.1362 58.6522 10.2679C66.4587 6.39973 73.1387 3.37594 74.2653 0C74.5473 7.73644 73.9131 19.7615 64.8417 24.052C55.7704 28.3424 52.8167 28.1304 50.5654 31.2261C51.3398 28.2023 53.4491 26.7955 57.6677 24.8263C61.888 22.8572 71.2415 16.6677 70.8192 7.31423C69.6927 11.5328 64.6998 20.2538 52.3226 25.1066Z" />
    </svg>
  )
}
