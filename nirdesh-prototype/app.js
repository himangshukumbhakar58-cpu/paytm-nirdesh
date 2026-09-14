const $ = (s) => document.querySelector(s);
const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function formatLakhText(n) {
  if (n >= 100000 && n % 100000 === 0) {
    const lakhs = n / 100000;
    return `₹${lakhs} lakh`;
  }
  return money(n);
}

function calculateEMI(principal, annualRatePct, tenureMonths) {
  const p = principal;
  const r = (annualRatePct / 12) / 100;
  const n = tenureMonths;
  if (r === 0 || n === 0) {
    const emi = n > 0 ? p / n : 0;
    return { emi: Math.round(emi), totalRepayment: Math.round(p), totalInterest: 0 };
  }
  const pow = Math.pow(1 + r, n);
  const emi = p * r * pow / (pow - 1);
  const totalRepayment = emi * n;
  const totalInterest = totalRepayment - p;
  return {
    emi: Math.round(emi),
    totalRepayment: Math.round(totalRepayment),
    totalInterest: Math.round(totalInterest)
  };
}

let botLang = 'bn'; // Controls language for AI/chat bot responses only

function detectLanguage(text) {
  if (!text) return botLang;
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  const banglishWords = ['amar', 'lagbe', 'kintu', 'parbo', 'dite', 'hoyeche', 'korte', 'chai', 'bere', 'gelo', 'keno', 'khoroch', 'taka', 'mashe', 'ei'];
  const lower = text.toLowerCase();
  for (const w of banglishWords) {
    if (lower.includes(w)) return 'bn';
  }
  return 'en';
}

const botMsg = {
  en: {
    greeting: 'Tell me what you’re planning, and I’ll help you understand the options without rushing a decision.',
    lendingDetected: 'I detected that this is a <strong>Lending request</strong>. Here are the details extracted from your query:',
    finAssessPrompt: 'Great. Let’s complete your <strong>Financial Assessment</strong> to evaluate your monthly repayment capacity:',
    finAssessDone: (room) => `Financial Assessment complete! Your estimated available monthly room is <strong>${room}</strong>.`,
    emiCalcPrompt: 'Here is your <strong>Indicative / Demo estimate</strong> for real EMI calculations using the standard financial formula:',
    emiCalcDone: (emi, tenure, total) => `Real EMI Calculation complete! Selected plan: <strong>${emi} / month</strong> for ${tenure} months. Total repayment: ${total}.`,
    whatIfPrompt: 'Here are <strong>3 interactive What-if Scenarios</strong>. Click any scenario card to compare EMI, total repayment and interest:',
    whatIfDone: (title, emi) => `Selected scenario confirmed! You selected <strong>${title}</strong> with an estimated EMI of <strong>${emi}/month</strong>.`,
    aiGuidancePrompt: 'Here is an <strong>AI-style explanation</strong> for your selected loan option:',
    aiGuidanceDone: (title) => `AI Explanation acknowledged for <strong>${title}</strong>!`,
    docIntelPrompt: 'Here is the <strong>Document Intelligence</strong> section. Upload your payslip or income proof to extract income details:',
    docIntelDone: (fileName, inc) => `Document Intelligence complete for <strong>${fileName}</strong>! Extracted Monthly Income: <strong>${inc}</strong>.`,
    nextActionPrompt: 'Here is your final <strong>Next Action summary</strong>. Your loan planning journey is complete and ready for partner review:',
    nextActionDone: 'Application review submitted for <strong>Partner Review</strong>! Your loan planning summary has been stored in your workspace.',
    insurancePrompt: 'Tell me your insurance query, and I’ll explain your policy terms and claim steps clearly.',
    insuranceDetected: 'I detected your <strong>Insurance Claim request</strong> for hospitalisation. Here is the policy breakdown and claim process flow:',
    insuranceChecklistDone: 'Here is your <strong>Claim Action Checklist</strong>: 1. Inform insurer TPA within 24h of admission. 2. Present Health Card at desk. 3. Collect itemised bills & discharge summary.',
    fintechPrompt: 'Ask me about your monthly spending or savings goals, and I’ll provide clear financial insights.',
    fintechDetected: 'I analyzed your August spending pattern to explain why your expenses increased this month:',
    fintechPlanDone: '90-Day Financial Plan created! 1. Limit dining out budget to ₹6,400/month. 2. Set auto-save transfer of ₹5,000 after salary day.'
  },
  bn: {
    greeting: 'আপনি কী পরিকল্পনা করছেন বলুন, কোনো তাড়া ছাড়াই সব বিকল্প বুঝতে আপনাকে সাহায্য করব।',
    lendingDetected: 'আমি শনাক্ত করেছি এটি একটি <strong>ঋণ অনুরোধ (Lending request)</strong>। আপনার বার্তা থেকে প্রাপ্ত তথ্যসমূহ:',
    finAssessPrompt: 'দুর্দান্ত। আপনার মাসিক পরিশোধের ক্ষমতা মূল্যায়নের জন্য <strong>আর্থিক মূল্যায়ন (Financial Assessment)</strong> সম্পন্ন করুন:',
    finAssessDone: (room) => `আর্থিক মূল্যায়ন সম্পন্ন হয়েছে! আপনার আনুমানিক অবশিষ্ট মাসিক বাজেট <strong>${room}</strong>।`,
    emiCalcPrompt: 'এখানে মানক সূত্র ব্যবহার করে গণনাকৃত আপনার <strong>ইএমআই হিসাব (Real EMI Calculation)</strong>:',
    emiCalcDone: (emi, tenure, total) => `ইএমআই হিসাব সম্পন্ন হয়েছে! নির্বাচিত প্ল্যান: <strong>${emi} / মাস</strong> ${tenure} মাসের জন্য। মোট পরিশোধ: ${total}।`,
    whatIfPrompt: 'এখানে <strong>৩টি ইন্টারেক্টিভ হোয়াট-ইফ সিনারিও</strong> রয়েছে। তুলনা করতে পছন্দমতো নির্বাচন করুন:',
    whatIfDone: (title, emi) => `নির্বাচিত সিনারিও নিশ্চিত করা হয়েছে! আপনি <strong>${title}</strong> নির্বাচন করেছেন (মাসিক ইএমআই <strong>${emi}/মাস</strong>)।`,
    aiGuidancePrompt: 'আপনার নির্বাচিত ঋণ অপশনের জন্য <strong>এআই আর্থিক ব্যাখ্যা (AI Guidance)</strong>:',
    aiGuidanceDone: (title) => `এআই ব্যাখ্যা গ্রহণ করা হয়েছে <strong>${title}</strong>-এর জন্য!`,
    docIntelPrompt: 'এখানে <strong>নথিপত্র বুদ্ধিমত্তা (Document Intelligence)</strong> বিভাগ। আয়ের প্রমাণপত্র আপলোড করুন:',
    docIntelDone: (fileName, inc) => `নথিপত্র বিশ্লেষণ সম্পন্ন <strong>${fileName}</strong>-এর জন্য! প্রাপ্ত মাসিক আয়: <strong>${inc}</strong>।`,
    nextActionPrompt: 'এখানে আপনার চূড়ান্ত <strong>পরবর্তী পদক্ষেপের সারসংক্ষেপ (Next Action Summary)</strong>। আপনার ঋণ পরিকল্পনা সম্পন্ন হয়েছে:',
    nextActionDone: 'আপনার আবেদনটি <strong>পার্টনার পর্যালোচনার (Partner Review)</strong> জন্য জমা দেওয়া হয়েছে!',
    insurancePrompt: 'আপনার বিমা সংক্রান্ত প্রশ্ন বলুন, আমি আপনার পলিসির শর্তাবলী এবং দাবির প্রক্রিয়া সহজভাবে বুঝিয়ে দেব।',
    insuranceDetected: 'আমি হাসপাতালে ভর্তির সংক্রান্ত আপনার <strong>বিমা দাবি অনুরোধ (Insurance Claim request)</strong> পেয়েছি। পলিসির বিবরণ নিচে দেওয়া হলো:',
    insuranceChecklistDone: 'এখানে আপনার <strong>দাবির পদক্ষেপের চেকলিস্ট (Claim Checklist)</strong>: ১. ভর্তি হওয়ার ২৪ ঘণ্টার মধ্যে টিপিএকে অবহিত করুন। ২. হাসপাতালে হেলথ কার্ড জমা দিন। ৩. ডিসচার্জের সময় আইটেমাইজড বিল সংগ্রহ করুন।',
    fintechPrompt: 'আপনার মাসিক খরচ বা সঞ্চয়ের লক্ষ্য সম্পর্কে জিজ্ঞাসা করুন, আমি স্পষ্ট আর্থিক তথ্য প্রদান করব।',
    fintechDetected: 'আমি আপনার আগস্ট মাসের খরচের বিবরণ বিশ্লেষণ করে বুঝিয়ে দিচ্ছি কেন আপনার খরচ বৃদ্ধি পেয়েছিল:',
    fintechPlanDone: '৯০ দিনের আর্থিক পরিকল্পনা তৈরি হয়েছে! ১. ডাইনিং আউট বাজেট ৬,৪০০ টাকায় সীমিত রাখুন। ২. বেতন পাওয়ার পরে ৫,০০০ টাকার অটো-সেভ নির্ধারণ করুন।'
  }
};

