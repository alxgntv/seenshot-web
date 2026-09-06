export function RedemMain() {
  return (
<main className="page page-redem">
    <div className="cabinet-head">
      <div className="cabinet-title">
        <h1>Redeem</h1>
        <span id="nav-quota" className="nav-quota" hidden={true}></span>
      </div>
    </div>
    <form id="redeem-form" className="cabinet-redeem" hidden={true}>
      <label htmlFor="redeem-code">Redeem code</label>
      <div className="cabinet-redeem-row">
        <input
          id="redeem-code"
          name="code"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          maxLength={22}
          placeholder="AS-SEEN-L0CGS-PMEHN"
          aria-describedby="redeem-status"
         />
        <button type="submit" className="download" id="redeem-submit">Redeem</button>
      </div>
    </form>
    <p id="redeem-status" className="cabinet-redeem-status" hidden={true}></p>
    <div id="redeem-ok" className="cabinet-redeem-ok" hidden={true}>
      <h2 id="redeem-ok-title">Success</h2>
      <p id="redeem-ok-text">Member is now active on this account.</p>
      <a className="download" href="/space/">My Screenshots</a>
    </div>
  </main>
  );
}
