import { Button } from "@workspace/ui/components/button"
import { Navbar } from "@/components/navbar"

export default function Page() {
  return (
    <div className="flex flex-col items-center min-h-svh">
      <Navbar />
      <div className="flex flex-col items-center justify-center gap-4 flex-1">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
      </div>
    </div>
  )
}