function getBotText(key, ...args) {
  const langObj = botMsg[botLang] || botMsg.en;
  const val = langObj[key] || botMsg.en[key];
  if (typeof val === 'function') {
    return val(...args);
  }
  return val || '';
}

const journeys = {
  lending: {
    icon: '◈',
    name: 'Lending journey',
    title: 'Loan planning',
    progress: 20,
    steps: [
      ['Requirement captured', '₹5 lakh · EMI under ₹12,000', 'current'],
      ['Assess affordability', 'Income & obligations', ''],
      ['Explore scenarios', 'Indicative comparisons', ''],
      ['Review documents', 'Payslip & bank statement', ''],
      ['Next action', 'Choose a lender to explore', '']
    ],
    side: ['✦', 'A clearer repayment plan', 'We’ll keep your preferred EMI in view while you compare indicative options.']
  },
  insurance: {
    icon: '♢',
    name: 'Insurance journey',
    title: 'Policy clarity',
    progress: 25,
    steps: [
      ['Policy uploaded', 'Health Secure Plus.pdf', 'done'],
      ['Understand coverage', 'Benefits & exclusions', 'current'],
      ['Prepare claim documents', 'Checklist & gaps', ''],
      ['Next action', 'Contact insurer / TPA', '']
    ],
    side: ['♧', 'Know before you need it', 'Turn policy wording into a straightforward action plan.']
  },
  fintech: {
    icon: '◌',
    name: 'Fintech insights',
    title: 'Money snapshot',
    progress: 50,
    steps: [
      ['Accounts connected', 'Demo transaction data', 'done'],
      ['Spending pattern', 'This month’s picture', 'done'],
      ['Set a goal', 'Build your next 90 days', 'current'],
      ['Next action', 'Review your plan', '']
    ],
    side: ['◌', 'Small signals, useful choices', 'See trends in your spending and test a practical savings plan.']
  }
};

let active = 'lending';
let lendingStage = 0; // 0: Req, 1: Affordability, 2: Real EMI, 3: What-if, 4: AI Expl, 5: Doc Intel, 6: Next Action
let lendingData = {
  userQuery: 'Amar ₹5 lakh loan lagbe, kintu EMI ₹12,000-er beshi dite parbo na.',
  loanAmount: 500000,
  maxEMI: 12000,
  isEditing: false
};

let financialAssessment = {
  income: 35000,
  expenses: 18000,
  existingEMI: 3000,
  completed: false
};

let emiCalc = {
  loanAmount: 500000,
  interestRate: 10,
  tenureMonths: 60,
  completed: false
};

let whatIfState = {
  selectedIdx: 0,
  completed: false
};

let aiExplanationState = {
  completed: false
};

let documentState = {
  uploaded: false,
  fileName: '',
  extractedIncome: 35000,
  docType: 'Payslip / Income Proof',
  missingDocs: ['Bank Statement (Last 6 Months)'],
  completed: false
};

let nextActionState = {
  completed: false
};

let insuranceData = {
  userQuery: 'Amar hospital bill hoyeche, insurance claim korte chai.',
  policyUploaded: true,
  policyName: 'Health Secure Plus.pdf',
  claimSubmitted: false
};

let fintechData = {
  userQuery: 'Ei mashe amar spending eto bere gelo keno?',
  planCreated: false
};

function convertBengaliDigits(str) {
  if (!str) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, d => bnDigits.indexOf(d));
}

