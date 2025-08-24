export default function loginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[100vw] h-[100vh] flex items-center">
      {children}
    </div>
  )
}
