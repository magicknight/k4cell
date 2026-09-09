/* No network request, storage, analytics, or automatic sending. */
export const PROPOSAL_VERSION = "K4V-180D-2026-09-09";
const recipients = "zhihua@k4cell.com";
const interestValues = ["NO", "LEARN", "CONDITIONAL_SMALL", "INCLINED"];
const revisitValues = ["YES", "NO", "UNSURE"];

export function prepareDraft(values, language) {
  if (!["en", "zh"].includes(language)) throw new Error("Unsupported language");
  const text = (name, limit, required = true) => {
    const value = String(values[name] ?? "").trim();
    if ((required && !value) || value.length > limit) throw new Error(`Invalid ${name}`);
    return value;
  };
  if (!interestValues.includes(values.q3) || !revisitValues.includes(values.q6)) throw new Error("Choose explicit answers");
  const body = [
    `Proposal: ${PROPOSAL_VERSION}`,
    `Language: ${language}`,
    "Purpose: K4V_EARLY_FEEDBACK (not an order or funding commitment)",
    `1. Motivation / 关注原因: ${text("q1", 160)}`,
    `2. Understanding of rights / 对权益的理解: ${text("q2", 160)}`,
    `3. Interest / 条件兴趣: ${values.q3}`,
    `4. Conditions / 决定条件: ${text("q4", 160)}`,
    `5. Reasons to decline / 不买原因: ${text("q5", 160)}`,
    `6. Willing to look again / 愿意再看: ${values.q6}`,
    `Preferred contact (optional) / 联系方式: ${text("contact", 100, false) || "NOT_PROVIDED"}`,
    `Source (self-reported) / 来源: ${text("channel", 80, false) || "UNKNOWN"}`,
    `Consent to one follow-up / 一次跟进同意: ${values.consent === true ? "YES" : "NO"}`,
  ].join("\n\n");
  const subject = `K4V early feedback / ${PROPOSAL_VERSION} / ${language}`;
  return { body, href: `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}

if (typeof document !== "undefined") {
  const form = document.querySelector("#interest-form");
  if (form) {
    const prepare = () => {
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form));
      values.consent = form.elements.consent.checked;
      try {
        const draft = prepareDraft(values, form.dataset.language);
        document.querySelector("#draft-body").value = draft.body;
        document.querySelector("#open-email").href = draft.href;
        document.querySelector("#draft-preview").hidden = false;
        document.querySelector("#draft-status").textContent = form.dataset.language === "zh"
          ? "草稿已生成，尚未发送。请检查后在邮件应用中发送。"
          : "Draft prepared; nothing has been sent. Review it, then send from your email app.";
      } catch {
        document.querySelector("#draft-status").textContent = form.dataset.language === "zh"
          ? "请填写六个问题，并检查回答长度。" : "Please answer all six questions and check the answer lengths.";
      }
    };
    form.addEventListener("submit", (event) => { event.preventDefault(); prepare(); });
    document.querySelector("#prepare-email").addEventListener("click", prepare);
    form.addEventListener("input", () => {
      document.querySelector("#draft-preview").hidden = true;
      document.querySelector("#draft-status").textContent = "";
      document.querySelector("#open-email").href = "mailto:zhihua@k4cell.com";
      document.querySelector("#draft-body").value = "";
    });
  }
}