function parseLendingRequest(text) {
  if (!text) return { amount: 500000, emi: 12000 };
  
  const cleaned = convertBengaliDigits(text);

  let amount = null;
  let emi = null;

  // 1. Extract Loan Amount
  // Pattern 1a: Lakhs (3 lakh, 3.5 lakh, 3 lak, 3 lac, 3l, 3 লাখ)
  const lakhMatch = cleaned.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lakh|lak|lac|\bl\b|লাখ)/i);
  // Pattern 1b: Thousands / k (500k, 300k)
  const kLoanMatch = cleaned.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b\s*(?:loan|amount|taka|rupees)?/i);
  // Pattern 1c: Explicit loan keyword near number (loan of 300000, 300000 loan, ₹3,00,000 loan)
  const loanKwMatch = cleaned.match(/(?:loan|borrow|need|require|want)\s*(?:amount)?\s*(?:of|is|:|=|for|around)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i) ||
                      cleaned.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)\s*(?:loan|amount)/i);

  if (lakhMatch) {
    amount = parseFloat(lakhMatch[1]) * 100000;
  } else if (kLoanMatch && parseFloat(kLoanMatch[1]) >= 20) {
    amount = parseFloat(kLoanMatch[1]) * 1000;
  } else if (loanKwMatch) {
    const val = parseInt(loanKwMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(val) && val >= 10000) {
      amount = val;
    }
  }

  if (!amount) {
    const rawNums = Array.from(cleaned.matchAll(/(?:₹|rs\.?|inr)?\s*([\d,]+)/gi))
      .map(m => parseInt(m[1].replace(/,/g, ''), 10))
      .filter(n => !isNaN(n) && n >= 20000);
    if (rawNums.length > 0) {
      amount = Math.max(...rawNums);
    }
  }

  if (!amount) {
    amount = 500000;
  }

  // 2. Extract Max EMI
  const emiKeywordMatch = cleaned.match(/(?:emi|monthly|per\s*month|installment|repayment|mashe)\b[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand)?/i);
  const emiNumFirstMatch = cleaned.match(/(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand)?\s*(?:[^\d\n]*?)\s*(?:emi|monthly|per\s*month|\/mo|\/month|mashe|-er\s*beshi|taka\s*emi)/i);
  const emiQualifierMatch = cleaned.match(/(?:below|under|max|maximum|upto|up\s*to|less\s*than|within|cap(?:ped)?\s*at|limit)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand)?/i);

  if (emiKeywordMatch) {
    let val = parseFloat(emiKeywordMatch[1].replace(/,/g, ''));
    if (emiKeywordMatch[2] && emiKeywordMatch[2].toLowerCase().startsWith('k')) val *= 1000;
    if (!isNaN(val)) emi = val;
  } else if (emiNumFirstMatch) {
    let val = parseFloat(emiNumFirstMatch[1].replace(/,/g, ''));
    if (emiNumFirstMatch[2] && emiNumFirstMatch[2].toLowerCase().startsWith('k')) val *= 1000;
    if (!isNaN(val)) emi = val;
  } else if (emiQualifierMatch) {
    let val = parseFloat(emiQualifierMatch[1].replace(/,/g, ''));
    if (emiQualifierMatch[2] && emiQualifierMatch[2].toLowerCase().startsWith('k')) val *= 1000;
    if (!isNaN(val) && val < amount) emi = val;
  }

  if (!emi) {
    const allNums = Array.from(cleaned.matchAll(/([\d,]+(?:\.\d+)?)\s*(k|thousand)?/gi))
      .map(m => {
        let n = parseFloat(m[1].replace(/,/g, ''));
        if (m[2] && m[2].toLowerCase().startsWith('k')) n *= 1000;
        return n;
      })
      .filter(n => !isNaN(n) && n > 0 && n !== amount && n < amount);
    if (allNums.length > 0) {
      emi = allNums[0];
    } else {
      const calc = calculateEMI(amount, 10, 60);
      emi = calc.emi;
    }
  }

  return { amount: Math.round(amount), emi: Math.round(emi) };
}

function getScenariosList(amount) {
  const L = amount || lendingData.loanAmount || 500000;
  const lowerL = Math.round((L * 0.8) / 10000) * 10000 || Math.round(L * 0.8);
  return [
    { id: 0, title: `${money(L)} for 5 years`, amount: L, years: 5, months: 60, tag: '★ Recommended' },
    { id: 1, title: `${money(lowerL)} for 5 years`, amount: lowerL, years: 5, months: 60, tag: 'Lower EMI' },
    { id: 2, title: `${money(L)} for 4 years`, amount: L, years: 4, months: 48, tag: 'Faster Payoff' }
  ];
}

function bot(text) {
  return `<div class="message-row"><div class="bot-avatar">✦</div><div class="bubble">${text}</div></div>`;
}

function user(text) {
  return `<div class="message-row user"><div class="bubble">${text}</div></div>`;
}

function updateRight() {
  const j = journeys[active];
  $('#crumbIcon').textContent = j.icon;
  $('#crumbName').textContent = j.name;
  $('#journeyTitle').textContent = j.title;
  $('#progressText').textContent = `Step ${Math.max(1, Math.ceil((j.progress || 20) / 20))} of ${j.steps.length}`;
  $('#progressPct').textContent = `${j.progress}%`;
  $('#progressBar').style.width = j.progress + '%';
  $('#steps').innerHTML = j.steps.map((s, i) =>
    `<div class="step ${s[2]}">
      <span class="step-dot">${s[2] === 'done' ? '✓' : i + 1}</span>
      <div><strong>${s[0]}</strong><small>${s[1]}</small></div>
    </div>`
  ).join('');
  $('#sideCard').innerHTML = `<span class="small-icon">${j.side[0]}</span><h3>${j.side[1]}</h3><p>${j.side[2]}</p><button>See how this works →</button>`;
}

