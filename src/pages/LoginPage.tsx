import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(true),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "alex.morgan@example.com",
      password: "password123",
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      toast.success("Welcome back! Signed in successfully.");
      navigate(redirectUrl);
    } catch {
      toast.error("Invalid credentials. Please verify your email and password.");
    }
  };

  const handleQuickFill = (role: "admin" | "manager" | "user") => {
    form.setValue("email", `${role}@example.com`);
    form.setValue("password", "password123");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("login")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("loginSubtitle")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t("password")}</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-xs font-normal text-muted-foreground cursor-pointer">
                  {t("rememberMe")}
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? "Signing in..." : t("login")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </Form>

      {/* Demo Credentials Helper */}
      <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Quick Demo Logins</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill("admin")}
            className="flex-1 rounded border bg-background px-2 py-1 font-medium hover:border-primary transition-colors text-center"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("manager")}
            className="flex-1 rounded border bg-background px-2 py-1 font-medium hover:border-primary transition-colors text-center"
          >
            Manager
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("user")}
            className="flex-1 rounded border bg-background px-2 py-1 font-medium hover:border-primary transition-colors text-center"
          >
            User
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
