// ─── Ariadne's Thread [AT-0427] ─────────────────────
// What: Identity Toolkit form as a Server Component. submit is cancelled in startSignin
// Why:  HTML used onsubmit="return false". App Router pages must SSR without event handlers
// Date: 2026-09-03
// Related: [AT-0016] public/signin.html, [AT-0010] lib/client/signin.ts, [AT-0430] components/ClientBoot.tsx
// ─────────────────────────────────────────────────────

// ─── Ariadne's Thread [AT-0683] ─────────────────────
// What: Allow SignInForm without page-auth main, and SSR Create account in the Download modal
// Why:  Public Download opens #signup-modal. Duplicate #email ids must not exist on /signin
// Date: 2026-10-02
// Related: [AT-0680] components/SignupModal.tsx, [AT-0427] components/SignInForm.tsx:SignInForm
// ─────────────────────────────────────────────────────
export function SignInForm({
  embedded = false,
  initialMode = "signin",
}: {
  embedded?: boolean
  initialMode?: "signin" | "create"
}) {
  const create = initialMode === "create"
  console.log(
    "SeenShot site: SignInForm embedded=" + String(embedded) +
      " initialMode=" + initialMode
  )
  const form = (
    <form className="auth-form card" action="#" method="post">
      <h2 id="form-title">{create ? "Create account" : "Sign In"}</h2>
      {/* ─── Ariadne's Thread [AT-0376] ─────────────────────
        What: Restore Sign in with Google chrome and drive it from Firebase Auth popup
        Why:  GIS Token model failed origin_mismatch. Google must go through Firebase Auth
        Date: 2026-08-29
        Related: [AT-0376] public/js/signin.js:bindGoogleButton, [AT-0333] public/css/site.css:.google-auth, https://firebase.google.com/docs/auth/web/google-signin
      ─────────────────────────────────────────────────────── */}
      <button
        type="button"
        id="google-auth"
        className="google-auth"
        aria-label={create ? "Sign up with Google" : "Sign in with Google"}
        disabled={true}
      >
        <span className="google-auth-g-plate" aria-hidden="true">
          <svg className="google-auth-g" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </span>
        <span id="google-auth-label">{create ? "Sign up with Google" : "Sign in with Google"}</span>
      </button>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="name@example.com" />
      <label htmlFor="password">Password</label>
      {/* ─── Ariadne's Thread [AT-0031] ─────────────────────
        What: Generate password button sits inside the password field
        Why:  Create account needs a 12-character random password in the same input
        Date: 2026-08-27
        Related: [AT-0010] public/js/signin.js:generatePassword, [AT-0028] public/js/signin.js:setMode
      ─────────────────────────────────────────────────────── */}
      <div className="password-field has-generate" id="password-field">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={create ? "new-password" : "current-password"}
          spellCheck={false}
          autoCapitalize="none"
        />
        {/* ─── Ariadne's Thread [AT-0345] ─────────────────────
          What: Pin Forgot password inside #password-field with the Generate password slot
          Why:  Sign In must show Forgot in the password input, not under the field
          Date: 2026-08-28
          Related: [AT-0031] public/signin.html, [AT-0025] public/signin.html:#forgot, [AT-0028] public/js/signin.js:setMode
        ─────────────────────────────────────────────────────── */}
        <button className="generate-password" type="button" id="forgot" hidden={create}>
          Forgot password
        </button>
        <button className="generate-password" type="button" id="generate-password" hidden={!create}>
          Generate password
        </button>
        {/* ─── Ariadne's Thread [AT-0032] ─────────────────────
          What: Eye button toggles password visibility
          Why:  The field stays type=password. Generate must not turn it into a text field
          Date: 2026-08-27
          Related: [AT-0031] public/js/signin.js:generatePassword, [AT-0010] public/js/signin.js:setPasswordVisible
        ─────────────────────────────────────────────────────── */}
        <button className="toggle-password" type="button" id="toggle-password" aria-label="Show password" aria-pressed="false">
          <svg className="eye-open" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"></circle>
          </svg>
          <svg className="eye-closed" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"></path>
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"></circle>
          </svg>
        </button>
      </div>
      <button className="download" type="button" id="primary">
        {create ? "Create account" : "Sign In"}
      </button>
      {/* ─── Ariadne's Thread [AT-0028] ─────────────────────
        What: Create account is a link to /signup on the same Identity Toolkit form
        Why:  Create account must have its own URL. the form is still signin.js
        Date: 2026-08-28
        Related: [AT-0326] public/js/signin.js:pathIsSignup, [AT-0325] src/index.ts:fetch, [AT-0008] public/js/auth.js:signUpEmail
      ─────────────────────────────────────────────────────── */}
      <a className="flat create-account" id="switch" href={create ? "/signin" : "/signup"}>
        {create ? "Sign In" : "Create account"}
      </a>
      <p id="status" className="meta"></p>
    </form>
  )
  if (embedded) {
    return form
  }
  return <main className="page page-auth">{form}</main>
}
