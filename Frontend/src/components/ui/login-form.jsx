import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function LoginForm({
  className,
  onSubmit,
  isSubmitting = false,
  ...props
}) {
  const [focused, setFocused] = useState(null);

  return (
    <form className={cn("flex flex-col gap-6 m-8", className)} onSubmit={onSubmit} {...props}>
      <div className="grid gap-6">
        <div 
          className={cn(
            "grid gap-2 transition-all duration-300 animate-slide-up delay-3",
            focused === "email" ? "translate-x-1" : ""
          )}
        >
          <Label 
            htmlFor="email" 
            className={cn(
              "transition-colors duration-300",
              focused === "email" ? "text-primary" : ""
            )}
          >
            Email
          </Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            className={cn(
              "transition-all duration-300 border-muted-foreground/20",
              focused === "email" ? "border-primary/50 ring-1 ring-primary/20" : ""
            )}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            disabled={isSubmitting}
          />
        </div>
        
        <div 
          className={cn(
            "grid gap-2 transition-all duration-300 animate-slide-up delay-4",
            focused === "password" ? "translate-x-1" : ""
          )}
        >
          <Label 
            htmlFor="password" 
            className={cn(
              "transition-colors duration-300",
              focused === "password" ? "text-primary" : ""
            )}
          >
            Password
          </Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            required 
            className={cn(
              "transition-all duration-300 border-muted-foreground/20",
              focused === "password" ? "border-primary/50 ring-1 ring-primary/20" : ""
            )}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            disabled={isSubmitting}
          />
        </div>
        
        <Button 
          type="submit" 
          className={cn(
            "w-full mt-2 transition-all duration-300 animate-slide-up delay-5",
            isSubmitting ? "bg-primary/80" : ""
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </div>
    </form>
  );
}