import { SignInForm } from "@/components/SignInForm"

// ─── Ariadne's Thread [AT-0680] ─────────────────────
// What: Mount Create account in a native dialog for public Download clicks
// Why:  App DMG must stay behind registration. Public Download opens this modal instead of /download
// Date: 2026-10-02
// Related: [AT-0681] lib/client/signup-modal.ts:startSignupModal, [AT-0683] components/SignInForm.tsx:SignInForm, [AT-0679] lib/site.ts:serveLatestMacDmg
// ─────────────────────────────────────────────────────
export function SignupModal() {
  console.log("SeenShot site: SignupModal render id=signup-modal mode=create")
  return (
    <dialog id="signup-modal" className="signup-modal" aria-labelledby="form-title">
      <button type="button" id="signup-modal-close" className="signup-modal-close" aria-label="Close">
        Close
      </button>
      <SignInForm embedded initialMode="create" />
    </dialog>
  )
}
