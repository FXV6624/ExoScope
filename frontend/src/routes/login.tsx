import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { ArrowRight, KeyRound, Telescope } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { AuthLayout } from "@/components/Common/AuthLayout"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const formSchema = z.object({
  username: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
}) satisfies z.ZodType<AccessToken>

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Sign In — Data Engineering Platform",
      },
    ],
  }),
})

function Login() {
  const { loginMutation } = useAuth()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = (data: FormData) => {
    if (loginMutation.isPending) return
    loginMutation.mutate(data)
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/15">
            <KeyRound size={22} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Admin Sign In
          </h1>
          <p className="text-xs text-slate-400 max-w-xs">
            Authenticate with administrator credentials to manage ETL workflows
            and platform settings.
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-slate-300 font-medium">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      data-testid="email-input"
                      placeholder="admin@example.com"
                      type="email"
                      className="rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs text-slate-300 font-medium">
                      Password
                    </FormLabel>
                    <RouterLink
                      to="/recover-password"
                      className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors no-underline"
                    >
                      Forgot your password?
                    </RouterLink>
                  </div>
                  <FormControl>
                    <PasswordInput
                      data-testid="password-input"
                      placeholder="••••••••"
                      className="rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              aria-label="Log In"
              loading={loginMutation.isPending}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 active:scale-[0.99] disabled:opacity-50"
            >
              Log In
            </LoadingButton>
          </form>
        </Form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-slate-900 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 rounded-full border border-white/5">
            Or
          </span>
        </div>

        {/* Public / Guest Access Option */}
        <div className="flex flex-col gap-2">
          <RouterLink
            to="/"
            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-3.5 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-slate-800/80 no-underline"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-400 transition-colors group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10">
                <Telescope size={18} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  Not an admin? Continue without signing in
                </span>
                <span className="text-[11px] text-slate-400">
                  Explore dashboard metrics, catalog & analytics freely
                </span>
              </div>
            </div>
            <ArrowRight
              size={15}
              className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400 shrink-0"
            />
          </RouterLink>
        </div>
      </div>
    </AuthLayout>
  )
}
