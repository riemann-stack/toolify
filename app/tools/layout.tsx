import AutoToolJsonLd from '@/components/AutoToolJsonLd'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AutoToolJsonLd />
    </>
  )
}
