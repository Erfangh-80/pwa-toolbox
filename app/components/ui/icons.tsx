import type { ReactNode, SVGProps } from "react";

const paths = {
  install: (
    <>
      <path d="M12 3v10m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
  offline: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" />
    </>
  ),
  sync: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
      <path d="M4 20v-4h4" />
    </>
  ),
  push: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 4-2 5-2 5h16s-2-1-2-5" />
      <path d="M10.5 19a2 2 0 0 0 3 0" />
    </>
  ),
  geo: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  bluetooth: (
    <>
      <path d="M7 7.5l10 9-5 4V3.5l5 4-10 9" />
    </>
  ),
  usb: (
    <>
      <path d="M12 21V6" />
      <path d="M9.5 9 12 5l2.5 4" />
      <circle cx="12" cy="13" r="2" />
      <path d="M12 15v3" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.4 10.8 15.6 7.2M8.4 13.2l7.2 3.6" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 4h6v3H9z" />
      <path d="M9 5.5H6.5A1.5 1.5 0 0 0 5 7v12.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H15" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </>
  ),
  network: (
    <>
      <path d="M3.5 9.5a13 13 0 0 1 17 0" />
      <path d="M6.5 12.5a8.5 8.5 0 0 1 11 0" />
      <path d="M9.5 15.5a4 4 0 0 1 5 0" />
      <path d="M12 19h.01" />
    </>
  ),
  badge: (
    <>
      <circle cx="11" cy="13" r="6.5" />
      <circle cx="18" cy="6" r="2.5" />
    </>
  ),
  external: (
    <>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export const Icon = ({ name, className = "size-5", ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className}
    {...props}
  >
    {paths[name]}
  </svg>
);
