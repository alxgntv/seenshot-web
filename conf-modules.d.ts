declare module "*.conf" {
  const content: string;
  export default content;
}

declare module "*.conf?raw" {
  const content: string;
  export default content;
}

declare module "*.html?raw" {
  const content: string;
  export default content;
}

declare module "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
declare module "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
