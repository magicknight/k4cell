/* No network request, storage, analytics, or automatic sending. */
export const PROPOSAL_VERSION = "K4V-180D-2026-09-09";
const recipients = "zhihua@k4cell.com";
const interestValues = ["NO", "LEARN", "CONDITIONAL_SMALL", "INCLINED"];
const revisitValues = ["YES", "NO", "UNSURE"];

const interestLabels = {
  NO: "不考虑 / Would not consider",
  LEARN: "愿意了解 / Would like to learn",
  CONDITIONAL_SMALL: "满足条件后可能少量购买 / Might buy a small amount if conditions are met",
  INCLINED: "倾向参与 / Inclined to participate",
};
const revisitLabels = {
  YES: "愿意 / Yes",
  NO: "不愿意 / No",
  UNSURE: "暂不确定 / Unsure",
};
const copyText = {
  zh: {
    prepared: "草稿已生成，尚未发送。请检查后在邮件应用中发送。",
    invalid: "请填写六个问题，并检查回答长度。",
    emptyField: "请填写有效回答（不能只填空格）。",
    copied: "草稿已复制到剪贴板。",
    copyFailed: "自动复制失败，请手动选中下方文本框中的草稿复制。",
    mailtoWarn: "草稿较长，部分邮件客户端可能截断 mailto 链接；如打开后内容不全或无法启动，请点击“复制草稿”并手动发送至 zhihua@k4cell.com。",
  },
  en: {
    prepared: "Draft prepared; nothing has been sent. Review it, then send from your email app.",
    invalid: "Please answer all six questions and check the answer lengths.",
    emptyField: "Please enter a non-empty answer (spaces alone are not accepted).",
    copied: "Draft copied to clipboard.",
    copyFailed: "Could not copy automatically; please select and copy the text from the box above.",
    mailtoWarn: "This draft is long for some email apps; if it opens truncated or fails to open, click Copy draft and email zhihua@k4cell.com directly.",
  },
};

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
    `3. Interest / 条件兴趣: ${values.q3} (${interestLabels[values.q3]})`,
    `4. Conditions / 决定条件: ${text("q4", 160)}`,
    `5. Reasons to decline / 不买原因: ${text("q5", 160)}`,
    `6. Willing to look again / 愿意再看: ${values.q6} (${revisitLabels[values.q6]})`,
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
    const lang = form.dataset.language === "zh" ? "zh" : "en";
    const msg = copyText[lang];
    const requiredTextIds = ["q1", "q2", "q4", "q5"];
    const counterNodes = [...form.querySelectorAll(".interest-count[data-count-for]")];
    const preview = document.querySelector("#draft-preview");
    const status = document.querySelector("#draft-status");
    const openEmail = document.querySelector("#open-email");
    const draftBody = document.querySelector("#draft-body");
    const draftWarn = document.querySelector("#draft-warn");
    const copyBtn = document.querySelector("#copy-draft");

    const updateCounters = () => {
      for (const node of counterNodes) {
        const field = form.elements[node.dataset.countFor];
        if (!field) continue;
        const limit = field.maxLength > 0 ? field.maxLength : 160;
        node.textContent = `${field.value.length} / ${limit}`;
      }
    };

    const prepare = () => {
      for (const id of requiredTextIds) {
        const field = form.elements[id];
        if (!field) continue;
        field.setCustomValidity(field.value.length > 0 && !field.value.trim() ? msg.emptyField : "");
      }
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form));
      values.consent = form.elements.consent.checked;
      try {
        const draft = prepareDraft(values, form.dataset.language);
        draftBody.value = draft.body;
        openEmail.href = draft.href;
        preview.hidden = false;
        status.textContent = msg.prepared;
        if (draftWarn) {
          const isLong = draft.href.length > 1800;
          draftWarn.hidden = !isLong;
          draftWarn.textContent = isLong ? msg.mailtoWarn : "";
        }
      } catch {
        status.textContent = msg.invalid;
      }
    };

    form.addEventListener("submit", (event) => { event.preventDefault(); prepare(); });
    document.querySelector("#prepare-email").addEventListener("click", prepare);
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        if (!draftBody.value) return;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(draftBody.value);
            status.textContent = msg.copied;
            return;
          }
        } catch {}
        try {
          draftBody.select();
          const ok = typeof document.execCommand === "function" && document.execCommand("copy");
          status.textContent = ok ? msg.copied : msg.copyFailed;
        } catch {
          status.textContent = msg.copyFailed;
        }
      });
    }
    form.addEventListener("input", (event) => {
      if (event.target && typeof event.target.setCustomValidity === "function") {
        event.target.setCustomValidity("");
      }
      updateCounters();
      preview.hidden = true;
      status.textContent = "";
      if (draftWarn) {
        draftWarn.hidden = true;
        draftWarn.textContent = "";
      }
      openEmail.href = "mailto:zhihua@k4cell.com";
      draftBody.value = "";
    });
    updateCounters();
  }
}