function renderLending() {
  let html = `<div class="intro"><div class="nirdesh-orb">✦</div><div><h1>Good to see you, Himangshu.</h1><p>I’m Nirdesh, your guide for smarter financial decisions.</p></div></div>`;
  html += bot(getBotText('greeting'));

  if (lendingData.userQuery) {
    html += user(lendingData.userQuery);
  }

  html += bot(getBotText('lendingDetected'));

  if (lendingData.isEditing) {
    html += `
    <div class="choice-card" id="editCard">
      <h3 style="margin:0 0 10px; font-family:'Plus Jakarta Sans'; font-size:14px; color:var(--ink);">Edit loan requirement</h3>
      <div class="mini-fields">
        <div class="mini-field">
          <label>REQUESTED LOAN AMOUNT (₹)</label>
          <input id="editAmountInput" value="${lendingData.loanAmount}" inputmode="numeric" />
        </div>
        <div class="mini-field">
          <label>MAX PREFERRED EMI (₹)</label>
          <input id="editEmiInput" value="${lendingData.maxEMI}" inputmode="numeric" />
        </div>
      </div>
      <div class="choice-grid" style="margin-top:14px;">
        <button class="choice primary" id="saveEditLoan">Save & update</button>
        <button class="choice" id="cancelEditLoan">Cancel</button>
      </div>
    </div>`;
  } else {
    const loanFormatted = money(lendingData.loanAmount);
    const emiFormatted = money(lendingData.maxEMI);
    const loanText = formatLakhText(lendingData.loanAmount);

    html += `
    <div class="choice-card">
      <div class="fact-row">
        <div class="fact">
          <small>REQUESTED LOAN AMOUNT</small>
          <b>${loanFormatted}</b>
        </div>
        <div class="fact">
          <small>MAXIMUM PREFERRED EMI</small>
          <b>${emiFormatted} / month</b>
        </div>
      </div>
      <p style="margin:14px 0 12px; font-size:13px; color:var(--ink); line-height:1.5;">
        You're looking for a ${loanText} loan with a maximum monthly EMI of ${emiFormatted}. Shall I help you evaluate the options?
      </p>
      <div class="choice-grid">
        <button class="choice primary" id="confirmLoan">Yes, continue</button>
        <button class="choice" id="editLoan">Edit details</button>
      </div>
    </div>`;
  }

  if (lendingStage >= 1) {
    const inc = financialAssessment.income;
    const exp = financialAssessment.expenses;
    const exEmi = financialAssessment.existingEMI;
    const obligations = exp + exEmi;
    const room = Math.max(0, inc - obligations);
    const preferredEMI = lendingData.maxEMI;

    html += bot(getBotText('finAssessPrompt'));

    html += `
    <div class="form-card" id="financialAssessmentCard">
      <h3>Financial Assessment</h3>
      <p>Enter or adjust your monthly income and obligations (used for indicative assessment only):</p>
      <div class="mini-fields">
        <div class="mini-field">
          <label>MONTHLY INCOME (₹)</label>
          <input id="income" value="${inc}" inputmode="numeric" />
        </div>
        <div class="mini-field">
          <label>MONTHLY EXPENSES (₹)</label>
          <input id="expenses" value="${exp}" inputmode="numeric" />
        </div>
        <div class="mini-field">
          <label>EXISTING EMI (₹)</label>
          <input id="existing" value="${exEmi}" inputmode="numeric" />
        </div>
      </div>

      <div class="affordability-summary" style="margin-top:16px; padding:14px; background:#f7f9fc; border-radius:9px; border:1px solid #e2e9f3;">
        <h4 style="margin:0 0 10px; font-size:12px; font-family:'Plus Jakarta Sans'; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Affordability Summary</h4>
        <div class="fact-row" style="margin-top:0;">
          <div class="fact">
            <small>TOTAL OBLIGATIONS</small>
            <b id="totalObligationsVal">${money(obligations)}</b>
          </div>
          <div class="fact">
            <small>AVAILABLE MONTHLY ROOM</small>
            <b id="availableRoomVal" style="color:${room >= preferredEMI ? '#0aa56b' : '#d97706'}">${money(room)}</b>
          </div>
        </div>
        <p id="affordabilityNote" style="margin:10px 0 0; font-size:12px; color:var(--ink); line-height:1.45;">
          ${room >= preferredEMI
            ? `✓ Your estimated monthly room of <strong>${money(room)}</strong> covers your preferred maximum EMI of <strong>${money(preferredEMI)}</strong>.`
            : `⚠️ Your estimated monthly room of <strong>${money(room)}</strong> is lower than your preferred EMI of <strong>${money(preferredEMI)}</strong>.`}
        </p>
      </div>

      <button class="card-action" id="continueToOptions" style="margin-top:16px; background:#00b9f5; font-weight:700; width:100%;">Continue to Loan Options</button>
    </div>`;
  }

  if (lendingStage >= 2) {
    const loanAmt = emiCalc.loanAmount || lendingData.loanAmount || 500000;
    const rate = emiCalc.interestRate || 10;
    const tenureMonths = emiCalc.tenureMonths || 60;
    const calc = calculateEMI(loanAmt, rate, tenureMonths);

    html += bot(getBotText('emiCalcPrompt'));

    html += `
    <div class="scenario-panel" id="emiCalcPanel">
      <div class="scenario-head">
        <div>
          <h3>Loan Options & EMI Calculation</h3>
          <p style="color:#d97706; font-weight:600; margin:3px 0 0;">Indicative / Demo estimate · Illustrative 10% p.a. interest rate · Does not claim loan approval or eligibility</p>
        </div>
      </div>

      <div class="mini-fields" style="margin-top:14px;">
        <div class="mini-field">
          <label>LOAN AMOUNT (P)</label>
          <input id="calcAmount" value="${loanAmt}" inputmode="numeric" />
        </div>
        <div class="mini-field">
          <label>TENURE</label>
          <select id="calcTenure" style="width:100%; border:0; outline:0; font:700 13px inherit; color:#20314a; background:transparent; cursor:pointer;">
            <option value="36" ${tenureMonths === 36 ? 'selected' : ''}>36 Months (3 Years)</option>
            <option value="48" ${tenureMonths === 48 ? 'selected' : ''}>48 Months (4 Years)</option>
            <option value="60" ${tenureMonths === 60 ? 'selected' : ''}>60 Months (5 Years)</option>
            <option value="84" ${tenureMonths === 84 ? 'selected' : ''}>84 Months (7 Years)</option>
          </select>
        </div>
        <div class="mini-field">
          <label>INTEREST RATE (% P.A.)</label>
          <input id="calcRate" value="${rate}" inputmode="decimal" />
        </div>
      </div>

      <div class="fact-row" style="margin-top:16px;">
        <div class="fact" style="background:#f2fbff; border:1px solid #cbeafd;">
          <small>MONTHLY EMI</small>
          <b id="calcEmiVal" style="font-size:17px; color:#009dd8;">${money(calc.emi)} / month</b>
        </div>
        <div class="fact">
          <small>TOTAL INTEREST</small>
          <b id="calcInterestVal">${money(calc.totalInterest)}</b>
        </div>
        <div class="fact">
          <small>TOTAL REPAYMENT</small>
          <b id="calcRepaymentVal">${money(calc.totalRepayment)}</b>
        </div>
      </div>

      <div class="notice" style="margin-top:14px;">
        <strong>Indicative / Demo estimate:</strong> Calculated using formula <code>EMI = P × r × (1+r)^n / ((1+r)^n - 1)</code> at ${rate}% p.a. illustrative rate.
      </div>

      <button class="card-action" id="continueToWhatIf" style="margin-top:16px; background:#00b9f5; font-weight:700; width:100%;">Continue to What-if Scenarios</button>
    </div>`;
  }

  if (lendingStage >= 3) {
    const rate = 10;
    const scenariosList = getScenariosList(lendingData.loanAmount);

    const selectedIdx = whatIfState.selectedIdx !== undefined ? whatIfState.selectedIdx : 0;
    const selectedSc = scenariosList[selectedIdx] || scenariosList[0];
    const calcSel = calculateEMI(selectedSc.amount, rate, selectedSc.months);

    html += bot(getBotText('whatIfPrompt'));

    html += `
    <div class="scenario-panel" id="whatIfPanel">
      <div class="scenario-head">
        <div>
          <h3>Interactive Loan What-if Scenarios</h3>
          <p>Calculated dynamically using standard 10% p.a. EMI formula</p>
        </div>
      </div>

      <div class="scenario-list" style="margin-top:14px;">
        ${scenariosList.map((x, i) => {
          const sc = calculateEMI(x.amount, rate, x.months);
          const isSelected = i === selectedIdx;
          return `
          <div class="scenario ${isSelected ? 'recommended' : ''}" style="cursor:pointer;" data-scenario-idx="${i}">
            ${x.tag ? `<span class="tag">${x.tag}</span>` : ''}
            <b>${money(x.amount)}</b>
            <small>${x.years} years (${x.months} months)</small>
            <div class="emi">EMI ${money(sc.emi)} / mo</div>
          </div>`;
        }).join('')}
      </div>

      <div style="margin-top:18px; padding:16px; background:#f7f9fc; border-radius:10px; border:1px solid #e2e9f3;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h4 style="margin:0; font-family:'Plus Jakarta Sans'; font-size:14px; color:var(--ink);">
            Selected Scenario Details
          </h4>
          <span style="font-size:11px; font-weight:700; color:#057ea9; background:#e0f5fe; padding:3px 8px; border-radius:12px;">
            ${selectedSc.title}
          </span>
        </div>

        <div class="fact-row" style="margin-top:8px;">
          <div class="fact" style="background:#fff; border:1px solid #dce5f0;">
            <small>MONTHLY EMI</small>
            <b style="color:#009dd8; font-size:16px;">${money(calcSel.emi)} / month</b>
          </div>
          <div class="fact" style="background:#fff; border:1px solid #dce5f0;">
            <small>TOTAL INTEREST</small>
            <b>${money(calcSel.totalInterest)}</b>
          </div>
          <div class="fact" style="background:#fff; border:1px solid #dce5f0;">
            <small>TOTAL REPAYMENT</small>
            <b>${money(calcSel.totalRepayment)}</b>
          </div>
        </div>
      </div>

      <button class="card-action" id="continueWithOption" style="margin-top:16px; background:#00b9f5; font-weight:700; width:100%;">
        Continue with this option (${money(selectedSc.amount)} @ ${money(calcSel.emi)}/mo)
      </button>
    </div>`;
  }

  if (lendingStage >= 4) {
    const rate = 10;
    const scenariosList = getScenariosList(lendingData.loanAmount);

    const selectedIdx = whatIfState.selectedIdx !== undefined ? whatIfState.selectedIdx : 0;
    const selectedSc = scenariosList[selectedIdx] || scenariosList[0];
    const calcSel = calculateEMI(selectedSc.amount, rate, selectedSc.months);
    const preferredEMI = lendingData.maxEMI;

    let fitExplanation = botLang === 'bn' 
      ? `যেহেতু আপনার পছন্দের ইএমআই <strong>${money(preferredEMI)}</strong>-এর নিচে, তাই এই ${selectedSc.years} বছরের অপশনটি আপনার পছন্দের সাপেক্ষে উপযুক্ত। কম সময়সীমা মোট সুদ কমাতে পারে কিন্তু মাসিক ইএমআই বৃদ্ধি করে।`
      : `Since your preferred EMI is below <strong>${money(preferredEMI)}</strong>, this ${selectedSc.years}-year option fits your stated preference better. A shorter tenure can reduce total interest but increases the monthly EMI.`;

    html += bot(getBotText('aiGuidancePrompt'));

    html += `
    <div class="insight-card" id="aiExplanationCard">
      <h3>AI Analysis & Guidance</h3>
      <p style="margin-top:4px; font-size:12px; color:var(--muted);">Insights for <strong>${selectedSc.title}</strong> (${money(calcSel.emi)}/month)</p>

      <div style="margin-top:14px; background:#f3fbff; border:1px solid #d4effc; padding:14px; border-radius:9px; font-size:13px; color:#174267; line-height:1.55;">
        <p style="margin:0 0 10px;">
          ${fitExplanation}
        </p>
        <div style="border-top:1px solid #d4effc; paddingTop:10px; margin-top:10px; font-size:12px;">
          <strong>Key Trade-offs:</strong>
          <ul style="margin:6px 0 0; padding-left:18px; line-height:1.5;">
            <li><strong>EMI Fit:</strong> ${money(calcSel.emi)} / month vs maximum preferred ${money(preferredEMI)} / month</li>
            <li><strong>Tenure Impact:</strong> ${selectedSc.years} years (${selectedSc.months} months)</li>
            <li><strong>Total Interest Cost:</strong> ${money(calcSel.totalInterest)} (Total Repayment: ${money(calcSel.totalRepayment)})</li>
          </ul>
        </div>
      </div>

      <button class="card-action" id="continueToDocsBtn" style="margin-top:16px; background:#00b9f5; font-weight:700; width:100%;">
        Continue to Documents
      </button>
    </div>`;
  }

  if (lendingStage >= 5) {
    html += bot(getBotText('docIntelPrompt'));

    if (!documentState.uploaded) {
      html += `
      <div class="upload-card" id="docUploadCard">
        <h3>Upload Documents for Income Verification</h3>
        <p>A payslip or bank statement helps keep your figures organized. Documents are not authenticated or stored permanently.</p>
        <div class="upload-area" id="triggerFileUpload">
          <span>⇧</span>Upload payslip / bank statement <small>PDF, JPG or PNG</small>
        </div>
        <div style="text-align:center; margin-top:12px;">
          <button class="choice" id="demoUploadBtn" style="width:auto; display:inline-block; padding:8px 14px; font-size:12px; font-weight:600; border-color:#00b9f5; color:#057ea9; background:#effaff;">
            📄 Select Demo Payslip (Payslip_August_2026.pdf)
          </button>
        </div>
      </div>`;
    } else {
      const incFormatted = money(documentState.extractedIncome || financialAssessment.income || 35000);

      html += `
      <div class="insight-card" id="docExtractedCard">
        <div style="display:flex; justify-content:space-between; align-items:start; border-bottom:1px solid var(--line); padding-bottom:10px; margin-bottom:12px;">
          <div>
            <h3 style="margin:0; font-family:'Plus Jakarta Sans'; font-size:14px; color:var(--ink);">Document Intelligence Summary</h3>
            <p style="margin:2px 0 0; font-size:11px; color:#0b9865; font-weight:600;">✓ Document parsed successfully</p>
          </div>
          <span style="font-size:11px; color:#057ea9; background:#e0f5fe; padding:3px 8px; border-radius:6px; font-weight:600;">
            ${documentState.fileName}
          </span>
        </div>

        <div style="background:#f7f9fc; padding:12px; border-radius:8px; border:1px solid #e2e9f3; margin-bottom:14px;">
          <div class="fact-row" style="margin-top:0;">
            <div class="fact" style="background:#fff;">
              <small>DOCUMENT TYPE DETECTED</small>
              <b style="color:#057ea9;">Income proof detected</b>
            </div>
            <div class="fact" style="background:#fff;">
              <small>MONTHLY NET INCOME</small>
              <b style="color:#10a36a;">${incFormatted}</b>
            </div>
          </div>
        </div>

        <button class="card-action" id="continueToNextActionBtn" style="margin-top:16px; background:#00b9f5; font-weight:700; width:100%;">
          Continue to Next Action
        </button>
      </div>`;
    }
  }

  if (lendingStage >= 6) {
    const rate = 10;
    const scenariosList = getScenariosList(lendingData.loanAmount);

    const selectedIdx = whatIfState.selectedIdx !== undefined ? whatIfState.selectedIdx : 0;
    const selectedSc = scenariosList[selectedIdx] || scenariosList[0];
    const calcSel = calculateEMI(selectedSc.amount, rate, selectedSc.months);

    html += bot(getBotText('nextActionPrompt'));

    html += `
    <div class="insight-card" id="nextActionCard" style="border:1.5px solid #00b9f5; background:#fff;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:10px; margin-bottom:14px;">
        <div>
          <h3 style="margin:0; font-family:'Plus Jakarta Sans'; font-size:15px; color:var(--ink);">Next Action: Continue to Partner Review</h3>
          <p style="margin:2px 0 0; font-size:11px; color:#0b9865; font-weight:700;">✓ Journey Completed · Ready for Partner Review</p>
        </div>
        <span style="font-size:11px; font-weight:800; color:#057ea9; background:#e0f5fe; padding:4px 10px; border-radius:12px;">100% Complete</span>
      </div>

      <div class="fact-row" style="margin-top:0;">
        <div class="fact" style="background:#f7f9fc;">
          <small>SELECTED LOAN OPTION</small>
          <b>${selectedSc.title}</b>
        </div>
        <div class="fact" style="background:#f7f9fc;">
          <small>ESTIMATED EMI</small>
          <b style="color:#009dd8;">${money(calcSel.emi)} / month</b>
        </div>
      </div>

      <div class="choice-grid" style="margin-top:16px;">
        <button class="choice" id="reviewAppBtn" style="font-weight:700; text-align:center;">Review Application</button>
        <button class="choice primary" id="continueToPartnerBtn" style="font-weight:700; text-align:center;">Continue to Partner</button>
      </div>
    </div>`;
  }

  $('#conversation').innerHTML = html;
  bindLending();
}

