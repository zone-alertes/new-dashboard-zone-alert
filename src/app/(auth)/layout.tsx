/** Centered layout of the authentication journey (screens 1.1 and 1.2). */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-page px-4 py-10">{children}</main>;
}
