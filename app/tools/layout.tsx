import AutoToolJsonLd from '@/components/AutoToolJsonLd'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToolBreadcrumb />
      {children}
      <AutoToolJsonLd />
    </>
  )
}