function bindLending() {
  $('#confirmLoan')?.addEventListener('click', () => {
    lendingStage = 1;
    financialAssessment.completed = false;
    journeys.lending.progress = 40;
    journeys.lending.steps[0][1] = `${formatLakhText(lendingData.loanAmount)} · EMI under ${money(lendingData.maxEMI)}`;
    journeys.lending.steps[0][2] = 'done';
    journeys.lending.steps[1][2] = 'current';
    updateRight();
    renderLending();
  });

  $('#editLoan')?.addEventListener('click', () => {
    lendingData.isEditing = true;
    renderLending();
  });

  $('#saveEditLoan')?.addEventListener('click', () => {
    const rawAmt = parseInt($('#editAmountInput')?.value || '500000', 10);
    const rawEmi = parseInt($('#editEmiInput')?.value || '12000', 10);
    if (!isNaN(rawAmt) && rawAmt > 0) {
      lendingData.loanAmount = rawAmt;
      emiCalc.loanAmount = rawAmt;
    }
    if (!isNaN(rawEmi) && rawEmi > 0) lendingData.maxEMI = rawEmi;
    lendingData.isEditing = false;
    journeys.lending.steps[0][1] = `${formatLakhText(lendingData.loanAmount)} · EMI under ${money(lendingData.maxEMI)}`;
    updateRight();
    renderLending();
  });

  $('#cancelEditLoan')?.addEventListener('click', () => {
    lendingData.isEditing = false;
    renderLending();
  });

  const updateSummaryDOM = () => {
    const inc = parseInt($('#income')?.value || '0', 10) || 0;
    const exp = parseInt($('#expenses')?.value || '0', 10) || 0;
    const exEmi = parseInt($('#existing')?.value || '0', 10) || 0;
    financialAssessment.income = inc;
    financialAssessment.expenses = exp;
    financialAssessment.existingEMI = exEmi;

    const obligations = exp + exEmi;
    const room = Math.max(0, inc - obligations);
    const preferredEMI = lendingData.maxEMI;

    const obligEl = $('#totalObligationsVal');
    const roomEl = $('#availableRoomVal');
    const noteEl = $('#affordabilityNote');

    if (obligEl) obligEl.textContent = money(obligations);
    if (roomEl) {
      roomEl.textContent = money(room);
      roomEl.style.color = room >= preferredEMI ? '#0aa56b' : '#d97706';
    }
    if (noteEl) {
      noteEl.innerHTML = room >= preferredEMI
        ? `✓ Your estimated monthly room of <strong>${money(room)}</strong> covers your preferred maximum EMI of <strong>${money(preferredEMI)}</strong>.`
        : `⚠️ Your estimated monthly room of <strong>${money(room)}</strong> is lower than your preferred EMI of <strong>${money(preferredEMI)}</strong>.`;
    }
  };

  $('#income')?.addEventListener('input', updateSummaryDOM);
  $('#expenses')?.addEventListener('input', updateSummaryDOM);
  $('#existing')?.addEventListener('input', updateSummaryDOM);

  $('#continueToOptions')?.addEventListener('click', () => {
    financialAssessment.completed = true;
    lendingStage = 2;
    emiCalc.loanAmount = lendingData.loanAmount || 500000;
    journeys.lending.progress = 60;
    journeys.lending.steps[1][2] = 'done';
    journeys.lending.steps[2][2] = 'current';
    updateRight();
    renderLending();
  });

  const updateEmiCalcDOM = () => {
    const amt = parseInt($('#calcAmount')?.value || '0', 10) || 0;
    const tenure = parseInt($('#calcTenure')?.value || '60', 10) || 60;
    const rate = parseFloat($('#calcRate')?.value || '10') || 10;

    emiCalc.loanAmount = amt;
    emiCalc.tenureMonths = tenure;
    emiCalc.interestRate = rate;

    const res = calculateEMI(amt, rate, tenure);

    const emiEl = $('#calcEmiVal');
    const interestEl = $('#calcInterestVal');
    const repaymentEl = $('#calcRepaymentVal');

    if (emiEl) emiEl.textContent = `${money(res.emi)} / month`;
    if (interestEl) interestEl.textContent = money(res.totalInterest);
    if (repaymentEl) repaymentEl.textContent = money(res.totalRepayment);
  };

  $('#calcAmount')?.addEventListener('input', updateEmiCalcDOM);
  $('#calcTenure')?.addEventListener('change', updateEmiCalcDOM);
  $('#calcRate')?.addEventListener('input', updateEmiCalcDOM);

  $('#continueToWhatIf')?.addEventListener('click', () => {
    emiCalc.completed = true;
    lendingStage = 3;
    journeys.lending.progress = 80;
    journeys.lending.steps[2][2] = 'done';
    journeys.lending.steps[3][2] = 'current';
    updateRight();
    renderLending();
  });

  document.querySelectorAll('[data-scenario-idx]').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.scenarioIdx, 10);
      whatIfState.selectedIdx = idx;
      renderLending();
    });
  });

  $('#continueWithOption')?.addEventListener('click', () => {
    whatIfState.completed = true;
    lendingStage = 4;
    journeys.lending.progress = 90;
    journeys.lending.steps[3][2] = 'done';
    updateRight();
    renderLending();
  });

  $('#continueToDocsBtn')?.addEventListener('click', () => {
    aiExplanationState.completed = true;
    lendingStage = 5;
    journeys.lending.progress = 80;
    journeys.lending.steps[3][2] = 'done';
    updateRight();
    renderLending();
  });

  $('#triggerFileUpload')?.addEventListener('click', () => $('#fileInput').click());

  $('#demoUploadBtn')?.addEventListener('click', () => {
    documentState.uploaded = true;
    documentState.fileName = 'Payslip_August_2026.pdf';
    documentState.extractedIncome = financialAssessment.income || 35000;
    renderLending();
  });

  $('#continueToNextActionBtn')?.addEventListener('click', () => {
    documentState.completed = true;
    lendingStage = 6;
    journeys.lending.progress = 100;
    journeys.lending.steps[0][2] = 'done';
    journeys.lending.steps[1][2] = 'done';
    journeys.lending.steps[2][2] = 'done';
    journeys.lending.steps[3][2] = 'done';
    journeys.lending.steps[4][2] = 'done';
    updateRight();
    renderLending();
  });

  $('#reviewAppBtn')?.addEventListener('click', () => {
    const rate = 10;
    const scenariosList = getScenariosList(lendingData.loanAmount);
    const selectedIdx = whatIfState.selectedIdx !== undefined ? whatIfState.selectedIdx : 0;
    const selectedSc = scenariosList[selectedIdx] || scenariosList[0];
    const calcSel = calculateEMI(selectedSc.amount, rate, selectedSc.months);
    alert(`Application Review Summary:\n\n• Selected Plan: ${selectedSc.title}\n• EMI: ${money(calcSel.emi)} / month\n• Monthly Income: ${money(financialAssessment.income)}\n• Attached Document: ${documentState.fileName || 'Payslip_August_2026.pdf'}\n• Status: Ready for Partner Review`);
  });

  $('#continueToPartnerBtn')?.addEventListener('click', () => {
    nextActionState.completed = true;
    journeys.lending.progress = 100;
    updateRight();
    renderLending();
  });
}

