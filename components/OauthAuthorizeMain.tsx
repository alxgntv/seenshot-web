export function OauthAuthorizeMain() {
  return (
<main className="page page-auth">
    <div className="auth-form card">
      <h2>Open SeenShot for MacOS</h2>
      <p className="lede" id="consent-copy">SeenShot for MacOS wants to sign in with your account.</p>
      <p id="status" className="meta"></p>
      <button className="download" type="button" id="continue">Continue</button>
      <button className="flat create-account" type="button" id="cancel">Cancel</button>
    </div>
  </main>
  );
}
