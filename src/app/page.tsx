import { LoginForm } from "@/components/login-form";
import { TimerIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 md:p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <TimerIcon className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
            CodeTeak
          </h1>
        </div>
        <p className="text-muted-foreground">
          Your modern solution for time and task management.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