function renderInsurance() {
  let html = `<div class="intro"><div class="nirdesh-orb">✦</div><div><h1>Make your policy easier to use.</h1><p>Upload a policy to see plain-language coverage and an action checklist.</p></div></div>`;
  html += bot(getBotText('insuranceBotPrompt'));

  if (insuranceData.userQuery) {
    html += user(insuranceData.userQuery);
  }

  html += bot(getBotText('insuranceDetected'));

  html += `
  <div class="upload-card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="margin:0;">Uploaded Policy: Health Secure Plus.pdf</h3>
        <p style="margin:3px 0 0; color:#0b9865; font-weight:600;">✓ Policy active & recognized</p>
      </div>
      <button class="choice" id="policyDemo" style="padding:6px 12px; font-size:11px;">Change Policy</button>
    </div>
  </div>`;

  html += `
  <div class="insight-card" id="explainPolicyCard" style="border:1px solid #dce5f0; background:#fff;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; border-bottom:1px solid var(--line); padding-bottom:10px;">
      <span style="font-size:18px; color:#009dd8;">♢</span>
      <div>
        <h3 style="margin:0; font-family:'Plus Jakarta Sans'; font-size:15px; color:var(--ink);">Explain My Policy & Coverage Summary</h3>
        <small style="color:var(--muted);">Policy: Health Secure Plus (Individual Health Plan)</small>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:12px; font-size:13px; color:var(--ink); line-height:1.5;">
      <div style="background:#f2fbff; padding:12px; border-radius:8px; border:1px solid #cbeafd;">
        <strong style="color:#008cc5;">1. Coverage Details:</strong>
        <p style="margin:4px 0 0; font-size:12px;">
          In-patient hospitalisation covered up to <strong>₹5,00,000 / year</strong>. Includes ICU charges, day care procedures, and pre & post-hospitalisation expenses.
        </p>
      </div>

      <div style="background:#f7f9fc; padding:12px; border-radius:8px; border:1px solid #e2e9f3;">
        <strong style="color:#334155;">2. Waiting Periods:</strong>
        <ul style="margin:4px 0 0; padding-left:18px; font-size:12px; line-height:1.45;">
          <li>Initial Waiting Period: 30 days</li>
          <li>Pre-existing Conditions: 24 months continuous coverage required</li>
        </ul>
      </div>

      <div style="background:#f7f9fc; padding:12px; border-radius:8px; border:1px solid #e2e9f3;">
        <strong style="color:#334155;">3. Policy Limits & Co-pay:</strong>
        <p style="margin:4px 0 0; font-size:12px;">
          Normal Room Rent: Capped at <strong>₹5,000 / day</strong>. ICU Room Rent: Capped at <strong>2% of sum insured / day</strong>.
        </p>
      </div>

      <div style="background:#fff8eb; padding:12px; border-radius:8px; border:1px solid #fde68a;">
        <strong style="color:#9a6b1a;">4. Required Claim Documents:</strong>
        <ul style="margin:4px 0 0; padding-left:18px; font-size:12px; color:#78350f; line-height:1.45;">
          <li>Health Card / Photo ID Proof of Insured</li>
          <li>Doctor's Consultation & Hospital Admission Note</li>
          <li>Original Itemised Bills, Payment Receipts & Discharge Summary</li>
          <li>Pre-authorisation Form (for Cashless Claim at Network Hospitals)</li>
        </ul>
      </div>
    </div>

    <div class="choice-grid" style="margin-top:16px;">
      <button class="choice primary" id="explainPolicyBtn" style="font-weight:700; text-align:center;">Open Claim Checklist</button>
      <button class="choice" id="contactInsurerBtn" style="font-weight:700; text-align:center;">Contact Insurer / TPA</button>
    </div>
  </div>`;

  if (insuranceData.claimSubmitted) {
    html += bot(getBotText('insuranceChecklistDone'));
  }

  $('#conversation').innerHTML = html;
  bindInsurance();
}

function bindInsurance() {
  $('#policyDemo')?.addEventListener('click', () => $('#fileInput').click());
  $('#explainPolicyBtn')?.addEventListener('click', () => {
    insuranceData.claimSubmitted = true;
    journeys.insurance.progress = 75;
    journeys.insurance.steps[1][2] = 'done';
    journeys.insurance.steps[2][2] = 'current';
    updateRight();
    renderInsurance();
  });
  $('#contactInsurerBtn')?.addEventListener('click', () => {
    alert('TPA Helpline: 1800-209-5555\nEmail: claims@paytm-nirdesh-insurance.demo\nNetwork Hospitals: 4,500+ cashless centers available');
  });
}

function renderFintech() {
  let html = `<div class="intro"><div class="nirdesh-orb">✦</div><div><h1>Your money, in context.</h1><p>Turn a month of spending into a calmer plan for the next one.</p></div></div>`;
  html += bot(getBotText('fintechBotPrompt'));

  if (fintechData.userQuery) {
    html += user(fintechData.userQuery);
  }

  html += bot(getBotText('fintechDetected'));

  let insightText = botLang === 'bn'
    ? `এই মাসে আপনার <strong>খাবার ও ডাইনিং (৮,২০০ টাকা)</strong> খরচ সবচেয়ে বেশি বৃদ্ধি পেয়েছে, যা সাধারণ গড়ের চেয়ে ১,৮০০ টাকা বেশি। ডাইনিং এবং শপিং থেকে ১৫% সঞ্চয় করলে আপনার ৯০ দিনের লক্ষ্যে পৌঁছাতে মাসে <strong>৫,০০০ টাকা</strong> জমা হবে।`
    : `Your spending on <strong>Food & Dining (₹8,200)</strong> was the main driver of this month's expense increase, exceeding your usual average by ₹1,800. Redirecting 15% from dining out and shopping will help you save <strong>₹5,00,000/month</strong> towards your 90-day goal.`;

  html += `
  <div class="scenario-panel" id="spendingBreakdownPanel">
    <div class="scenario-head">
      <div>
        <h3>August Spending Breakdown</h3>
        <p>Categorized spending from connected transaction sample</p>
      </div>
      <span style="font-size:11px; font-weight:800; color:#057ea9; background:#e0f5fe; padding:4px 10px; border-radius:12px;">Total: ₹21,900</span>
    </div>

    <div class="fact-row" style="margin-top:14px; display:grid; grid-template-columns:repeat(2,1fr); gap:10px;">
      <div class="fact" style="background:#fff; border:1px solid #fecaca;">
        <small style="color:#dc2626; font-weight:700;">TOP CATEGORY — FOOD & DINING</small>
        <b style="font-size:16px; color:#b91c1c;">₹8,200</b>
        <small style="color:#991b1b; margin-top:2px;">+₹1,800 vs 3-month average</small>
      </div>
      <div class="fact" style="background:#fff; border:1px solid var(--line);">
        <small>SHOPPING</small>
        <b style="font-size:16px;">₹6,500</b>
        <small>Clothing & Electronics</small>
      </div>
      <div class="fact" style="background:#fff; border:1px solid var(--line);">
        <small>BILLS & UTILITIES</small>
        <b style="font-size:16px;">₹4,000</b>
        <small>Electricity & Internet</small>
      </div>
      <div class="fact" style="background:#fff; border:1px solid var(--line);">
        <small>TRANSPORT</small>
        <b style="font-size:16px;">₹3,200</b>
        <small>Fuel & Rides</small>
      </div>
    </div>

    <div style="margin-top:16px; background:#f0f9ff; border:1px solid #bae6fd; padding:14px; border-radius:9px; font-size:13px; color:#0369a1; line-height:1.55;">
      <strong>AI-style Spending Insight:</strong>
      <p style="margin:4px 0 0;">
        ${insightText}
      </p>
    </div>

    <button class="card-action" id="createPlanBtn" style="margin-top:16px; background:#00b9f5; font-weight:700; width:100%;">
      Create Financial Plan
    </button>
  </div>`;

  if (fintechData.planCreated) {
    html += bot(getBotText('fintechPlanDone'));
  }

  $('#conversation').innerHTML = html;
  bindFintech();
}

function bindFintech() {
  $('#createPlanBtn')?.addEventListener('click', () => {
    fintechData.planCreated = true;
    journeys.fintech.progress = 75;
    journeys.fintech.steps[2][2] = 'done';
    journeys.fintech.steps[3][2] = 'current';
    updateRight();
    renderFintech();
  });
}

function render() {
  updateRight();
  if (active === 'lending') renderLending();
  if (active === 'insurance') renderInsurance();
  if (active === 'fintech') renderFintech();
  window.scrollTo(0, 0);
}

document.querySelectorAll('[data-journey]').forEach(el => el.addEventListener('click', () => {
  active = el.dataset.journey;
  document.querySelectorAll('.journey-nav').forEach(n => n.classList.toggle('active', n.dataset.journey === active));
  render();
}));

$('#fileInput').addEventListener('change', e => {
  if (e.target.files[0]) {
    documentState.uploaded = true;
    documentState.fileName = e.target.files[0].name;
    documentState.extractedIncome = financialAssessment.income || 35000;
    journeys.lending.steps[3][1] = e.target.files[0].name;
    updateRight();
    renderLending();
  }
});

$('#uploadButton').addEventListener('click', () => $('#fileInput').click());

$('#newChat').addEventListener('click', () => {
  active = 'lending';
  lendingStage = 0;
  botLang = 'bn';
  lendingData = {
    userQuery: 'Amar ₹5 lakh loan lagbe, kintu EMI ₹12,000-er beshi dite parbo na.',
    loanAmount: 500000,
    maxEMI: 12000,
    isEditing: false
  };
  const initParsed = parseLendingRequest(lendingData.userQuery);
  lendingData.loanAmount = initParsed.amount;
  lendingData.maxEMI = initParsed.emi;
  financialAssessment = {
    income: 35000,
    expenses: 18000,
    existingEMI: 3000,
    completed: false
  };
  emiCalc = {
    loanAmount: lendingData.loanAmount,
    interestRate: 10,
    tenureMonths: 60,
    completed: false
  };
  whatIfState = {
    selectedIdx: 0,
    completed: false
  };
  aiExplanationState = {
    completed: false
  };
  documentState = {
    uploaded: false,
    fileName: '',
    extractedIncome: 35000,
    docType: 'Payslip / Income Proof',
    missingDocs: ['Bank Statement (Last 6 Months)'],
    completed: false
  };
  nextActionState = {
    completed: false
  };
  insuranceData = {
    userQuery: 'Amar hospital bill hoyeche, insurance claim korte chai.',
    policyUploaded: true,
    policyName: 'Health Secure Plus.pdf',
    claimSubmitted: false
  };
  fintechData = {
    userQuery: 'Ei mashe amar spending eto bere gelo keno?',
    planCreated: false
  };
  journeys.lending.progress = 20;
  journeys.lending.steps[0][1] = `${formatLakhText(lendingData.loanAmount)} · EMI under ${money(lendingData.maxEMI)}`;
  journeys.lending.steps[0][2] = 'current';
  journeys.lending.steps[1][2] = '';
  journeys.lending.steps[2][2] = '';
  journeys.lending.steps[3][2] = '';
  journeys.lending.steps[4][2] = '';
  document.querySelectorAll('.journey-nav').forEach(n => n.classList.toggle('active', n.dataset.journey === 'lending'));
  render();
});

$('#composer').addEventListener('submit', e => {
  e.preventDefault();
  const input = $('#messageInput');
  const val = input.value.trim();
  if (!val) return;

  botLang = detectLanguage(val);

  const lower = val.toLowerCase();

  if (lower.includes('insurance') || lower.includes('claim') || lower.includes('hospital') || lower.includes('bill')) {
    active = 'insurance';
    insuranceData.userQuery = val;
    document.querySelectorAll('.journey-nav').forEach(n => n.classList.toggle('active', n.dataset.journey === 'insurance'));
    render();
  } else if (lower.includes('spending') || lower.includes('bere') || lower.includes('khoroch') || lower.includes('expense') || lower.includes('money') || lower.includes('budget')) {
    active = 'fintech';
    fintechData.userQuery = val;
    document.querySelectorAll('.journey-nav').forEach(n => n.classList.toggle('active', n.dataset.journey === 'fintech'));
    render();
  } else if (active === 'lending' || lower.includes('loan') || lower.includes('emi') || lower.includes('lakh') || lower.includes('lac') || lower.includes('taka') || lower.includes('লাখ') || lower.includes('টাকা')) {
    active = 'lending';
    lendingData.userQuery = val;
    const parsed = parseLendingRequest(val);
    lendingData.loanAmount = parsed.amount;
    lendingData.maxEMI = parsed.emi;
    lendingData.isEditing = false;
    lendingStage = 0;
    financialAssessment = { income: 35000, expenses: 18000, existingEMI: 3000, completed: false };
    emiCalc = { loanAmount: parsed.amount, interestRate: 10, tenureMonths: 60, completed: false };
    whatIfState = { selectedIdx: 0, completed: false };
    aiExplanationState = { completed: false };
    documentState = { uploaded: false, fileName: '', extractedIncome: 35000, docType: 'Payslip / Income Proof', missingDocs: ['Bank Statement (Last 6 Months)'], completed: false };
    nextActionState = { completed: false };
    journeys.lending.progress = 20;
    journeys.lending.steps[0][1] = `${formatLakhText(lendingData.loanAmount)} · EMI under ${money(lendingData.maxEMI)}`;
    journeys.lending.steps[0][2] = 'current';
    journeys.lending.steps[1][2] = '';
    journeys.lending.steps[2][2] = '';
    journeys.lending.steps[3][2] = '';
    journeys.lending.steps[4][2] = '';
    document.querySelectorAll('.journey-nav').forEach(n => n.classList.toggle('active', n.dataset.journey === 'lending'));
    render();
  } else {
    if (active === 'insurance') {
      insuranceData.userQuery = val;
      renderInsurance();
    } else if (active === 'fintech') {
      fintechData.userQuery = val;
      renderFintech();
    } else {
      renderLending();
    }
  }
  input.value = '';
});

render();
